import { describe, expect, it } from 'vitest'
import { parseSetlist } from './parseSetlist'

const videoInput = 'https://youtu.be/dQw4w9WgXcQ'
const songMasterItems = [{ title: "l'aster", artist: '柚羽まくら', length: 300 }]

describe('parseSetlist', () => {
  it.each([
    ["00:01:23 l'aster / 柚羽まくら"],
    ["00:01:23 1. l'aster / 柚羽まくら"],
    ["【00:01:23】「l'aster」柚羽まくら"],
    ["00:01:23 l'aster／柚羽まくら"]
  ])('parses title and artist from %s', (rawText) => {
    const result = parseSetlist({ videoInput, rawText, songMasterItems })

    expect(result.issues).toEqual([])
    expect(result.items[0]).toMatchObject({
      videoId: 'dQw4w9WgXcQ',
      title: "l'aster",
      artist: '柚羽まくら',
      start: 83,
      end: 383,
      source: 'setlist'
    })
  })

  it.each([
    ["00:01:23 l'aster"],
    ["【01:23】 l'aster"],
    ["① 1:23 l'aster"],
    ["1. 01:23 l'aster"],
    ["[00:01:23] l'aster"],
    ["00:01:23\tl'aster"],
    ["00:01:23：l'aster"]
  ])('parses title without artist from %s', (rawText) => {
    const result = parseSetlist({ videoInput, rawText })

    expect(result.issues).toEqual([])
    expect(result.items[0]).toMatchObject({
      title: "l'aster",
      artist: null,
      start: 83
    })
  })

  it('returns invalid_video_id when video input is invalid', () => {
    expect(parseSetlist({ videoInput: 'invalid', rawText: "00:01:23 l'aster" })).toEqual({
      items: [],
      issues: [{ lineNumber: 0, line: 'invalid', reason: 'invalid_video_id' }]
    })
  })

  it.each([
    { videoInput: '', rawText: "00:01:23 l'aster" },
    { videoInput, rawText: '' }
  ])('does not show issues while required input is blank', (input) => {
    expect(parseSetlist(input)).toEqual({
      items: [],
      issues: []
    })
  })

  it('keeps unreadable lines as issues', () => {
    const result = parseSetlist({
      videoInput,
      rawText: "これはコメントです\n00:01:23 l'aster / 柚羽まくら",
      songMasterItems
    })

    expect(result.items).toHaveLength(1)
    expect(result.issues).toEqual([
      { lineNumber: 1, line: 'これはコメントです', reason: 'no_timestamp_match' }
    ])
  })

  it('uses next track start when song master does not match', () => {
    const result = parseSetlist({
      videoInput,
      rawText: "00:01:00 A\n00:03:00 B"
    })

    expect(result.items[0].end).toBe(180)
    expect(result.items[1].end).toBe(540)
  })
})
