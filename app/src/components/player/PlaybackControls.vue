<script setup lang="ts">
import type { PlayMode } from '../../domain/playlist/playlistTypes'

defineProps<{
  playing: boolean
  canPlay: boolean
  playMode: PlayMode
  playModeLabel: string
  volume: number
  muted: boolean
}>()

const emit = defineEmits<{
  cycleMode: []
  play: []
  pause: []
  next: []
  volumeDown: []
  volumeUp: []
  toggleMute: []
  clear: []
  exportPlaylist: []
  importPlaylist: [file: File]
}>()

function handleFileChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    emit('importPlaylist', file)
  }
  input.value = ''
}
</script>

<template>
  <div class="control-bar">
    <button class="control-button" type="button" :title="playModeLabel" @click="emit('cycleMode')">
      {{ playMode }}
    </button>
    <button v-if="playing" class="control-button" type="button" @click="emit('pause')">pause</button>
    <button v-else class="control-button" type="button" :disabled="!canPlay" @click="emit('play')">
      play
    </button>
    <button class="control-button" type="button" :disabled="!canPlay" @click="emit('next')">
      next
    </button>

    <span class="control-bar__group">
      <button class="control-button" type="button" @click="emit('volumeDown')">vol -</button>
      <button class="control-button" type="button" @click="emit('toggleMute')">
        {{ muted ? 'unmute' : 'mute' }}
      </button>
      <button class="control-button" type="button" @click="emit('volumeUp')">vol +</button>
      <span class="control-bar__meta">{{ volume }}%</span>
    </span>

    <span class="control-bar__group">
      <button class="control-button" type="button" @click="emit('exportPlaylist')">export</button>
      <label class="file-button control-button">
        import
        <input type="file" accept="application/json,.json" @change="handleFileChange" />
      </label>
      <button class="control-button danger" type="button" @click="emit('clear')">clear</button>
    </span>
  </div>
</template>
