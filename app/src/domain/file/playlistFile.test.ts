import { describe, expect, it } from 'vitest'
import type { PlaylistItem } from '../playlist/playlistTypes'
import { exportPlaylistFile, importPlaylistFile } from './playlistFile'

const item: PlaylistItem = {
  id: 'item-1',
  videoId: 'dQw4w9WgXcQ',
  title: "l'aster",
  artist: '柚羽まくら',
  start: 83,
  end: 383,
  source: 'setlist'
}

describe('playlistFile', () => {
  it('exports and imports the versioned JSON format', () => {
    const text = exportPlaylistFile([item], '2026-04-28T13:00:00.000Z')
    const parsed = JSON.parse(text)

    expect(parsed).toEqual({
      app: 'yz-player',
      version: 1,
      exportedAt: '2026-04-28T13:00:00.000Z',
      items: [
        {
          videoId: 'dQw4w9WgXcQ',
          title: "l'aster",
          artist: '柚羽まくら',
          start: 83,
          end: 383
        }
      ]
    })

    const result = importPlaylistFile(text)
    expect(result.issues).toEqual([])
    expect(result.items[0]).toMatchObject({
      videoId: 'dQw4w9WgXcQ',
      title: "l'aster",
      artist: '柚羽まくら',
      start: 83,
      end: 383,
      source: 'file'
    })
  })

  it('normalizes invalid end to start plus 360', () => {
    const result = importPlaylistFile(
      JSON.stringify({
        app: 'yz-player',
        version: 1,
        exportedAt: '2026-04-28T13:00:00.000Z',
        items: [{ videoId: 'dQw4w9WgXcQ', title: "l'aster", start: 83, end: 0 }]
      })
    )

    expect(result.items[0].end).toBe(443)
  })

  it('drops empty title and invalid video id items', () => {
    const result = importPlaylistFile(
      JSON.stringify({
        app: 'yz-player',
        version: 1,
        exportedAt: '2026-04-28T13:00:00.000Z',
        items: [
          { videoId: 'dQw4w9WgXcQ', title: '', start: 0, end: 10 },
          { videoId: 'invalid', title: "l'aster", start: 0, end: 10 }
        ]
      })
    )

    expect(result.items).toEqual([])
    expect(result.issues).toEqual([
      { index: 0, reason: 'invalid_item' },
      { index: 1, reason: 'invalid_item' }
    ])
  })

  it('reports unsupported files', () => {
    expect(importPlaylistFile('not json').issues).toEqual([{ reason: 'invalid_json' }])
    expect(importPlaylistFile(JSON.stringify({ app: 'other', version: 1, items: [] })).issues).toEqual([
      { reason: 'invalid_app' }
    ])
    expect(
      importPlaylistFile(JSON.stringify({ app: 'yz-player', version: 2, items: [] })).issues
    ).toEqual([{ reason: 'unsupported_version' }])
  })
})
