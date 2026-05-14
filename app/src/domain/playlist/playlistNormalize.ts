import { parseVideoId } from '../youtube/parseVideoId'
import type { PlaylistItem, PlaylistItemSource } from './playlistTypes'

const DEFAULT_DURATION_SECONDS = 360

export type PlaylistItemInput = {
  id?: string
  videoId?: string | null
  title?: string | null
  artist?: string | null
  start?: number | string | null
  end?: number | string | null
  source?: PlaylistItemSource
}

export function formatTrackName(item: Pick<PlaylistItem, 'title' | 'artist'>): string {
  return item.artist ? `${item.title} / ${item.artist}` : item.title
}

export function createDuplicateKey(item: Pick<PlaylistItem, 'videoId' | 'start' | 'end'>): string {
  return `${item.videoId}:${item.start}:${item.end}`
}

export function normalizePlaylistItem(
  input: PlaylistItemInput,
  fallbackSource: PlaylistItemSource = 'file'
): PlaylistItem | null {
  const videoId = parseVideoId(input.videoId ?? '')
  const title = input.title?.trim()
  if (!videoId || !title) return null

  const start = normalizeStart(input.start)
  const end = normalizeEnd(input.end, start)
  const artist = normalizeArtist(input.artist)

  return {
    id: input.id?.trim() || createPlaylistItemId({ videoId, title, artist, start, end }),
    videoId,
    title,
    artist,
    start,
    end,
    source: input.source ?? fallbackSource
  }
}

export function createPlaylistItemId(
  item: Pick<PlaylistItem, 'videoId' | 'title' | 'artist' | 'start' | 'end'>
): string {
  return [item.videoId, item.start, item.end, item.title, item.artist ?? ''].join(':')
}

function normalizeStart(value: number | string | null | undefined): number {
  const start = Number(value)
  return Number.isFinite(start) && start >= 0 ? start : 0
}

function normalizeEnd(value: number | string | null | undefined, start: number): number {
  const end = Number(value)
  return Number.isFinite(end) && end > start ? end : start + DEFAULT_DURATION_SECONDS
}

function normalizeArtist(value: string | null | undefined): string | null {
  const artist = value?.trim()
  return artist || null
}
