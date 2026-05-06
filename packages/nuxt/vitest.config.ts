import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 10000,
    environmentMatchGlobs: [['src/components/**', 'jsdom']],
  },
  resolve: {
    alias: {
      '@sitecore-content-sdk/content': path.resolve(__dirname, '../content/src'),
      '@sitecore-content-sdk/core': path.resolve(__dirname, '../core/src'),
      '@sitecore-content-sdk/vue': path.resolve(__dirname, '../vue/src'),
    },
  },
});
