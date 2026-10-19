import {
  SitecoreClient,
  SitecoreClientInit,
  Page,
  PageOptions,
  FetchOptions,
} from '@sitecore-content-sdk/content/client';
import { getSiteRewriteData, normalizeSiteRewrite } from '@sitecore-content-sdk/content/site';
import {
  getPersonalizedRewriteData,
  normalizePersonalizedRewrite,
} from '@sitecore-content-sdk/content/personalize';
import { SitecoreConfig } from '@sitecore-content-sdk/content/config';

/**
 * Init options for SitecoreNuxtClient.
 * @public
 */
export type SitecoreNuxtClientInit = SitecoreClientInit & Pick<SitecoreConfig, 'multisite'>;

/**
 * Nuxt-specific extension of SitecoreClient.
 *
 * Adds path normalization for multisite and personalization rewrites that are
 * applied by the Nuxt server middleware chain. When a request passes through
 * `MultisiteMiddleware` and `PersonalizeMiddleware`, the URL is rewritten to
 * include site and variant segments. `parsePath` strips those segments before
 * passing the path to Sitecore.
 * @example
 * // sitecore-client.ts
 * import { SitecoreNuxtClient } from '@iodigital-com/sitecore-content-sdk-nuxt';
 * import scConfig from './sitecore.config';
 *
 * const client = new SitecoreNuxtClient(scConfig);
 * export default client;
 * @public
 */
export class SitecoreNuxtClient extends SitecoreClient {
  /**
   * @param {SitecoreNuxtClientInit} initOptions - Nuxt client configuration
   */
  constructor(protected initOptions: SitecoreNuxtClientInit) {
    super(initOptions);
  }

  /**
   * Resolves the site name from a rewritten path.
   * The `MultisiteMiddleware` rewrites paths to include the site segment (e.g. `/mysite/about`).
   * This method extracts the site name from that segment.
   * @param {string | string[]} path - The rewritten path from the Nuxt route
   * @returns {string} The resolved site name, or the default site if not found
   */
  getSiteNameFromPath(path: string | string[]): string {
    const resolvedPath = super.parsePath(path);
    const siteData = getSiteRewriteData(resolvedPath, this.initOptions.defaultSite);
    return siteData.siteName;
  }

  /**
   * Normalizes a Nuxt route path by stripping multisite and personalization
   * rewrite segments added by the middleware chain.
   * @example
   * // '/mysite/_variantId_variant-1/about' → '/about'
   * @param {string | string[]} path - The raw path from the Nuxt route params
   * @returns {string} The normalized path ready for Sitecore
   */
  parsePath(path: string | string[]): string {
    const basePath = super.parsePath(path);
    return normalizeSiteRewrite(normalizePersonalizedRewrite(basePath));
  }

  /**
   * Fetches page layout data for the given route path.
   *
   * Automatically resolves the site name and personalization variant data
   * from the rewritten path before calling Sitecore.
   * @param {string | string[]} path - The route path from the Nuxt slug params
   * @param {PageOptions} [pageOptions] - Optional overrides for site, locale and personalization
   * @param {FetchOptions} [fetchOptions] - Optional fetch overrides
   * @returns {Promise<Page | null>} The page data, or null if the route is not found
   */
  async getPage(
    path: string | string[],
    pageOptions?: PageOptions,
    fetchOptions?: FetchOptions
  ): Promise<Page | null> {
    const resolvedPath = this.parsePath(path);
    const personalizeData =
      pageOptions?.personalize || getPersonalizedRewriteData(super.parsePath(path));
    const site = pageOptions?.site || this.getSiteNameFromPath(path);

    return super.getPage(
      resolvedPath,
      {
        locale: pageOptions?.locale,
        site,
        personalize: personalizeData,
      },
      fetchOptions
    );
  }
}
