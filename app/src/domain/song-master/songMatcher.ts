import type { SongMasterItem, SongMasterMap } from './songMasterTypes'

export function createSongMasterKey(title: string, artist?: string | null): string {
  return `${title.trim()}__${artist?.trim() || ''}`
}

export function createSongMasterMap(items: SongMasterItem[]): SongMasterMap {
  return new Map(items.map((item) => [createSongMasterKey(item.title, item.artist), item]))
}

export function findSongMasterItem(
  songMap: SongMasterMap,
  title: string,
  artist?: string | null
): SongMasterItem | null {
  return songMap.get(createSongMasterKey(title, artist)) ?? null
}
