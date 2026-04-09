import { defineEventHandler } from 'h3';
import { createHealthcheckRoute } from '@sitecore-content-sdk/nuxt/routes';
import { useSitecoreClient } from '@sitecore-content-sdk/nuxt';
import sites from '../../.sitecore/sites.json';

const { handle } = createHealthcheckRoute({
  client: useSitecoreClient(),
  sites,
});

export default defineEventHandler(handle);
