import { describe, expect, it } from 'vitest'
import { SETLIST_DRAFT_STORAGE_KEY } from '../domain/storage/setlistDraftStorage'
import { createMemoryStorage } from '../domain/storage/storageTestUtils'
import { useSetlistDraft } from './useSetlistDraft'

describe('useSetlistDraft', () => {
  it('saves, reloads, and clears a draft', () => {
    const storage = createMemoryStorage()
    const draft = useSetlistDraft({
      storage,
      now: () => '2026-04-28T13:00:00.000Z'
    })

    expect(
      draft.save('https://youtu.be/dQw4w9WgXcQ', "00:01:23 l'aster / 柚羽まくら")
    ).toEqual({
      videoInput: 'https://youtu.be/dQw4w9WgXcQ',
      rawText: "00:01:23 l'aster / 柚羽まくら",
      updatedAt: '2026-04-28T13:00:00.000Z'
    })
    expect(storage.values.has(SETLIST_DRAFT_STORAGE_KEY)).toBe(true)

    draft.draft.value = null
    expect(draft.reload()?.rawText).toBe("00:01:23 l'aster / 柚羽まくら")

    draft.clear()
    expect(draft.draft.value).toBeNull()
    expect(storage.values.has(SETLIST_DRAFT_STORAGE_KEY)).toBe(false)
  })
})
