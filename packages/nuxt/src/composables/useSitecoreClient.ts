import { useRuntimeConfig } from 'nuxt/app';
import { SitecoreNuxtClient } from '../client/sitecore-nuxt-client';
import type { SitecoreNuxtClientInit } from '../client/sitecore-nuxt-client';

/**
 * Composable that initializes and returns a `SitecoreNuxtClient` instance
 * using the Nuxt runtime config.
 * @public
 * @example
 * const client = useSitecoreClient();
 * const page = await client.getPage(route.params.slug);
 */
export function useSitecoreClient(): SitecoreNuxtClient {
  const config = useRuntimeConfig();

  return new SitecoreNuxtClient(config.sitecore as SitecoreNuxtClientInit);
}
