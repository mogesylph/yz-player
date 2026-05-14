const EMOJI_PATTERN = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu

export function normalizeSetlistLine(line: string): string {
  return line.replace(EMOJI_PATTERN, '').trim().replace(/[ \u3000]+/g, ' ')
}

export function normalizeTitleArtist(
  titleText: string,
  artistText?: string | null
): { title: string; artist: string | null } {
  const titleWithArtist = titleText.trim()
  const artist = artistText?.trim()

  if (artist) {
    return {
      title: titleWithArtist,
      artist
    }
  }

  const separatorMatch = titleWithArtist.match(/[／/]/)
  if (!separatorMatch || separatorMatch.index === undefined) {
    return {
      title: titleWithArtist,
      artist: null
    }
  }

  const separatorIndex = separatorMatch.index
  const title = titleWithArtist.slice(0, separatorIndex).trim()
  const splitArtist = titleWithArtist.slice(separatorIndex + 1).trim()

  return {
    title,
    artist: splitArtist || null
  }
}
