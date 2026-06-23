import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app';
import { SitecoreClient } from '@sitecore-content-sdk/nuxt';
import { initContentSdk } from '@sitecore-content-sdk/nuxt';
import { eventsPlugin } from '@sitecore-content-sdk/events';
import { analyticsBrowserAdapter, analyticsPlugin } from '@sitecore-content-sdk/analytics-core';
import scConfig from '../../sitecore.config';

export default defineNuxtPlugin(async () => {
  const runtimeConfig = useRuntimeConfig();

  const contextId =
    (runtimeConfig.public.sitecoreEdgeContextId as string) || scConfig.api?.edge?.contextId;
  const edgeUrl = (runtimeConfig.public.sitecoreEdgeUrl as string) || scConfig.api?.edge?.edgeUrl;
  const siteName =
    (runtimeConfig.public.sitecoreDefaultSite as string) || scConfig.defaultSite || '';

  const config = {
    ...scConfig,
    api: {
      ...scConfig.api,
      edge: {
        ...scConfig.api?.edge,
        contextId,
        clientContextId: contextId,
        edgeUrl,
      },
    },
  };

  if (import.meta.client && contextId) {
    if (import.meta.dev) {
      console.debug('Browser Events SDK plugins are not initialized in development environment');
    } else {
      await initContentSdk({
        config: {
          contextId,
          edgeUrl,
          siteName,
        },
        plugins: [
          analyticsPlugin({
            options: {
              enableCookie: true,
              cookieDomain: window.location.hostname.replace(/^www\./, ''),
            },
            adapter: analyticsBrowserAdapter(),
          }),
          eventsPlugin(),
        ],
      });
    }
  }

  return {
    provide: {
      sitecoreClient: new SitecoreClient(config),
      sitecoreConfig: config,
    },
  };
});
