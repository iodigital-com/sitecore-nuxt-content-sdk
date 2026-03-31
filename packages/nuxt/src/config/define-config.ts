import {
  DeepRequired,
  defineConfig as defineConfigCore,
  SitecoreConfigInput as SitecoreConfigInputCore,
} from '@sitecore-content-sdk/content/config';
import { resolveEdgeUrl } from '@sitecore-content-sdk/core/tools';

/** Nuxt env var for Edge hostname; exposed to the browser so client code can use it. */
const NUXT_PUBLIC_SITECORE_EDGE_PLATFORM_HOSTNAME_ENV =
  'NUXT_PUBLIC_SITECORE_EDGE_PLATFORM_HOSTNAME';

/**
 * Provides default Nuxt initial values from env variables for SitecoreConfig
 * @param {SitecoreConfigInput} config optional override values to be written over default config settings
 * @returns default nuxt input config
 */
export const getNuxtFallbackConfig = (config?: SitecoreConfigInput): SitecoreConfigInput => {
  return {
    ...config,
    api: {
      ...config?.api,
      edge: {
        ...config?.api?.edge,
        contextId: config?.api?.edge?.contextId || '',
        clientContextId:
          config?.api?.edge?.clientContextId || process.env.NUXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID,
        edgeUrl: resolveEdgeUrl(
          config?.api?.edge?.edgeUrl ?? process.env[NUXT_PUBLIC_SITECORE_EDGE_PLATFORM_HOSTNAME_ENV]
        ),
      },
      local: {
        ...config?.api?.local,
        apiKey: config?.api?.local?.apiKey || process.env.NUXT_PUBLIC_SITECORE_API_KEY || '',
        apiHost: config?.api?.local?.apiHost || process.env.NUXT_PUBLIC_SITECORE_API_HOST || '',
      },
    },
    defaultSite: config?.defaultSite || process.env.NUXT_PUBLIC_DEFAULT_SITE_NAME || '',
    defaultLanguage: config?.defaultLanguage || process.env.NUXT_PUBLIC_DEFAULT_LANGUAGE || 'en',
    multisite: {
      ...config?.multisite,
      useCookieResolution:
        config?.multisite?.useCookieResolution ?? (() => process.env.NUXT_ENV === 'preview'),
    },
    personalize: {
      ...config?.personalize,
      scope: config?.personalize?.scope || process.env.NUXT_PUBLIC_PERSONALIZE_SCOPE,
    },
    sitecoreInternalEditingHostUrl:
      config?.sitecoreInternalEditingHostUrl || process.env.SITECORE_INTERNAL_EDITING_HOST_URL,
  };
};

/**
 * Type to be used as config input in sitecore.config
 * @public
 */
export type SitecoreConfigInput = SitecoreConfigInputCore & {
  /**
   * The internal host URL for the Nuxt application, used for server-side requests for page rendering during editing.
   * This should be the base URL where the Nuxt app is accessible from the server side (e.g., "http://localhost:3000").
   */
  sitecoreInternalEditingHostUrl?: string;
};

/**
 * Final sitecore config type used at runtime. Every property should be populated, either from sitecore.config or built-in fallback values.
 * @public
 */
export type SitecoreConfig = DeepRequired<SitecoreConfigInput>;

/**
 * Accepts a SitecoreConfigInput object and returns full sitecore configuration
 * @param {SitecoreConfigInput} config override values to be written over default config settings
 * @returns {SitecoreConfig} full sitecore configuration to use in application
 * @public
 */
export const defineConfig = (config?: SitecoreConfigInput): SitecoreConfig => {
  return defineConfigCore(getNuxtFallbackConfig(config)) as SitecoreConfig;
};
