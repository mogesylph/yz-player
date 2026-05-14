import type { SongMasterItem } from './songMasterTypes'

export function parseSongMasterTsv(text: string): SongMasterItem[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line, index) => index !== 0 || !isHeaderLine(line))
    .map(parseSongMasterLine)
    .filter((item): item is SongMasterItem => item !== null)
}

function isHeaderLine(line: string): boolean {
  const [title, artist, length] = line.split('\t').map((value) => value.trim().toLowerCase())
  return title === 'title' && artist === 'artist' && length === 'length'
}

function parseSongMasterLine(line: string): SongMasterItem | null {
  const [title, artist, lengthText] = line.split('\t')
  const length = Number(lengthText)
  const normalizedTitle = title?.trim()
  const normalizedArtist = artist?.trim()

  if (!normalizedTitle || !normalizedArtist || !Number.isFinite(length)) {
    return null
  }

  return {
    title: normalizedTitle,
    artist: normalizedArtist,
    length
  }
}
