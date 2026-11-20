// Separate from vite.config.ts: Vitest 3's config types target an older Vite than the app uses.
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
