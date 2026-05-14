<script setup lang="ts">
import { formatTrackName } from '../../domain/playlist/playlistNormalize'
import type { PlaylistItem } from '../../domain/playlist/playlistTypes'
import type { ParseIssue } from '../../domain/setlist/setlistTypes'

defineProps<{
  items: PlaylistItem[]
  issues: ParseIssue[]
}>()
</script>

<template>
  <section class="parse-preview">
    <div class="parse-preview__counts">
      <span>読み取り {{ items.length }}曲</span>
      <span>未読 {{ issues.length }}行</span>
    </div>

    <ul v-if="items.length > 0" class="parse-preview__items">
      <li v-for="item in items" :key="item.id">{{ formatTrackName(item) }}</li>
    </ul>

    <ul v-if="issues.length > 0" class="parse-preview__issues">
      <li v-for="issue in issues" :key="`${issue.lineNumber}:${issue.reason}`">
        {{ issue.lineNumber }}: {{ issue.reason }}
      </li>
    </ul>
  </section>
</template>
