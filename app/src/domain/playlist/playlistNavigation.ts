import type { PlayMode } from './playlistTypes'

export function getNextPlaylistIndex(
  currentIndex: number,
  totalCount: number,
  playMode: PlayMode,
  random: () => number = Math.random
): number | null {
  if (totalCount <= 0) return null

  const normalizedCurrent = clampIndex(currentIndex, totalCount)

  if (playMode === 'one') {
    return normalizedCurrent
  }

  if (playMode === 'shuffle') {
    if (totalCount === 1) return normalizedCurrent
    return pickDifferentIndex(normalizedCurrent, totalCount, random)
  }

  const nextIndex = normalizedCurrent + 1
  if (nextIndex < totalCount) {
    return nextIndex
  }

  return playMode === 'all' ? 0 : null
}

function clampIndex(index: number, totalCount: number): number {
  if (index < 0) return 0
  if (index >= totalCount) return totalCount - 1
  return index
}

function pickDifferentIndex(
  currentIndex: number,
  totalCount: number,
  random: () => number
): number {
  const candidate = Math.floor(random() * (totalCount - 1))
  return candidate >= currentIndex ? candidate + 1 : candidate
}
