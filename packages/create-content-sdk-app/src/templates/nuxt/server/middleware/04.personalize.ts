import { defineEventHandler } from 'h3';
import { PersonalizeMiddleware } from '@iodigital-com/sitecore-content-sdk-nuxt/middleware';
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
      (event.node?.req?.headers?.['x-vercel-ip-country'] as string) ||
      (event.node?.req?.headers?.['cf-ipcountry'] as string) ||
      'UK',
  }),
});

export default defineEventHandler((event) => {
  return middleware.handle(event);
});
