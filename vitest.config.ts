import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: [
      '__tests__/**/*.test.ts', 
      'src/**/*.test.ts'
    ],
    exclude: ['node_modules', 'dist', '__tests__/**/fixtures/**'],
    testTimeout: 10000
  },
  esbuild: {
    target: 'node16'
  }
});
