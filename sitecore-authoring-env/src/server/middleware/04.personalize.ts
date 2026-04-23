import { defineEventHandler } from 'h3';
import { PersonalizeMiddleware } from '@sitecore-content-sdk/nuxt';
import scConfig from '../../sitecore.config';
import sites from '../../.sitecore/sites.json';

const middleware = new PersonalizeMiddleware({
  sites,
  enabled: true,
  locales: scConfig.redirects?.locales ?? [],
  contextId: scConfig.api.edge?.contextId,
  clientContextId: scConfig.api.edge?.clientContextId,
  edgeUrl: scConfig.api.edge?.edgeUrl,
  edgeTimeout: scConfig.personalize?.edgeTimeout,
  cdpTimeout: scConfig.personalize?.cdpTimeout,
  scope: scConfig.personalize?.scope,
  channel: scConfig.personalize?.channel,
  currency: scConfig.personalize?.currency,
  extractGeoDataCb: () => ({
    country:
      // getRequestHeader(event, 'x-vercel-ip-country') ||
      // getRequestHeader(event, 'cf-ipcountry') ||
      'NL', // Default to NL for local development, change it to any other country for a different personalization result
  }),
});

export default defineEventHandler((event) => {
  return middleware.handle(event);
});
