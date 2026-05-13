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
        'src/hooks/**/*.ts',
        'src/utils/**/*.ts',
        'src/locales/**/*.ts',
        'src/types/**/*.ts',
        'src/layouts/**/*.tsx',
        'src/components/ErrorMessage.tsx',
        'src/components/Logo.tsx',
        'src/components/NavMenu.tsx',
        'src/lib/**/*.ts'
      ],
      thresholds: {
        statements: 85,
        branches: 85,
        functions: 85,
        lines: 85
      }
    }
  }
})