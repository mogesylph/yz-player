import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  __resetYouTubeIframeApiLoaderForTest,
  loadYouTubeIframeApi,
  YOUTUBE_IFRAME_API_SRC,
  type YouTubeNamespace
} from './youTubeIframe'

type ScriptNode = {
  src: string
  async: boolean
  onerror?: () => void
}

type FakeDocument = {
  scripts: ScriptNode[]
  body: {
    appendChild: (script: ScriptNode) => void
  }
  createElement: (tagName: string) => ScriptNode
}

describe('loadYouTubeIframeApi', () => {
  afterEach(() => {
    __resetYouTubeIframeApiLoaderForTest()
    vi.unstubAllGlobals()
  })

  it('reuses the same loading promise and appends one script', () => {
    const fakeDocument = createFakeDocument()
    const fakeWindow: Window = {} as Window

    vi.stubGlobal('document', fakeDocument)
    vi.stubGlobal('window', fakeWindow)

    const firstPromise = loadYouTubeIframeApi()
    const secondPromise = loadYouTubeIframeApi()

    expect(firstPromise).toBe(secondPromise)
    expect(fakeDocument.scripts).toHaveLength(1)
    expect(fakeDocument.scripts[0].src).toBe(YOUTUBE_IFRAME_API_SRC)
  })

  it('resolves immediately when YT.Player already exists', async () => {
    const fakeYoutube = createFakeYouTubeNamespace()

    vi.stubGlobal('window', { YT: fakeYoutube })
    vi.stubGlobal('document', createFakeDocument())

    await expect(loadYouTubeIframeApi()).resolves.toBe(fakeYoutube)
  })

  it('resolves when the iframe callback runs', async () => {
    const fakeDocument = createFakeDocument()
    const fakeYoutube = createFakeYouTubeNamespace()
    const fakeWindow: Window = {} as Window

    vi.stubGlobal('document', fakeDocument)
    vi.stubGlobal('window', fakeWindow)

    const promise = loadYouTubeIframeApi()
    fakeWindow.YT = fakeYoutube
    fakeWindow.onYouTubeIframeAPIReady?.()

    await expect(promise).resolves.toBe(fakeYoutube)
  })
})

function createFakeDocument(): FakeDocument {
  const scripts: ScriptNode[] = []

  return {
    scripts,
    body: {
      appendChild: (script) => {
        scripts.push(script)
      }
    },
    createElement: () => ({
      src: '',
      async: false
    })
  }
}

function createFakeYouTubeNamespace(): YouTubeNamespace {
  return {
    Player: class {
      loadVideoById() {}
      playVideo() {}
      pauseVideo() {}
      stopVideo() {}
      getCurrentTime() {
        return 0
      }
      getVolume() {
        return 100
      }
      setVolume() {}
      isMuted() {
        return false
      }
      mute() {}
      unMute() {}
      destroy() {}
    },
    PlayerState: {
      UNSTARTED: -1,
      ENDED: 0,
      PLAYING: 1,
      PAUSED: 2,
      BUFFERING: 3,
      CUED: 5
    }
  }
}
