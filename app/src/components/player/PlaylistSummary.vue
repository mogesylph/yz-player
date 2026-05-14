<script setup lang="ts">
defineProps<{
  currentTitle: string
  elapsed: string
  duration: string
  position: string
  totalCount: number
}>()
</script>

<template>
  <section class="playlist-summary">
    <div class="summary-main">
      <div class="eyebrow">再生中</div>
      <div class="track-title">{{ currentTitle || 'なし' }}</div>
    </div>
    <div class="summary-meta">
      <span>{{ elapsed }} / {{ duration }}</span>
      <span>{{ position }} 曲目 / 合計 {{ totalCount }}曲</span>
    </div>
  </section>
</template>
