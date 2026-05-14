<script setup lang="ts">
defineProps<{
  elementId: string
}>()
</script>

<template>
  <section class="youtube-viewport" aria-label="YouTube player">
    <div :id="elementId" class="youtube-viewport__target"></div>
  </section>
</template>
