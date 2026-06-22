import { defineEventHandler } from 'h3';
import { MultisiteMiddleware } from '@sitecore-content-sdk/nuxt/middleware';
import scConfig from '../../sitecore.config';
import sites from '../../.sitecore/sites.json';

const middleware = new MultisiteMiddleware({
  sites,
  ...scConfig.multisite,
});

// If you're not using multisite features, you should remove this file to avoid unnecessary overhead.
export default defineEventHandler((event) => {
  if (!scConfig.multisite?.enabled) return;
  middleware.handle(event);
});
