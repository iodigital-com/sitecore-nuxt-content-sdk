import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  experimental: {
    serverAppConfig: false,
  },
  compatibilityDate: '2026-04-10',
  routeRules: {
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
  },
});
