import { normalizePlaylistItem } from '../playlist/playlistNormalize'
import type { PlaylistItem } from '../playlist/playlistTypes'

const PLAYLIST_FILE_APP = 'yz-player'
const PLAYLIST_FILE_VERSION = 1

export type PlaylistFile = {
  app: typeof PLAYLIST_FILE_APP
  version: typeof PLAYLIST_FILE_VERSION
  exportedAt: string
  items: PlaylistFileItem[]
}

export type PlaylistFileItem = {
  videoId: string
  title: string
  artist?: string | null
  start: number
  end: number
}

export type PlaylistFileImportResult = {
  items: PlaylistItem[]
  issues: PlaylistFileImportIssue[]
}

export type PlaylistFileImportIssue = {
  index?: number
  reason: 'invalid_json' | 'invalid_app' | 'unsupported_version' | 'invalid_items' | 'invalid_item'
}

export function exportPlaylistFile(
  items: PlaylistItem[],
  exportedAt = new Date().toISOString()
): string {
  const file: PlaylistFile = {
    app: PLAYLIST_FILE_APP,
    version: PLAYLIST_FILE_VERSION,
    exportedAt,
    items: items.map(toPlaylistFileItem)
  }

  return JSON.stringify(file, null, 2)
}

export function importPlaylistFile(text: string): PlaylistFileImportResult {
  const parsed = parseJson(text)
  if (!parsed) {
    return { items: [], issues: [{ reason: 'invalid_json' }] }
  }

  if (!isRecord(parsed) || parsed.app !== PLAYLIST_FILE_APP) {
    return { items: [], issues: [{ reason: 'invalid_app' }] }
  }

  if (parsed.version !== PLAYLIST_FILE_VERSION) {
    return { items: [], issues: [{ reason: 'unsupported_version' }] }
  }

  if (!Array.isArray(parsed.items)) {
    return { items: [], issues: [{ reason: 'invalid_items' }] }
  }

  const issues: PlaylistFileImportIssue[] = []
  const items = parsed.items
    .map((item, index) => {
      if (!isRecord(item)) {
        issues.push({ index, reason: 'invalid_item' })
        return null
      }

      const normalized = normalizePlaylistItem(
        {
          videoId: getString(item.videoId),
          title: getString(item.title),
          artist: getNullableString(item.artist),
          start: getNumberish(item.start),
          end: getNumberish(item.end),
          source: 'file'
        },
        'file'
      )

      if (!normalized) {
        issues.push({ index, reason: 'invalid_item' })
      }

      return normalized
    })
    .filter((item): item is PlaylistItem => item !== null)

  return { items, issues }
}

function toPlaylistFileItem(item: PlaylistItem): PlaylistFileItem {
  return {
    videoId: item.videoId,
    title: item.title,
    artist: item.artist ?? null,
    start: item.start,
    end: item.end
  }
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
