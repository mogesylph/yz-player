<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useSetlistDraft } from '../../composables/useSetlistDraft'
import type { PlaylistItem } from '../../domain/playlist/playlistTypes'
import { parseSetlist } from '../../domain/setlist/parseSetlist'
import type { SongMasterItem } from '../../domain/song-master/songMasterTypes'
import SetlistInputForm from './SetlistInputForm.vue'
import SetlistParsePreview from './SetlistParsePreview.vue'

const props = defineProps<{
  songMasterItems: SongMasterItem[]
}>()

const emit = defineEmits<{
  close: []
  addItems: [items: PlaylistItem[]]
}>()

const setlistDraft = useSetlistDraft()
const videoInput = ref(setlistDraft.draft.value?.videoInput ?? '')
const rawText = ref(setlistDraft.draft.value?.rawText ?? '')

const parseResult = computed(() =>
  parseSetlist({
    videoInput: videoInput.value,
    rawText: rawText.value,
    songMasterItems: props.songMasterItems
  })
)

watch([videoInput, rawText], ([nextVideoInput, nextRawText]) => {
  if (nextVideoInput || nextRawText) {
    setlistDraft.save(nextVideoInput, nextRawText)
  }
})

function addItems(): void {
  if (parseResult.value.items.length === 0) return
  emit('addItems', parseResult.value.items)
  setlistDraft.clear()
  videoInput.value = ''
  rawText.value = ''
  emit('close')
}
</script>

<template>
  <div class="dialog-backdrop" @click.self="emit('close')">
    <section class="setlist-dialog" role="dialog" aria-modal="true" aria-labelledby="setlistDialogTitle">
      <header class="setlist-dialog__header">
        <h2 id="setlistDialogTitle">セトリ変換</h2>
        <button type="button" @click="emit('close')">閉じる</button>
      </header>

      <SetlistInputForm v-model:video-input="videoInput" v-model:raw-text="rawText" />
      <SetlistParsePreview :items="parseResult.items" :issues="parseResult.issues" />

      <footer class="setlist-dialog__footer">
        <button type="button" :disabled="parseResult.items.length === 0" @click="addItems">
          {{ parseResult.items.length }}曲追加
        </button>
      </footer>
    </section>
  </div>
</template>
