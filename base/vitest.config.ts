/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    clearMocks: true,
    coverage: {
      enabled: true,
    },
    reporters: ['default', 'html'],
    threads: false,
  },
})
