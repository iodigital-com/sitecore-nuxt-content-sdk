import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
  experimental: {
    serverAppConfig: false,
  },
  compatibilityDate: '2026-04-10',
  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'debug', // CJS
        'graphql-request',
        'memory-cache', // CJS
        'url-parse', // CJS
        'regex-parser', // CJS
        '@sitecore-feaas/clientside',
      ],
    },
    server: {
      allowedHosts: [
        '.sitecorecloud.io',
        '.sitecorecloud.net',
        '.sitecorecloud.dev',
        '.trycloudflare.com',
      ],
    },
  },
  routeRules: {
    '*': {
      headers: {
        'Content-Security-Policy':
          "frame-ancestors 'self' https://designlibrary.sitecorecloud.io https://pages.sitecorecloud.io https://xmapps.sitecorecloud.io",
      },
    },
    '/api/editing/**': {
      headers: {
        'Access-Control-Allow-Origin': 'https://app.sitecorecloud.io',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, X-Requested-With, X-Sitecore-Editing-Secret, X-Tunnel-Skip-Browser-Warning',
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
  },
});
