export const YOUTUBE_IFRAME_API_SRC = 'https://www.youtube.com/iframe_api'

let loaderPromise: Promise<YouTubeNamespace> | null = null

export type YouTubePlayerStateCode = -1 | 0 | 1 | 2 | 3 | 5

export type YouTubePlayerEvent = {
  data: YouTubePlayerStateCode
  target: YouTubePlayer
}

export type YouTubePlayerErrorEvent = {
  data: number
  target: YouTubePlayer
}

export type YouTubePlayerOptions = {
  height?: string | number
  width?: string | number
  videoId?: string
  events?: {
    onReady?: (event: { target: YouTubePlayer }) => void
    onStateChange?: (event: YouTubePlayerEvent) => void
    onError?: (event: YouTubePlayerErrorEvent) => void
  }
}

export type LoadVideoByIdRequest = {
  videoId: string
  startSeconds: number
  endSeconds: number
}

export type YouTubePlayer = {
  loadVideoById: (request: LoadVideoByIdRequest) => void
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  getCurrentTime: () => number
  getVolume: () => number
  setVolume: (volume: number) => void
  isMuted: () => boolean
  mute: () => void
  unMute: () => void
  destroy: () => void
}

export type YouTubeNamespace = {
  Player: new (elementId: string, options: YouTubePlayerOptions) => YouTubePlayer
  PlayerState: {
    UNSTARTED: -1
    ENDED: 0
    PLAYING: 1
    PAUSED: 2
    BUFFERING: 3
    CUED: 5
  }
}

declare global {
  interface Window {
    YT?: YouTubeNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

export function loadYouTubeIframeApi(): Promise<YouTubeNamespace> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('YouTube IFrame API requires a browser environment'))
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT)
  }

  if (loaderPromise) {
    return loaderPromise
  }

  loaderPromise = new Promise((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady

    window.onYouTubeIframeAPIReady = () => {
      previousReady?.()
      if (window.YT?.Player) {
        resolve(window.YT)
      } else {
        reject(new Error('YouTube IFrame API loaded without YT.Player'))
      }
    }

    if (!hasYouTubeIframeScript()) {
      const tag = document.createElement('script')
      tag.src = YOUTUBE_IFRAME_API_SRC
      tag.async = true
      tag.onerror = () => {
        loaderPromise = null
        reject(new Error('Failed to load YouTube IFrame API'))
      }
      document.body.appendChild(tag)
    }
  })

  return loaderPromise
}

export function createYouTubePlayer(
  elementId: string,
  options: YouTubePlayerOptions
): Promise<YouTubePlayer> {
  return loadYouTubeIframeApi().then((YT) => new YT.Player(elementId, options))
}

export function __resetYouTubeIframeApiLoaderForTest(): void {
  loaderPromise = null
}

function hasYouTubeIframeScript(): boolean {
  return Array.from(document.scripts).some((script) => script.src === YOUTUBE_IFRAME_API_SRC)
}
