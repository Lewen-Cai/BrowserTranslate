import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
import path from 'node:path';

export default defineConfig({
  // tsconfig sets jsx:"preserve" for WXT's build pipeline, which leaves the test
  // runner unable to parse component .tsx. The Preact preset gives the test
  // runner a real JSX transform (the extension build configures it via WXT).
  plugins: [preact()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.*', 'src/entrypoints/**'],
    },
  },
});
