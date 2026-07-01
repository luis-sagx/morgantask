import react from '@vitejs/plugin-react-swc'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      include: [
        'src/api/**/*.ts',
        'src/lib/**/*.ts',
        'src/locales/**/*.ts',
        'src/types/index.ts',
        'src/utils/**/*.ts'
      ],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/vite-env.d.ts',
        'src/types/test.ts',
        'postcss.config.js',
        'tailwind.config.js'
      ],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage'
    }
  }
})
