import { describe, expect, it } from 'vitest'
import type { PlaylistItem } from '../playlist/playlistTypes'
import { createMemoryStorage } from './storageTestUtils'
import {
  clearPlaylist,
  loadPlaylist,
  PLAYLIST_STORAGE_KEY,
  savePlaylist
} from './playlistStorage'

const item: PlaylistItem = {
  id: 'item-1',
  videoId: 'dQw4w9WgXcQ',
  title: "l'aster",
  artist: '柚羽まくら',
  start: 83,
  end: 383,
  source: 'setlist'
}

describe('playlistStorage', () => {
  it('saves and loads playlist items', () => {
    const storage = createMemoryStorage()

    savePlaylist(storage, [item])

    expect(storage.values.has(PLAYLIST_STORAGE_KEY)).toBe(true)
    expect(loadPlaylist(storage)[0]).toMatchObject({
      id: 'item-1',
      videoId: 'dQw4w9WgXcQ',
      title: "l'aster",
      artist: '柚羽まくら',
      start: 83,
      end: 383
    })
  })

  it('returns an empty playlist for invalid JSON', () => {
    const storage = createMemoryStorage()
    storage.setItem(PLAYLIST_STORAGE_KEY, 'not json')

    expect(loadPlaylist(storage)).toEqual([])
  })

  it('clears the playlist key', () => {
    const storage = createMemoryStorage()
    savePlaylist(storage, [item])
    clearPlaylist(storage)

    expect(storage.values.has(PLAYLIST_STORAGE_KEY)).toBe(false)
  })
})
