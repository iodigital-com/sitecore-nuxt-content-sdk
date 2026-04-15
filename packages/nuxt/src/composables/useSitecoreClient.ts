import { useNuxtApp } from 'nuxt/app';
import { SitecoreNuxtClient } from '../client/sitecore-nuxt-client';

/**
 * Composable that initializes and returns a `SitecoreNuxtClient` instance
 * using the Nuxt runtime config.
 * @public
 * @example
 * const client = useSitecoreClient();
 * const page = await client.getPage(route.params.slug);
 */
export function useSitecoreClient(): SitecoreNuxtClient {
  return useNuxtApp().$sitecoreClient as SitecoreNuxtClient;
}
