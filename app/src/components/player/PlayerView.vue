<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { usePlaybackController } from '../../composables/usePlaybackController'
import { usePlaylist } from '../../composables/usePlaylist'
import { useSongMaster } from '../../composables/useSongMaster'
import { useYouTubePlayer } from '../../composables/useYouTubePlayer'
import { exportPlaylistFile, importPlaylistFile } from '../../domain/file/playlistFile'
import { formatTrackName } from '../../domain/playlist/playlistNormalize'
import type { PlaylistItem, PlaybackRequest } from '../../domain/playlist/playlistTypes'
import PlaybackControls from './PlaybackControls.vue'
import PlaylistList from './PlaylistList.vue'
import PlaylistSummary from './PlaylistSummary.vue'
import YouTubeViewport from './YouTubeViewport.vue'
import SetlistDialog from '../setlist/SetlistDialog.vue'

const PLAYER_ELEMENT_ID = 'yt-player'

const playlist = usePlaylist()
const playback = usePlaybackController()
const songMaster = useSongMaster()
const showSetlistDialog = ref(false)
const statusMessage = ref('')
const hasAdvancedForClip = ref(false)

const youtube = useYouTubePlayer({
  onEnded: advanceFromPlaybackEnd,
  onError: handlePlaybackError
})

const currentTitle = computed(() =>
  playlist.currentItem.value ? formatTrackName(playlist.currentItem.value) : ''
)
const currentDuration = computed(() => {
  const item = playlist.currentItem.value
  return item ? item.end - item.start : 0
})
const elapsed = computed(() => {
  const item = playlist.currentItem.value
  return item ? Math.max(0, youtube.currentTime.value - item.start) : 0
})
const canPlay = computed(() => playlist.totalCount.value > 0 && youtube.status.value === 'ready')

onMounted(() => {
  void songMaster.load()
  void youtube.initialize(PLAYER_ELEMENT_ID)
})

watch(
  () => youtube.currentTime.value,
  (currentTime) => {
    const item = playlist.currentItem.value
    if (!item || !youtube.playing.value || hasAdvancedForClip.value) return
    if (currentTime >= item.end - 0.25) {
      advanceFromPlaybackEnd()
    }
  }
)

function playCurrent(): void {
  if (!playlist.currentItem.value) {
    statusMessage.value = 'プレイリストが空です'
    return
  }
  loadAndPlay(playlist.currentItem.value)
}

function playIndex(index: number): void {
  const item = playlist.select(index)
  if (item) {
    loadAndPlay(item)
  }
}

function playNext(): void {
  const nextIndex = playback.getNextIndex(playlist.currentIndex.value, playlist.totalCount.value)
  if (nextIndex === null) {
    youtube.stop()
    statusMessage.value = '再生を終了しました'
    return
  }

  playIndex(nextIndex)
}

function loadAndPlay(item: PlaylistItem): void {
  hasAdvancedForClip.value = false
  statusMessage.value = ''
  youtube.loadClip(toPlaybackRequest(item))
}

function advanceFromPlaybackEnd(): void {
  if (hasAdvancedForClip.value) return
  hasAdvancedForClip.value = true
  playNext()
}

function handlePlaybackError(errorCode: number): void {
  youtube.stop()
  statusMessage.value = getYouTubeErrorMessage(errorCode)
}

function toPlaybackRequest(item: PlaylistItem): PlaybackRequest {
  return {
    videoId: item.videoId,
    startSeconds: item.start,
    endSeconds: item.end
  }
}

function addSetlistItems(items: PlaylistItem[]): void {
  const addedCount = playlist.addItems(items)
  statusMessage.value = `${addedCount}曲追加しました`
}

function exportPlaylist(): void {
  if (playlist.items.value.length === 0) {
    statusMessage.value = 'export できる曲がありません'
    return
  }

  const blob = new Blob([exportPlaylistFile(playlist.items.value)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `yz-player-playlist-${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
  statusMessage.value = 'プレイリストを export しました'
}

async function importPlaylist(file: File): Promise<void> {
  const text = await file.text()
  const result = importPlaylistFile(text)
  const addedCount = playlist.addItems(result.items)
  statusMessage.value = `${addedCount}曲 import しました / skipped ${result.issues.length}`
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const restSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')
  return `${minutes}:${restSeconds}`
}

function getYouTubeErrorMessage(errorCode: number): string {
  switch (errorCode) {
    case 2:
      return 'YouTube error 2: 動画IDが正しくありません。'
    case 5:
      return 'YouTube error 5: HTML5 player で再生できません。'
    case 100:
      return 'YouTube error 100: 動画が削除または非公開です。'
    case 101:
    case 150:
      return `YouTube error ${errorCode}: この動画は埋め込み再生が許可されていません。`
    default:
      return `YouTube error ${errorCode}: 再生できません。`
  }
}
</script>

<template>
  <section class="player-view">
    <div class="layout">
      <div class="player-column">
        <div class="player-stage">
          <YouTubeViewport :element-id="PLAYER_ELEMENT_ID" />

          <div class="player-status">
            <span class="status-pill"><span class="dot"></span>YouTube: {{ youtube.status.value }}</span>
            <span v-if="youtube.errorCode.value !== null">error: {{ youtube.errorCode.value }}</span>
            <span v-if="statusMessage">{{ statusMessage }}</span>
          </div>

          <PlaylistSummary
            :current-title="currentTitle"
            :elapsed="formatTime(elapsed)"
            :duration="formatTime(currentDuration)"
            :position="playlist.playlistPosition.value"
            :total-count="playlist.totalCount.value"
          />

          <PlaybackControls
            :playing="youtube.playing.value"
            :play-mode="playback.playMode.value"
            :play-mode-label="playback.playModeLabel.value"
            :volume="youtube.currentVolume.value"
            :muted="youtube.muted.value"
            :can-play="canPlay"
            @cycle-mode="playback.cyclePlayMode"
            @play="playCurrent"
            @pause="youtube.pause"
            @next="playNext"
            @volume-down="youtube.volumeDown"
            @volume-up="youtube.volumeUp"
            @toggle-mute="youtube.toggleMute"
            @clear="playlist.clear"
            @export-playlist="exportPlaylist"
            @import-playlist="importPlaylist"
          />
        </div>
      </div>

      <aside class="playlist-column">
        <section class="setlist-entry">
          <div class="setlist-row">
            <div>
              <h2 class="section-title">セトリ変換</h2>
              <div class="muted">song master: {{ songMaster.status.value }}</div>
            </div>
            <button class="button-primary" type="button" @click="showSetlistDialog = true">開く</button>
          </div>
        </section>

        <PlaylistList
          :items="playlist.items.value"
          :current-index="playlist.currentIndex.value"
          @select="playIndex"
          @remove="playlist.removeAt"
        />
      </aside>
    </div>

    <SetlistDialog
      v-if="showSetlistDialog"
      :song-master-items="songMaster.items.value"
      @close="showSetlistDialog = false"
      @add-items="addSetlistItems"
    />
  </section>
</template>
