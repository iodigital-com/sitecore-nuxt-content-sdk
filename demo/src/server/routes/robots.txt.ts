import { defineEventHandler } from 'h3';
import { createRobotsRoute } from '@iodigital-com/sitecore-content-sdk-nuxt/routes';
import { SitecoreClient } from '@iodigital-com/sitecore-content-sdk-nuxt/client';
import scConfig from '../../sitecore.config';
import sites from '../../.sitecore/sites.json';

const { handle } = createRobotsRoute({
  client: new SitecoreClient(scConfig),
  sites,
});

export default defineEventHandler(handle);
