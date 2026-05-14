import { describe, expect, it } from 'vitest'
import { createMemoryStorage } from './storageTestUtils'
import {
  clearSetlistDraft,
  loadSetlistDraft,
  saveSetlistDraft,
  SETLIST_DRAFT_STORAGE_KEY
} from './setlistDraftStorage'

describe('setlistDraftStorage', () => {
  it('saves and loads a setlist draft', () => {
    const storage = createMemoryStorage()
    const draft = {
      videoInput: 'https://youtu.be/dQw4w9WgXcQ',
      rawText: "00:01:23 l'aster / 柚羽まくら",
      updatedAt: '2026-04-28T13:00:00.000Z'
    }

    saveSetlistDraft(storage, draft)

    expect(storage.values.has(SETLIST_DRAFT_STORAGE_KEY)).toBe(true)
    expect(loadSetlistDraft(storage)).toEqual(draft)
  })

  it('returns null for invalid data', () => {
    const storage = createMemoryStorage()
    storage.setItem(SETLIST_DRAFT_STORAGE_KEY, '{"videoInput":1}')

    expect(loadSetlistDraft(storage)).toBeNull()
  })

  it('clears a setlist draft', () => {
    const storage = createMemoryStorage()

    saveSetlistDraft(storage, {
      videoInput: 'dQw4w9WgXcQ',
      rawText: "00:01:23 l'aster",
      updatedAt: '2026-04-28T13:00:00.000Z'
    })
    clearSetlistDraft(storage)

    expect(storage.values.has(SETLIST_DRAFT_STORAGE_KEY)).toBe(false)
  })
})
