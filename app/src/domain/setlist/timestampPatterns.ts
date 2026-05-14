import type { TimestampPattern } from './setlistTypes'

export const timestampPatterns: TimestampPattern[] = [
  {
    id: 'bracketed-time-quoted-title-artist',
    label: '【hh:mm:ss】「曲名」アーティスト',
    examples: ["【00:01:23】「l'aster」柚羽まくら"],
    regex: /^【(\d{1,2}:\d{2}:\d{2})】「(.+)」(.+)$/,
    parse: (match) => ({
      startText: match[1],
      titleText: match[2],
      artistText: match[3]
    })
  },
  {
    id: 'time-numbered-title-slash-artist',
    label: 'hh:mm:ss 1. 曲名 / アーティスト',
    examples: ["00:01:23 1. l'aster / 柚羽まくら"],
    regex: /^(\d{1,2}:\d{2}:\d{2})\s+\d+\.\s*(.+?)\s*[／/]\s*(.+)$/,
    parse: (match) => ({
      startText: match[1],
      titleText: match[2],
      artistText: match[3]
    })
  },
  {
    id: 'time-title-slash-artist',
    label: 'hh:mm:ss 曲名 / アーティスト',
    examples: ["00:01:23 l'aster / 柚羽まくら"],
    regex: /^(\d{1,2}:\d{2}:\d{2})\s+(.+?)\s*[／/]\s*(.+)$/,
    parse: (match) => ({
      startText: match[1],
      titleText: match[2],
      artistText: match[3]
    })
  },
  {
    id: 'bracketed-mmss-title',
    label: '【mm:ss】 曲名',
    examples: ["【01:23】 l'aster"],
    regex: /^【(\d{1,2}:\d{2})】\s+(.+)$/,
    parse: (match) => ({
      startText: match[1],
      titleText: match[2]
    })
  },
  {
    id: 'circled-number-mmss-title',
    label: '番号 mm:ss 曲名',
    examples: ["① 1:23 l'aster"],
    regex: /^[①-⑳]?\s*(\d{1,2}:\d{2})\s+(.+)$/,
    parse: (match) => ({
      startText: match[1],
      titleText: match[2]
    })
  },
  {
    id: 'numbered-time-title',
    label: '1. mm:ss 曲名',
    examples: ["1. 01:23 l'aster"],
    regex: /^\d+\s*\.\s*(\d{1,2}:\d{2}(?::\d{2})?)\s+(.+)$/,
    parse: (match) => ({
      startText: match[1],
      titleText: match[2]
    })
  },
  {
    id: 'square-bracketed-time-title',
    label: '[hh:mm:ss] 曲名',
    examples: ["[00:01:23] l'aster"],
    regex: /^\[(\d{1,2}:\d{2}:\d{2})\]\s+(.+)$/,
    parse: (match) => ({
      startText: match[1],
      titleText: match[2]
    })
  },
  {
    id: 'time-tab-title',
    label: 'hh:mm:ss<TAB>曲名',
    examples: ["00:01:23\tl'aster"],
    regex: /^(\d{1,2}:\d{2}:\d{2})\t(.+)$/,
    parse: (match) => ({
      startText: match[1],
      titleText: match[2]
    })
  },
  {
    id: 'time-japanese-colon-title',
    label: 'hh:mm:ss：曲名',
    examples: ["00:01:23：l'aster"],
    regex: /^(\d{1,2}:\d{2}:\d{2})：(.+)$/,
    parse: (match) => ({
      startText: match[1],
      titleText: match[2]
    })
  },
  {
    id: 'time-title',
    label: 'hh:mm:ss 曲名',
    examples: ["00:01:23 l'aster"],
    regex: /^(\d{1,2}:\d{2}:\d{2})\s+(.+)$/,
    parse: (match) => ({
      startText: match[1],
      titleText: match[2]
    })
  }
]
