import { describe, expect, it } from 'vitest'
import { completeTrackEnds } from './completeTrackEnds'
import type { ParsedSetlistLine } from './setlistTypes'

const baseEntry = {
  lineNumber: 1,
  rawLine: ''
}

describe('completeTrackEnds', () => {
  it('uses song master length when matched', () => {
    const [item] = completeTrackEnds(
      [
        {
          ...baseEntry,
          start: 83,
          title: "l'aster",
          artist: '柚羽まくら'
        }
      ],
      [{ title: "l'aster", artist: '柚羽まくら', length: 300 }]
    )

    expect(item.end).toBe(383)
  })

  it('uses the next start when the next entry is less than 360 seconds away', () => {
    const entries: ParsedSetlistLine[] = [
      { ...baseEntry, start: 100, title: 'A', artist: null },
      { ...baseEntry, lineNumber: 2, start: 220, title: 'B', artist: null }
    ]

    expect(completeTrackEnds(entries, [])[0].end).toBe(220)
  })

  it('uses start plus 360 when the next entry is too far away', () => {
    const entries: ParsedSetlistLine[] = [
      { ...baseEntry, start: 100, title: 'A', artist: null },
      { ...baseEntry, lineNumber: 2, start: 600, title: 'B', artist: null }
    ]

    expect(completeTrackEnds(entries, [])[0].end).toBe(460)
  })
})
