<script setup lang="ts">
const videoInput = defineModel<string>('videoInput', { required: true })
const rawText = defineModel<string>('rawText', { required: true })
</script>

<template>
  <div class="setlist-form">
    <label>
      <span>動画ID / URL</span>
      <input v-model="videoInput" type="text" placeholder="https://youtu.be/M7lc1UVf-VE" />
    </label>
    <label>
      <span>セトリ</span>
      <textarea v-model="rawText" rows="8" placeholder="00:01:23 l'aster / 柚羽まくら"></textarea>
    </label>
  </div>
</template>
