import { SitecoreClient, SitemapXmlOptions } from '@sitecore-content-sdk/content/client';
import { SiteInfo, SiteResolver } from '@sitecore-content-sdk/content/site';
import { H3Event, setResponseHeader, setResponseStatus, send } from 'h3';
import debug from '../debug';
import { constants } from '@sitecore-content-sdk/core';

const { ERROR_MESSAGES } = constants;

export type SitemapRouteOptions = {
  /**
   * Sitecore client instance used to fetch sitemap.xml content.
   */
  client: SitecoreClient;
  /**
   * List of sites used for site resolution by hostname.
   */
  sites: SiteInfo[];
};

/**
 * Creates a route handler to serve the sitemap.xml file.
 * Fetches sitemap content from Sitecore and serves it as XML.
 *
 * Caching is handled by Nuxt's built-in route rules. Configure cache duration in `nuxt.config.ts`:
 * ```ts
 * routeRules: {
 *   '/sitemap.xml': { cache: { maxAge: 60 } },
 * }
 * ```
 * @param {SitemapRouteOptions} options - The options for the route handler.
 * @returns The route handler.
 * @public
 */
export function createSitemapRoute(options: SitemapRouteOptions) {
  const { client, sites } = options;

  const siteResolver = new SiteResolver(sites);

  const getOptions = (event: H3Event): SitemapXmlOptions => {
    const id = event.path.match(/^\/sitemap-(\d+)\.xml$/i)?.[1] || '';
    const reqHost = event.headers.get('x-forwarded-host') || event.headers.get('host') || '';
    const reqProtocol = event.headers.get('x-forwarded-proto') || 'https';
    const site = siteResolver.getByHost(reqHost);

    return { reqHost, reqProtocol, id, siteName: site.name };
  };

  const handle = async (event: H3Event): Promise<void> => {
    const startTimestamp = Date.now();
    const sitemapOptions = getOptions(event);

    debug.sitemap('sitemap route handler start: %o', { sitemapOptions });

    try {
      const xml = await client.getSiteMap(sitemapOptions);

      setResponseHeader(event, 'Content-Type', 'text/xml;charset=utf-8');
      await send(event, xml);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      console.error(`Failed to fetch sitemap from Sitecore: ${message}`);

      if (error instanceof Error && error.message === 'REDIRECT_404') {
        setResponseStatus(event, 404);
        await send(event, 'Not Found');
      } else {
        setResponseStatus(event, 500);
        await send(event, `Internal Server Error.  ${ERROR_MESSAGES.CONTACT_SUPPORT}`);
      }
    } finally {
      debug.sitemap('sitemap route handler end in %dms', Date.now() - startTimestamp);
    }
  };

  return { handle };
}
