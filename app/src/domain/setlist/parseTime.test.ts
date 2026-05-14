import { describe, expect, it } from 'vitest'
import { parseTime } from './parseTime'

describe('parseTime', () => {
  it('parses mm:ss', () => {
    expect(parseTime('1:56')).toBe(116)
  })

  it('parses hh:mm:ss', () => {
    expect(parseTime('01:02:03')).toBe(3723)
  })

  it('returns null for invalid text', () => {
    expect(parseTime('x:y')).toBeNull()
  })
})
