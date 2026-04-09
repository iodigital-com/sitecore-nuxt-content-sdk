import { defineEventHandler } from 'h3';
import { MultisiteMiddleware } from '@sitecore-content-sdk/nuxt';
import scConfig from '../../sitecore.config';
import sites from '../../.sitecore/sites.json';

const middleware = new MultisiteMiddleware({
  sites,
  ...scConfig.multisite,
});

export default defineEventHandler((event) => middleware.handle(event));
