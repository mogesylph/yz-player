<script setup lang="ts">
import { formatTrackName } from '../../domain/playlist/playlistNormalize'
import type { PlaylistItem } from '../../domain/playlist/playlistTypes'

defineProps<{
  items: PlaylistItem[]
  currentIndex: number
}>()

const emit = defineEmits<{
  select: [index: number]
  remove: [index: number]
}>()

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const restSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')
  return `${minutes}:${restSeconds}`
}
</script>

<template>
  <section class="playlist-list" aria-label="playlist">
    <p v-if="items.length === 0" class="empty-state">プレイリストは空です</p>
    <ul v-else>
      <li v-for="(item, index) in items" :key="item.id" class="playlist-item" :aria-current="index === currentIndex">
        <button type="button" class="playlist-item__main" @click="emit('select', index)">
          <span>{{ formatTrackName(item) }}</span>
          <small>{{ formatTime(item.start) }} - {{ formatTime(item.end) }}</small>
        </button>
        <button type="button" class="playlist-item__remove" @click="emit('remove', index)">
          remove
        </button>
      </li>
    </ul>
  </section>
</template>
