import { createSongMasterMap, findSongMasterItem } from '../song-master/songMatcher'
import type { SongMasterItem } from '../song-master/songMasterTypes'
import type { ParsedSetlistLine } from './setlistTypes'

export const MAX_TIME_GAP_SECONDS = 360

export type CompletedSetlistLine = ParsedSetlistLine & {
  end: number
}

export function completeTrackEnds(
  entries: ParsedSetlistLine[],
  songMasterItems: SongMasterItem[],
  maxTimeGapSeconds = MAX_TIME_GAP_SECONDS
): CompletedSetlistLine[] {
  const songMap = createSongMasterMap(songMasterItems)

  return entries.map((entry, index) => {
    const song = findSongMasterItem(songMap, entry.title, entry.artist)
    if (song) {
      return {
        ...entry,
        end: entry.start + song.length
      }
    }

    const nextEntry = entries[index + 1]
    if (nextEntry) {
      const gap = nextEntry.start - entry.start
      return {
        ...entry,
        end: gap > 0 && gap < maxTimeGapSeconds ? nextEntry.start : entry.start + maxTimeGapSeconds
      }
    }

    return {
      ...entry,
      end: entry.start + maxTimeGapSeconds
    }
  })
}
