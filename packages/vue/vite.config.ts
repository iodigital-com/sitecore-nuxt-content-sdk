import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve('src/index.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: (id) =>
        id === 'vue' ||
        id.startsWith('@sitecore-content-sdk/') ||
        id.startsWith('@sitecore-feaas/'),
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].mjs',
      },
    },
    outDir: 'dist/esm',
  },
  resolve: {
    extensions: ['.ts', '.vue', '.js'],
  },
});
