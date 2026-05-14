import { describe, expect, it, vi } from 'vitest'
import { useSongMaster } from './useSongMaster'

describe('useSongMaster', () => {
  it('loads song master TSV with an injectable fetcher', async () => {
    const fetcher = vi.fn(async () => ({
      text: async () => "title\tartist\tlength\nl'aster\t柚羽まくら\t300"
    }))
    const songMaster = useSongMaster({ fetcher })

    await expect(songMaster.load()).resolves.toEqual([
      { title: "l'aster", artist: '柚羽まくら', length: 300 }
    ])

    expect(fetcher).toHaveBeenCalledWith('/yz-player/songlist.tsv')
    expect(songMaster.status.value).toBe('ready')
    expect(songMaster.find("l'aster", '柚羽まくら')).toEqual({
      title: "l'aster",
      artist: '柚羽まくら',
      length: 300
    })
  })

  it('returns an empty list and error status when loading fails', async () => {
    const songMaster = useSongMaster({
      fetcher: async () => {
        throw new Error('network')
      }
    })

    await expect(songMaster.load()).resolves.toEqual([])
    expect(songMaster.status.value).toBe('error')
    expect(songMaster.error.value).toBeInstanceOf(Error)
  })
})
