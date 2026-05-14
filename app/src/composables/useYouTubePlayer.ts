import { onBeforeUnmount, readonly, ref } from 'vue'
import type { PlaybackRequest } from '../domain/playlist/playlistTypes'
import {
  createYouTubePlayer,
  type YouTubePlayer,
  type YouTubePlayerErrorEvent,
  type YouTubePlayerEvent
} from '../domain/youtube/youTubeIframe'

const CURRENT_TIME_POLL_INTERVAL_MS = 500

export type YouTubePlayerStatus = 'idle' | 'loading' | 'ready' | 'error'

export type UseYouTubePlayerOptions = {
  onEnded?: () => void
  onError?: (errorCode: number) => void
}

export function useYouTubePlayer(options: UseYouTubePlayerOptions = {}) {
  const player = ref<YouTubePlayer | null>(null)
  const status = ref<YouTubePlayerStatus>('idle')
  const playing = ref(false)
  const currentTime = ref(0)
  const currentVolume = ref(100)
  const muted = ref(false)
  const errorCode = ref<number | null>(null)

  let currentTimeTimer: ReturnType<typeof window.setInterval> | null = null

  async function initialize(elementId: string): Promise<void> {
    if (player.value) return

    status.value = 'loading'
    errorCode.value = null

    try {
      player.value = await createYouTubePlayer(elementId, {
        height: '360',
        width: '640',
        videoId: '',
        events: {
          onReady: () => {
            status.value = 'ready'
            currentVolume.value = player.value?.getVolume() ?? 100
          },
          onStateChange: handleStateChange,
          onError: handleError
        }
      })
    } catch {
      status.value = 'error'
    }
  }

  function loadClip(request: PlaybackRequest): void {
    errorCode.value = null
    if (status.value === 'error') {
      status.value = 'ready'
    }
    player.value?.loadVideoById({
      videoId: request.videoId,
      startSeconds: request.startSeconds,
      endSeconds: request.endSeconds
    })
  }

  function play(): void {
    player.value?.playVideo()
  }

  function pause(): void {
    player.value?.pauseVideo()
  }

  function stop(): void {
    player.value?.stopVideo()
    stopCurrentTimePolling()
    playing.value = false
  }

  function setVolume(volume: number): void {
    const normalizedVolume = Math.max(0, Math.min(100, volume))
    player.value?.setVolume(normalizedVolume)
    currentVolume.value = normalizedVolume
  }

  function volumeUp(step = 10): void {
    setVolume(currentVolume.value + step)
  }

  function volumeDown(step = 10): void {
    setVolume(currentVolume.value - step)
  }

  function mute(): void {
    player.value?.mute()
    muted.value = true
  }

  function unMute(): void {
    player.value?.unMute()
    muted.value = false
  }

  function toggleMute(): void {
    if (player.value?.isMuted()) {
      unMute()
    } else {
      mute()
    }
  }

  function destroy(): void {
    stopCurrentTimePolling()
    player.value?.destroy()
    player.value = null
    status.value = 'idle'
    playing.value = false
  }

  function handleStateChange(event: YouTubePlayerEvent): void {
    const state = event.data

    if (state === 1) {
      playing.value = true
      startCurrentTimePolling()
      return
    }

    if (state === 0) {
      playing.value = false
      stopCurrentTimePolling()
      options.onEnded?.()
      return
    }

    playing.value = false
    stopCurrentTimePolling()
  }

  function handleError(event: YouTubePlayerErrorEvent): void {
    errorCode.value = event.data
    playing.value = false
    stopCurrentTimePolling()
    options.onError?.(event.data)
  }

  function startCurrentTimePolling(): void {
    stopCurrentTimePolling()
    currentTimeTimer = window.setInterval(() => {
      currentTime.value = player.value?.getCurrentTime() ?? currentTime.value
    }, CURRENT_TIME_POLL_INTERVAL_MS)
  }

  function stopCurrentTimePolling(): void {
    if (currentTimeTimer !== null) {
      window.clearInterval(currentTimeTimer)
      currentTimeTimer = null
    }
  }

  onBeforeUnmount(() => {
    destroy()
  })

  return {
    status: readonly(status),
    playing: readonly(playing),
    currentTime: readonly(currentTime),
    currentVolume: readonly(currentVolume),
    muted: readonly(muted),
    errorCode: readonly(errorCode),
    initialize,
    loadClip,
    play,
    pause,
    stop,
    setVolume,
    volumeUp,
    volumeDown,
    mute,
    unMute,
    toggleMute,
    destroy
  }
}
