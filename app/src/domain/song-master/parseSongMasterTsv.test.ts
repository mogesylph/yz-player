import { describe, expect, it } from 'vitest'
import { parseSongMasterTsv } from './parseSongMasterTsv'

describe('parseSongMasterTsv', () => {
  it('skips the header row and parses valid rows', () => {
    expect(parseSongMasterTsv("title\tartist\tlength\nl'aster\t柚羽まくら\t300")).toEqual([
      {
        title: "l'aster",
        artist: '柚羽まくら',
        length: 300
      }
    ])
  })

  it('drops invalid rows', () => {
    expect(parseSongMasterTsv("title\tartist\tlength\nmissing\t柚羽まくら\tinvalid")).toEqual([])
  })
})
