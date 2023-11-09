/// <reference types="vitest" />
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/_',
  plugins: [preact()],
  test: {
    environment: 'jsdom',
  },
})
