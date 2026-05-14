import { computed, ref } from 'vue'
import { createSongMasterMap, findSongMasterItem } from '../domain/song-master/songMatcher'
import type { SongMasterItem } from '../domain/song-master/songMasterTypes'
import { parseSongMasterTsv } from '../domain/song-master/parseSongMasterTsv'

export type SongMasterStatus = 'idle' | 'loading' | 'ready' | 'error'

export type UseSongMasterOptions = {
  url?: string
  fetcher?: (url: string) => Promise<{ text: () => Promise<string> }>
}

export function useSongMaster(options: UseSongMasterOptions = {}) {
  const url = options.url ?? `${import.meta.env.BASE_URL}songlist.tsv`
  const fetcher = options.fetcher ?? fetch
  const items = ref<SongMasterItem[]>([])
  const status = ref<SongMasterStatus>('idle')
  const error = ref<unknown>(null)
  const songMap = computed(() => createSongMasterMap(items.value))

  async function load(): Promise<SongMasterItem[]> {
    status.value = 'loading'
    error.value = null

    try {
      const response = await fetcher(url)
      const text = await response.text()
      items.value = parseSongMasterTsv(text)
      status.value = 'ready'
      return items.value
    } catch (caughtError) {
      error.value = caughtError
      items.value = []
      status.value = 'error'
      return []
    }
  }

  function find(title: string, artist?: string | null): SongMasterItem | null {
    return findSongMasterItem(songMap.value, title, artist)
  }

  return {
    items,
    status,
    error,
    songMap,
    load,
    find
  }
}
