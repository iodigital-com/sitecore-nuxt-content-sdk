// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  typescript: {
    tsConfig: {
      compilerOptions: {
        paths: {
          '@sitecore-content-sdk/nuxt': [
            './node_modules/@sitecore-content-sdk/nuxt/types/index.d.ts',
          ],
        },
      },
    },
  },
});

