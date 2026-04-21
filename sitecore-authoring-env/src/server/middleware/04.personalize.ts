import { defineEventHandler } from 'h3';
import { PersonalizeMiddleware } from '@sitecore-content-sdk/nuxt';
import scConfig from '../../sitecore.config';
import sites from '../../.sitecore/sites.json';

const middleware = new PersonalizeMiddleware({
  sites,
  enabled: scConfig.personalize?.enabled,
  contextId: scConfig.api.edge?.contextId,
  clientContextId: scConfig.api.edge?.clientContextId,
  edgeUrl: scConfig.api.edge?.edgeUrl,
  edgeTimeout: scConfig.personalize?.edgeTimeout,
  cdpTimeout: scConfig.personalize?.cdpTimeout,
  scope: scConfig.personalize?.scope,
  channel: scConfig.personalize?.channel,
  currency: scConfig.personalize?.currency,
});

export default defineEventHandler((event) => {
  return middleware.handle(event);
});
