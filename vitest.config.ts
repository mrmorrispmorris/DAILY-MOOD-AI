import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Basic Phase 1 testing configuration
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    
    // Coverage settings for Phase 1 (basic)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '.next/',
        'coverage/',
        '*.config.*',
        'types/',
        'supabase/migrations/'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    }
  }
})

