/* eslint-disable react-hooks/rules-of-hooks */
import {
  useRoute,
  useAsyncData,
  useHead,
  useNuxtApp,
  callWithNuxt,
  NuxtError,
  useRequestHeaders,
  useCookie,
} from 'nuxt/app';
import type { Ref } from 'vue';
import type { Page } from '@sitecore-content-sdk/content/client';
import { isDesignLibraryMode } from '@sitecore-content-sdk/content/editing';
import { useSitecoreClient } from './useSitecoreClient';
import { LOCALE_HEADER_NAME } from '../middleware/middleware';

/**
 * Return type of the useSitecorePage composable.
 * @public
 */
export type UseSitecorePageResult = {
  /**
   * The page data returned from Sitecore, or null if not found.
   */
  page: Ref<Page | null | undefined>;
  /**
   * Error returned by useAsyncData, if any.
   */
  error: Ref<NuxtError<unknown> | undefined>;
  /**
   * Status of the async data fetch.
   */
  status: Ref<'idle' | 'pending' | 'success' | 'error'>;
};

/**
 * Composable that fetches Sitecore page data for the current route.
 *
 * Reads the slug from the route params, determines the correct fetch mode
 * (normal, preview, or Design Library), and fetches the layout data via
 * `useAsyncData` for SSR support.
 *
 * Site and locale are resolved automatically — the multisite middleware
 * rewrites the path to include the site segment, and the locale middleware
 * sets the `x-sc-locale` response header. `SitecoreNuxtClient` handles both.
 *
 * Head links (stylesheets, themes) are injected automatically via `useHead`.
 *
 * Must be used in `[...slug].vue` or any catch-all route page.
 * @public
 * @example
 * // pages/[...slug].vue
 * <script setup>
 * import { useSitecorePage } from '@sitecore-content-sdk/nuxt';
 *
 * const { page, error } = await useSitecorePage();
 *
 * if (!page.value) {
 *   throw createError({ statusCode: 404 });
 * }
 * </script>
 * @returns {Promise<UseSitecorePageResult>} The reactive page result containing `page`, `error`, and `status`.
 */
export async function useSitecorePage(): Promise<UseSitecorePageResult> {
  const nuxtApp = useNuxtApp();
  const route = useRoute();
  const client = useSitecoreClient();

  const locales = (nuxtApp.$config?.public?.locales as string[]) ?? ['en'];
  const slug = route.params.slug;
  const rawPath = Array.isArray(slug) ? slug : slug ? [slug] : [];
  const path = locales.includes(rawPath[0])
    ? rawPath.slice(1).filter(Boolean)
    : rawPath.filter(Boolean);

  const headers = useRequestHeaders([LOCALE_HEADER_NAME]);
  const locale = headers[LOCALE_HEADER_NAME as keyof typeof headers] as string | undefined;
  const siteCookie = useCookie('sc_site');
  const site = siteCookie.value ?? undefined;
  const query = route.query as Record<string, string | undefined>;

  const {
    data: page,
    error,
    status,
  } = await useAsyncData<Page | null>(
    `sitecore-page-${path.join('/')}${query.sc_itemid ? `-editing-${query.sc_itemid}` : ''}`,
    async () => {
      if (isDesignLibraryMode(query.mode)) {
        return client.getDesignLibraryData(query as any);
      }

      if (query.itemId) {
        return client.getPreview(query as any);
      }

      return client.getPage(path, { locale, site });
    }
  );

  if (page.value) {
    const headLinks = client.getHeadLinks(page.value.layout);
    const context = page.value.layout?.sitecore?.context;
    const clientScripts = (context?.clientScripts as string[]) ?? [];
    const clientData = (context?.clientData as Record<string, unknown>) ?? {};

    callWithNuxt(nuxtApp, () => {
      useHead({
        link: headLinks.map((link) => ({
          rel: link.rel,
          href: link.href,
        })),
        script: [
          // Editing marker — Page Builder uses this to detect editing mode
          ...(query.itemId
            ? [{ id: 'jss-hrz-editing', type: 'application/json', innerHTML: '{}' }]
            : []),
          // Sitecore editor scripts (xa-inline-editor.js, feaas page.js, etc.)
          ...clientScripts.map((src, i) => ({
            key: `sc-client-script-${i}`,
            src,
          })),
          // Client data blobs
          ...Object.keys(clientData).map((id) => ({
            id,
            type: 'application/json',
            innerHTML: JSON.stringify(clientData[id]),
          })),
        ],
      });
    });
  }

  return { page, error, status };
}
