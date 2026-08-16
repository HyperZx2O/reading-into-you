import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: { url: 'http://localhost:3000/' },
    },
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    css: false,
    // Windows: the forks pool times out spawning workers under paths with
    // spaces; the threads pool with a single worker is reliable here.
    pool: 'threads',
    poolOptions: {
      threads: { singleThread: true },
    },
  },
})
