/// <reference types="vitest" />
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/_',
  plugins: [preact()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      external: ['node:buffer', 'node:crypto', 'node:util'],
    },
  },
  test: {
    environment: 'jsdom',
  },
})
