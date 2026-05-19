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
  extractGeoDataCb: (event) => ({
    country:
      event.req.headers.get('x-vercel-ip-country') || event.req.headers.get('cf-ipcountry') || 'UK',
  }),
});

export default defineEventHandler((event) => {
  // Log the country header for debugging purposes
  console.log('Country header:', event.req.headers.get('x-vercel-ip-country'));
  console.log('Country header:', event.req.headers.get('cf-ipcountry'));
  return middleware.handle(event);
});
