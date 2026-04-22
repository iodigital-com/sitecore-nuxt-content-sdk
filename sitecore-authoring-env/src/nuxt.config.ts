import { defineNuxtConfig } from 'nuxt/config';
import { resolve } from 'path';

export default defineNuxtConfig({
  experimental: {
    serverAppConfig: false,
  },
  compatibilityDate: '2026-04-10',
  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'graphql-request',
        'debug',
        'url-parse',
        'memory-cache',
        'regex-parser',
      ],
    },
  },
  routeRules: {
    '*': {
      headers: {
        'X-Frame-Options': 'ALLOWALL',
      },
    },
    '/robots.txt': { cache: { maxAge: 60 } },
    '/sitemap.xml': { cache: { maxAge: 60 } },
    '/api/editing/**': {
      headers: {
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    },
  },
  runtimeConfig: {
    public: {
      locales: ['en', 'nl-NL'],
      sitecoreEdgeContextId: process.env.NUXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID || '',
      sitecoreEdgeUrl:
        process.env.NUXT_PUBLIC_SITECORE_EDGE_PLATFORM_HOSTNAME ||
        'https://edge-platform.sitecorecloud.io',
      sitecoreDefaultSite: process.env.NUXT_PUBLIC_DEFAULT_SITE_NAME || '',
    },
    sitecore: {
      api: {
        edge: {
          contextId:
            process.env.SITECORE_EDGE_CONTEXT_ID ||
            process.env.NUXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID ||
            '',
          clientContextId: process.env.NUXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID,
          edgeUrl: process.env.NUXT_PUBLIC_SITECORE_EDGE_PLATFORM_HOSTNAME,
        },
        local: {
          apiKey: process.env.NUXT_PUBLIC_SITECORE_API_KEY || '',
          apiHost: process.env.NUXT_PUBLIC_SITECORE_API_HOST || '',
        },
      },
      defaultSite: process.env.NUXT_PUBLIC_DEFAULT_SITE_NAME,
      defaultLanguage: process.env.NUXT_PUBLIC_DEFAULT_LANGUAGE || 'en',
      editingSecret: process.env.SITECORE_EDITING_SECRET,
    },
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        paths: {
          '@sitecore-content-sdk/nuxt': [
            '../node_modules/@sitecore-content-sdk/nuxt/types/index.d.ts',
          ],
        },
      },
    },
  },
  nitro: {
    rollupConfig: {
      external: ['/^@sitecore-content-sdk/.*/'],
    },
    alias: {
      vue: resolve('./node_modules/vue'),
      '@vue/runtime-core': resolve('./node_modules/@vue/runtime-core'),
      '@vue/runtime-dom': resolve('./node_modules/@vue/runtime-dom'),
      '@vue/reactivity': resolve('./node_modules/@vue/reactivity'),
    },
  },
});
