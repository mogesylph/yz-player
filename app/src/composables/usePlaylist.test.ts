import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import { PLAYLIST_STORAGE_KEY } from '../domain/storage/playlistStorage'
import { createMemoryStorage } from '../domain/storage/storageTestUtils'
import { usePlaylist } from './usePlaylist'

const playlistInput = {
  videoId: 'dQw4w9WgXcQ',
  title: "l'aster",
  artist: '柚羽まくら',
  start: 83,
  end: 383,
  source: 'setlist' as const
}

describe('usePlaylist', () => {
  it('adds items and skips duplicates', () => {
    const playlist = usePlaylist({ storage: createMemoryStorage(), autoSave: false })

    expect(playlist.addItems([playlistInput, playlistInput])).toBe(1)
    expect(playlist.items.value).toHaveLength(1)
    expect(playlist.currentItem.value?.title).toBe("l'aster")
    expect(playlist.playlistPosition.value).toBe('1/1')
  })

  it('keeps currentIndex valid when removing the current item', () => {
    const playlist = usePlaylist({ storage: createMemoryStorage(), autoSave: false })

    playlist.addItems([
      playlistInput,
      { ...playlistInput, start: 400, end: 700, title: 'second' }
    ])
    playlist.select(1)
    playlist.removeAt(1)

    expect(playlist.currentIndex.value).toBe(0)
    expect(playlist.currentItem.value?.title).toBe("l'aster")
  })

  it('persists playlist changes when autoSave is enabled', async () => {
    const storage = createMemoryStorage()
    const playlist = usePlaylist({ storage })

    playlist.addItems([playlistInput])
    await nextTick()

    expect(storage.values.has(PLAYLIST_STORAGE_KEY)).toBe(true)
  })

  it('clears items and storage', async () => {
    const storage = createMemoryStorage()
    const playlist = usePlaylist({ storage })

    playlist.addItems([playlistInput])
    await nextTick()
    playlist.clear()

    expect(playlist.items.value).toEqual([])
    expect(playlist.currentIndex.value).toBe(0)
    expect(storage.values.has(PLAYLIST_STORAGE_KEY)).toBe(false)
  })
})
