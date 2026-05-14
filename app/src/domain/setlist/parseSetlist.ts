import { createPlaylistItemId } from '../playlist/playlistNormalize'
import type { PlaylistItem } from '../playlist/playlistTypes'
import type { SongMasterItem } from '../song-master/songMasterTypes'
import { parseVideoId } from '../youtube/parseVideoId'
import { completeTrackEnds } from './completeTrackEnds'
import { normalizeSetlistLine, normalizeTitleArtist } from './normalizeSetlistLine'
import { parseTime } from './parseTime'
import type { ParsedSetlistLine, ParseIssue, SetlistParseResult } from './setlistTypes'
import { timestampPatterns } from './timestampPatterns'

export type ParseSetlistInput = {
  videoInput: string
  rawText: string
  songMasterItems?: SongMasterItem[]
}

export function parseSetlist({
  videoInput,
  rawText,
  songMasterItems = []
}: ParseSetlistInput): SetlistParseResult {
  if (!videoInput.trim() || !rawText.trim()) {
    return {
      items: [],
      issues: []
    }
  }

  const videoId = parseVideoId(videoInput)
  if (!videoId) {
    return {
      items: [],
      issues: [{ lineNumber: 0, line: videoInput, reason: 'invalid_video_id' }]
    }
  }

  const issues: ParseIssue[] = []
  const parsedLines: ParsedSetlistLine[] = []

  rawText.split(/\r?\n/).forEach((rawLine, index) => {
    const lineNumber = index + 1
    const normalizedLine = normalizeSetlistLine(rawLine)

    if (!normalizedLine) {
      return
    }

    const parsedLine = parseSetlistLine(normalizedLine, rawLine, lineNumber)
    if (isParseIssue(parsedLine)) {
      issues.push(parsedLine)
      return
    }

    parsedLines.push(parsedLine)
  })

  const completedLines = completeTrackEnds(parsedLines, songMasterItems)
  const items = completedLines.map<PlaylistItem>((entry) => {
    const item = {
      videoId,
      title: entry.title,
      artist: entry.artist ?? null,
      start: entry.start,
      end: entry.end
    }

    return {
      ...item,
      id: createPlaylistItemId(item),
      source: 'setlist'
    }
  })

  return {
    items,
    issues
  }
}

function parseSetlistLine(
  normalizedLine: string,
  rawLine: string,
  lineNumber: number
): ParsedSetlistLine | ParseIssue {
  for (const pattern of timestampPatterns) {
    const match = normalizedLine.match(pattern.regex)
    if (!match) continue

    const patternMatch = pattern.parse(match)
    const start = parseTime(patternMatch.startText)
    if (start === null) {
      return { lineNumber, line: rawLine, reason: 'invalid_time' }
    }

    const { title, artist } = normalizeTitleArtist(
      patternMatch.titleText,
      patternMatch.artistText
    )
    if (!title) {
      return { lineNumber, line: rawLine, reason: 'empty_title' }
    }

    return {
      lineNumber,
      rawLine,
      start,
      title,
      artist
    }
  }

  return { lineNumber, line: rawLine, reason: 'no_timestamp_match' }
}

function isParseIssue(value: ParsedSetlistLine | ParseIssue): value is ParseIssue {
  return 'reason' in value
}
