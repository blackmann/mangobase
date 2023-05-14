/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
    },
    reporters: ['default', 'html'],
  },
})
