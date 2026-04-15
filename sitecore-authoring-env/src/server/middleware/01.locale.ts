import { defineEventHandler } from 'h3';
import { LocaleMiddleware } from '@sitecore-content-sdk/nuxt';
import scConfig from '../../sitecore.config';
import sites from '../../.sitecore/sites.json';

const middleware = new LocaleMiddleware({
  sites,
  locales: scConfig.redirects?.locales ?? [scConfig.defaultLanguage ?? 'en'],
});

export default defineEventHandler((event) => middleware.handle(event));
