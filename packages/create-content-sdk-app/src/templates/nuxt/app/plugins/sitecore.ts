// packages/create-content-sdk-app/src/templates/nuxt/plugins/sitecore.ts
import { defineNuxtPlugin } from 'nuxt/app';
import { SitecoreClient } from '@sitecore-content-sdk/nuxt';
import scConfig from '../../sitecore.config';

export default defineNuxtPlugin(() => {
  return {
    provide: {
      sitecoreClient: new SitecoreClient(scConfig),
    },
  };
});
