import { describe, expect, it } from 'vitest'
import { getNextPlaylistIndex } from './playlistNavigation'

describe('getNextPlaylistIndex', () => {
  it('returns the next index in normal mode', () => {
    expect(getNextPlaylistIndex(0, 3, 'none')).toBe(1)
  })

  it('returns null at the end in normal mode', () => {
    expect(getNextPlaylistIndex(2, 3, 'none')).toBeNull()
  })

  it('wraps at the end in all repeat mode', () => {
    expect(getNextPlaylistIndex(2, 3, 'all')).toBe(0)
  })

  it('keeps the current index in one repeat mode', () => {
    expect(getNextPlaylistIndex(1, 3, 'one')).toBe(1)
  })

  it('does not loop forever in shuffle mode with one item', () => {
    expect(getNextPlaylistIndex(0, 1, 'shuffle')).toBe(0)
  })

  it('picks a different index in shuffle mode', () => {
    expect(getNextPlaylistIndex(1, 3, 'shuffle', () => 0)).toBe(0)
  })
})
