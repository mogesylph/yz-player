export type PlaylistItemSource = 'setlist' | 'file' | 'manual'

export type PlaylistItem = {
  id: string
  videoId: string
  title: string
  artist?: string | null
  start: number
  end: number
  source: PlaylistItemSource
  createdAt?: string
  updatedAt?: string
}

export type PlayMode = 'none' | 'all' | 'one' | 'shuffle'

export type PlaybackRequest = {
  videoId: string
  startSeconds: number
  endSeconds: number
}
