import { defineEventHandler } from 'h3';
import { createRobotsRoute } from '@sitecore-content-sdk/nuxt/routes';
import { useSitecoreClient } from '@sitecore-content-sdk/nuxt';
import sites from '../../.sitecore/sites.json';

const { handle } = createRobotsRoute({
  client: useSitecoreClient(),
  sites,
});

export default defineEventHandler(handle);
