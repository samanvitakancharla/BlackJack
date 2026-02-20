import { defineConfig } from 'vitest/config'

export default defineConfig({
  testEnvironment: 'jsdom',
  setupFiles: ['./src/tests/setup.js'],
})
