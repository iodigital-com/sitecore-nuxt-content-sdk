import { defineEventHandler } from 'h3';
import { createSitemapRoute } from '@sitecore-content-sdk/nuxt/routes';
import { SitecoreClient } from '@sitecore-content-sdk/nuxt/client';
import scConfig from '../../sitecore.config';
import sites from '../../.sitecore/sites.json';

const { handle } = createSitemapRoute({
  client: new SitecoreClient(scConfig),
  sites,
});

export default defineEventHandler(handle);
