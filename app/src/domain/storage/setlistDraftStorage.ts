import type { StorageLike } from './storageTypes'

export const SETLIST_DRAFT_STORAGE_KEY = 'yz-player:setlist-draft'

export type SetlistDraft = {
  videoInput: string
  rawText: string
  updatedAt: string
}

export function saveSetlistDraft(storage: StorageLike, draft: SetlistDraft): void {
  storage.setItem(SETLIST_DRAFT_STORAGE_KEY, JSON.stringify(draft))
}

export function loadSetlistDraft(storage: StorageLike): SetlistDraft | null {
  const text = storage.getItem(SETLIST_DRAFT_STORAGE_KEY)
  if (!text) return null

  const parsed = parseJson(text)
  if (!isSetlistDraft(parsed)) return null

  return parsed
}

export function clearSetlistDraft(storage: StorageLike): void {
  storage.removeItem(SETLIST_DRAFT_STORAGE_KEY)
}

function parseJson(text: string): unknown | null {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function isSetlistDraft(value: unknown): value is SetlistDraft {
  return (
    typeof value === 'object' &&
    value !== null &&
    'videoInput' in value &&
    'rawText' in value &&
    'updatedAt' in value &&
    typeof value.videoInput === 'string' &&
    typeof value.rawText === 'string' &&
    typeof value.updatedAt === 'string'
  )
}
