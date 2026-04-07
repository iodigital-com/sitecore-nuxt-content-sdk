/* eslint-disable react-hooks/rules-of-hooks */
import { useRoute, useAsyncData, useHead, NuxtError } from 'nuxt/app';
import type { Ref } from 'vue';
import type { Page } from '@sitecore-content-sdk/content/client';
import { isDesignLibraryMode } from '@sitecore-content-sdk/content/editing';
import { useSitecoreClient } from './useSitecoreClient';

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
  const route = useRoute();
  const client = useSitecoreClient();

  const slug = route.params.slug;
  const path = Array.isArray(slug) ? slug : slug ? [slug] : [];
  const query = route.query as Record<string, string | undefined>;

  const {
    data: page,
    error,
    status,
  } = await useAsyncData<Page | null>(`sitecore-page-${path.join('/')}`, async () => {
    if (isDesignLibraryMode(query.mode)) {
      return client.getDesignLibraryData(query as any);
    }

    if (query.sc_itemid) {
      return client.getPreview(query as any);
    }

    return client.getPage(path);
  });

  if (page.value) {
    const headLinks = client.getHeadLinks(page.value.layout);
    useHead({
      link: headLinks.map((link) => ({
        rel: link.rel,
        href: link.href,
      })),
    });
  }

  return { page, error, status };
}
