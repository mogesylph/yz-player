import { ref } from 'vue'
import {
  clearSetlistDraft,
  loadSetlistDraft,
  saveSetlistDraft,
  type SetlistDraft
} from '../domain/storage/setlistDraftStorage'
import type { StorageLike } from '../domain/storage/storageTypes'

export type UseSetlistDraftOptions = {
  storage?: StorageLike
  now?: () => string
}

export function useSetlistDraft(options: UseSetlistDraftOptions = {}) {
  const storage = options.storage ?? globalThis.localStorage
  const now = options.now ?? (() => new Date().toISOString())
  const draft = ref<SetlistDraft | null>(loadSetlistDraft(storage))

  function save(videoInput: string, rawText: string): SetlistDraft {
    const nextDraft = {
      videoInput,
      rawText,
      updatedAt: now()
    }

    draft.value = nextDraft
    saveSetlistDraft(storage, nextDraft)
    return nextDraft
  }

  function clear(): void {
    draft.value = null
    clearSetlistDraft(storage)
  }

  function reload(): SetlistDraft | null {
    draft.value = loadSetlistDraft(storage)
    return draft.value
  }

  return {
    draft,
    save,
    clear,
    reload
  }
}
