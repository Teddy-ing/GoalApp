import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{js,ts}'],
    exclude: ['tests/setup.ts'],
    testTimeout: 10000, // Database operations may take longer
  },
}); 