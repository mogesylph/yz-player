import { describe, expect, it } from 'vitest'
import { parseVideoId } from './parseVideoId'

describe('parseVideoId', () => {
  it('accepts an 11 character video id', () => {
    expect(parseVideoId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('extracts from a youtu.be URL', () => {
    expect(parseVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('extracts from a watch URL', () => {
    expect(parseVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ'
    )
  })

  it('returns null for invalid input', () => {
    expect(parseVideoId('invalid')).toBeNull()
  })
})
