import type { PlaylistItem } from '../playlist/playlistTypes'

export type ParsedSetlistLine = {
  lineNumber: number
  rawLine: string
  start: number
  title: string
  artist?: string | null
}

export type ParseIssueReason =
  | 'empty_line'
  | 'no_timestamp_match'
  | 'invalid_time'
  | 'empty_title'
  | 'invalid_video_id'

export type ParseIssue = {
  lineNumber: number
  line: string
  reason: ParseIssueReason
}

export type SetlistParseResult = {
  items: PlaylistItem[]
  issues: ParseIssue[]
}

export type TimestampPatternMatch = {
  startText: string
  titleText: string
  artistText?: string | null
}

export type TimestampPattern = {
  id: string
  label: string
  examples: string[]
  regex: RegExp
  parse: (match: RegExpMatchArray) => TimestampPatternMatch
}
