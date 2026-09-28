/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fuelPricesPlugin } from './server/vitePlugin.ts'

export default defineConfig({
  plugins: [react(), fuelPricesPlugin()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
})
