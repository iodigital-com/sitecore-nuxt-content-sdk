import { defineConfig } from '@sitecore-content-sdk/nuxt/config';

export default defineConfig({
  api: {
    edge: {
      contextId:
        process.env.SITECORE_EDGE_CONTEXT_ID ||
        process.env.NUXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID ||
        'placeholder',
      clientContextId:
        process.env.NUXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID ||
        process.env.SITECORE_EDGE_CONTEXT_ID ||
        'placeholder',
      edgeUrl:
        process.env.NUXT_PUBLIC_SITECORE_EDGE_PLATFORM_HOSTNAME ||
        process.env.SITECORE_EDGE_PLATFORM_HOSTNAME,
    },
    local: {
      apiKey: process.env.NUXT_PUBLIC_SITECORE_API_KEY || '',
      apiHost: process.env.NUXT_PUBLIC_DEFAULT_SITE_NAME || '',
    },
  },
  defaultSite: process.env.NUXT_PUBLIC_DEFAULT_SITE_NAME,
  defaultLanguage: process.env.NUXT_PUBLIC_DEFAULT_LANGUAGE || 'en',
  editingSecret: process.env.SITECORE_EDITING_SECRET,
  redirects: {
    enabled: true,
    locales: ['en'],
  },
  multisite: {
    enabled: true,
    useCookieResolution: () => process.env.NUXT_ENV === 'preview',
  },
  personalize: {
    scope: process.env.NUXT_PUBLIC_PERSONALIZE_SCOPE,
    channel: process.env.NUXT_PUBLIC_PERSONALIZE_CHANNEL || '',
    currency: process.env.NUXT_PUBLIC_PERSONALIZE_CURRENCY || '',
    edgeTimeout: parseInt(process.env.PERSONALIZE_MIDDLEWARE_EDGE_TIMEOUT || '400', 10),
    cdpTimeout: parseInt(process.env.PERSONALIZE_MIDDLEWARE_CDP_TIMEOUT || '400', 10),
  },
});
