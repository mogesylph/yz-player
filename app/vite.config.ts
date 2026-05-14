import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/yz-player/',
  plugins: [vue()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts']
  }
})
