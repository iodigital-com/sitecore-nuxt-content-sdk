import { defineEventHandler } from 'h3';
import { RedirectsMiddleware } from '@sitecore-content-sdk/nuxt';
import scConfig from '../../sitecore.config';
import sites from '../../.sitecore/sites.json';

const middleware = new RedirectsMiddleware({
  sites,
  enabled: true,
  contextId: scConfig.api.edge?.contextId,
  clientContextId: scConfig.api.edge?.clientContextId,
  edgeUrl: scConfig.api.edge?.edgeUrl,
  locales: scConfig.redirects?.locales ?? [],
});

export default defineEventHandler((event) => middleware.handle(event));
