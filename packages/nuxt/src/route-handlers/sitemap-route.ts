import { SitecoreClient, SitemapXmlOptions } from '@sitecore-content-sdk/content/client';
import { SiteInfo, SiteResolver } from '@sitecore-content-sdk/content/site';
import { H3Event, setResponseHeader, setResponseStatus, send } from 'h3';
import { defineCachedFunction } from 'nitro/cache';
import debug from '../debug';
import { constants } from '@sitecore-content-sdk/core';

const { ERROR_MESSAGES } = constants;

export type SitemapRouteOptions = {
  /**
   * Sitecore client instance used to fetch robots.txt content.
   */
  client: SitecoreClient;
  /**
   * List of sites used for site resolution by hostname.
   */
  sites: SiteInfo[];
  /**
   * Cache revalidation interval in seconds.
   * Pass false to cache indefinitely.
   * Default is 60 seconds.
   */
  revalidate?: number | false;
};

/**
 * Creates a route handler to serve the sitemap.xml file.
 * @param {SitemapRouteOptions} options - The options for the route handler.
 * @returns The route handler.
 * @public
 */
export function createSitemapRoute(options: SitemapRouteOptions) {
  const { client, sites, revalidate = 60 } = options;

  const siteResolver = new SiteResolver(sites);

  const getOptions = (event: H3Event): SitemapXmlOptions => {
    const id = event.path.match(/^\/sitemap-(\d+)\.xml$/i)?.[1] || '';
    const reqHost = event.headers.get('x-forwarded-host') || event.headers.get('host') || '';
    const reqProtocol = event.headers.get('x-forwarded-proto') || 'https';
    const site = siteResolver.getByHost(reqHost);

    return { reqHost, reqProtocol, id, siteName: site.name };
  };

  const getSitemapCached = defineCachedFunction(
    async (options: SitemapXmlOptions) => client.getSiteMap(options),
    {
      maxAge: revalidate === false ? undefined : revalidate,
      name: 'sitemap',
    }
  );

  /**
   * Handles an incoming sitemap.xml request.
   * Resolves the site by hostname, fetches the sitemap.xml content from Sitecore,
   * and sends it as an XML response.
   * Returns 404 with a default disallow rule if no content is found.
   * Returns 500 if the Sitecore request fails.
   * @param {H3Event} event - The incoming H3 event
   * @returns {Promise<void>}
   * @throws Will throw an error if the event's hostname cannot be found in the site resolver.
   */
  const handle = async (event: H3Event): Promise<void> => {
    const startTimestamp = Date.now();

    const options = getOptions(event);

    debug.sitemap('sitemap route handler start: %o', { options });

    try {
      const xml = await getSitemapCached(options);

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
