<script setup lang="ts">
import { ref } from "vue";

const theme = ref("");
const isAboutOpen = ref(false);
const assetBase = import.meta.env.BASE_URL;
</script>

<template>
  <div class="app-shell" :data-theme="theme || undefined">
    <header class="app-header">
      <div class="brand" aria-label="yz-player">
        <img class="brand-logo" :src="`${assetBase}logo.png`" alt="" />
        <img
          class="brand-title"
          :src="`${assetBase}header-title.png`"
          alt="yz-player"
        />
      </div>
      <div class="header-actions">
        <select v-model="theme" class="theme-select" aria-label="テーマ">
          <option value="">Default</option>
          <option value="soft">Soft</option>
          <option value="solid">Solid</option>
          <option value="dark">Dark</option>
        </select>
      </div>
    </header>

    <main class="app-main">
      <slot />
    </main>

    <footer class="app-footer">
      <span>&copy; 2026 moge / 個人制作の非公式ツール</span>
      <button class="footer-link" type="button" @click="isAboutOpen = true">
        About
      </button>
    </footer>

    <div
      v-if="isAboutOpen"
      class="dialog-backdrop"
      role="presentation"
      @click.self="isAboutOpen = false"
    >
      <section
        class="about-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
      >
        <div class="about-dialog__header">
          <h2 id="about-title">About</h2>
          <button type="button" @click="isAboutOpen = false">閉じる</button>
        </div>
        <div class="about-dialog__body">
          <p>
            yz-player は、YouTube 動画内の指定区間を曲単位で連続再生するための個人用プレイヤーです。
          </p>
          <p>
            柚羽まくらさんの歌枠を聴きやすくすることと、Codex を使ったバイブコーディングの検証を目的に制作しています。
          </p>
          <p>
            柚羽まくらさん本人、所属先、YouTube
            とは関係ありません。動画・楽曲の権利は各権利者に帰属します。
          </p>
        </div>
      </section>
    </div>
  </div>
</template>
