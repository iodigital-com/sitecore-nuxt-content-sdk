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
      '@sitecore-content-sdk/content/codegen': path.resolve(
        __dirname,
        '../content/src/editing/codegen'
      ),
    },
  },
});
