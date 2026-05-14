import { normalizePlaylistItem } from '../playlist/playlistNormalize'
import type { PlaylistItem } from '../playlist/playlistTypes'
import type { StorageLike } from './storageTypes'

export const PLAYLIST_STORAGE_KEY = 'yz-player:playlist'

export function savePlaylist(storage: StorageLike, items: PlaylistItem[]): void {
  storage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(items))
}

export function loadPlaylist(storage: StorageLike): PlaylistItem[] {
  const text = storage.getItem(PLAYLIST_STORAGE_KEY)
  if (!text) return []

  const parsed = parseJson(text)
  if (!Array.isArray(parsed)) return []

  return parsed
    .map((item) => {
      if (!isRecord(item)) return null

      return normalizePlaylistItem(
        {
          id: getString(item.id) ?? undefined,
          videoId: getString(item.videoId),
          title: getString(item.title),
          artist: getNullableString(item.artist),
          start: getNumberish(item.start),
          end: getNumberish(item.end),
          source: 'file'
        },
        'file'
      )
    })
    .filter((item): item is PlaylistItem => item !== null)
}

export function clearPlaylist(storage: StorageLike): void {
  storage.removeItem(PLAYLIST_STORAGE_KEY)
}

function parseJson(text: string): unknown | null {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function getNullableString(value: unknown): string | null {
  return value === null || value === undefined || typeof value === 'string' ? value ?? null : null
}

function getNumberish(value: unknown): string | number | null {
  return typeof value === 'string' || typeof value === 'number' ? value : null
}
