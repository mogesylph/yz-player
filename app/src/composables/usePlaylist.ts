import { computed, ref, watch } from 'vue'
import {
  createDuplicateKey,
  normalizePlaylistItem,
  type PlaylistItemInput
} from '../domain/playlist/playlistNormalize'
import type { PlaylistItem } from '../domain/playlist/playlistTypes'
import {
  clearPlaylist as clearStoredPlaylist,
  loadPlaylist,
  savePlaylist
} from '../domain/storage/playlistStorage'
import type { StorageLike } from '../domain/storage/storageTypes'

export type UsePlaylistOptions = {
  storage?: StorageLike
  autoSave?: boolean
  initialItems?: PlaylistItem[]
}

export function usePlaylist(options: UsePlaylistOptions = {}) {
  const storage = options.storage ?? globalThis.localStorage
  const autoSave = options.autoSave ?? true
  const items = ref<PlaylistItem[]>(options.initialItems ?? loadPlaylist(storage))
  const currentIndex = ref(0)

  const currentItem = computed(() => items.value[currentIndex.value] ?? null)
  const totalCount = computed(() => items.value.length)
  const playlistPosition = computed(() =>
    items.value.length === 0 ? '0/0' : `${currentIndex.value + 1}/${items.value.length}`
  )

  if (autoSave) {
    watch(
      items,
      (nextItems) => {
        savePlaylist(storage, nextItems)
      },
      { deep: true }
    )
  }

  function addItems(inputs: PlaylistItemInput[] | PlaylistItem[]): number {
    const existingKeys = new Set(items.value.map(createDuplicateKey))
    const normalizedItems = inputs
      .map((input) => normalizePlaylistItem(input, input.source ?? 'manual'))
      .filter((item): item is PlaylistItem => item !== null)
      .filter((item) => {
        const key = createDuplicateKey(item)
        if (existingKeys.has(key)) return false
        existingKeys.add(key)
        return true
      })

    if (normalizedItems.length > 0) {
      items.value = [...items.value, ...normalizedItems]
    }

    return normalizedItems.length
  }

  function removeAt(index: number): PlaylistItem | null {
    if (index < 0 || index >= items.value.length) return null

    const removed = items.value[index]
    items.value = items.value.filter((_, itemIndex) => itemIndex !== index)

    if (items.value.length === 0) {
      currentIndex.value = 0
    } else if (index < currentIndex.value) {
      currentIndex.value -= 1
    } else if (currentIndex.value >= items.value.length) {
      currentIndex.value = items.value.length - 1
    }

    return removed
  }

  function clear(): void {
    items.value = []
    currentIndex.value = 0
    clearStoredPlaylist(storage)
  }

  function select(index: number): PlaylistItem | null {
    if (index < 0 || index >= items.value.length) return null
    currentIndex.value = index
    return items.value[index]
  }

  function replaceAll(nextItems: PlaylistItemInput[] | PlaylistItem[]): void {
    items.value = []
    currentIndex.value = 0
    addItems(nextItems)
  }

  return {
    items,
    currentIndex,
    currentItem,
    totalCount,
    playlistPosition,
    addItems,
    removeAt,
    clear,
    select,
    replaceAll
  }
}
