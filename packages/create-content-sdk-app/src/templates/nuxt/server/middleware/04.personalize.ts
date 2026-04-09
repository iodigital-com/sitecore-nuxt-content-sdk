import { defineEventHandler } from 'h3';
import { PersonalizeMiddleware } from '@sitecore-content-sdk/nuxt';
import scConfig from '../../sitecore.config';
import sites from '../../.sitecore/sites.json';

const middleware = new PersonalizeMiddleware({
  enabled: true,
  sites,
  contextId: scConfig.api.edge?.contextId,
  clientContextId: scConfig.api.edge?.clientContextId,
  edgeUrl: scConfig.api.edge?.edgeUrl,
  edgeTimeout: scConfig.personalize?.edgeTimeout,
  cdpTimeout: scConfig.personalize?.cdpTimeout,
  scope: scConfig.personalize?.scope,
});

export default defineEventHandler((event) => middleware.handle(event));
