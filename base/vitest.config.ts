/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    clearMocks: true,
    coverage: {
      enabled: true,
    },
    globalSetup: ['global.setup.ts'],
    reporters: ['default', 'html'],
  },
})
