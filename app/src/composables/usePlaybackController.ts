import { computed, ref } from 'vue'
import { getNextPlaylistIndex } from '../domain/playlist/playlistNavigation'
import type { PlayMode } from '../domain/playlist/playlistTypes'

const PLAY_MODES: PlayMode[] = ['none', 'all', 'one', 'shuffle']

export function usePlaybackController(initialMode: PlayMode = 'none') {
  const playMode = ref<PlayMode>(initialMode)
  const playModeLabel = computed(() => getPlayModeLabel(playMode.value))

  function cyclePlayMode(): PlayMode {
    const nextIndex = (PLAY_MODES.indexOf(playMode.value) + 1) % PLAY_MODES.length
    playMode.value = PLAY_MODES[nextIndex]
    return playMode.value
  }

  function setPlayMode(nextMode: PlayMode): void {
    playMode.value = nextMode
  }

  function getNextIndex(
    currentIndex: number,
    totalCount: number,
    random?: () => number
  ): number | null {
    return getNextPlaylistIndex(currentIndex, totalCount, playMode.value, random)
  }

  return {
    playMode,
    playModeLabel,
    cyclePlayMode,
    setPlayMode,
    getNextIndex
  }
}

function getPlayModeLabel(playMode: PlayMode): string {
  switch (playMode) {
    case 'all':
      return '全曲リピート'
    case 'one':
      return '1曲リピート'
    case 'shuffle':
      return 'シャッフル'
    default:
      return '通常再生'
  }
}
