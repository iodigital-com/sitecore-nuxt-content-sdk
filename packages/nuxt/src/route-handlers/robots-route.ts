// src/routes/robots-route.ts
import { H3Event, setResponseHeader, getRequestHeader, setResponseStatus, send } from 'h3';
import { defineCachedFunction } from 'nitro/cache';
import { SitecoreClient } from '@sitecore-content-sdk/content/client';
import { constants } from '@sitecore-content-sdk/core';
import { SiteInfo, SiteResolver } from '@sitecore-content-sdk/content/site';
import debug from '../debug';

const { ERROR_MESSAGES } = constants;

export type RobotsRouteOptions = {
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
 * Creates a route handler to serve the robots.txt file.
 * Fetches robots.txt content from Sitecore and serves it as plain text.
 * Resolves the correct site based on the incoming request hostname.
 * @param {RobotsRouteOptions} options - The options for the route handler.
 * @returns The route handler object with handle method.
 * @example
 * // server/routes/robots.txt.ts
 * import { createRobotsRoute } from '@sitecore-content-sdk/nuxt/routes';
 * import { client } from '../lib/sitecore-client';
 * import sites from '../../.sitecore/sites.json';
 *
 * const { handle } = createRobotsRoute({ client, sites });
 *
 * export default defineEventHandler(handle);
 * @public
 */
export const createRobotsRoute = (options: RobotsRouteOptions) => {
  const { client, sites, revalidate = 60 } = options;

  const siteResolver = new SiteResolver(sites);

  const getRobotsCached = defineCachedFunction(async (site: string) => client.getRobots(site), {
    maxAge: revalidate === false ? undefined : revalidate,
    name: 'robots',
  });

  /**
   * Handles an incoming robots.txt request.
   * Resolves the site by hostname, fetches the robots.txt content from Sitecore,
   * and sends it as a plain text response.
   * Returns 404 with a default disallow rule if no content is found.
   * Returns 500 if the Sitecore request fails.
   * @param {H3Event} event - The incoming H3 event
   * @returns {Promise<void>}
   * @throws Will throw an error if the event's hostname cannot be found in the site resolver.
   */
  const handle = async (event: H3Event): Promise<void> => {
    setResponseHeader(event, 'Content-Type', 'text/plain');

    const hostName =
      getRequestHeader(event, 'x-forwarded-host') ||
      getRequestHeader(event, 'host')?.split(':')[0] ||
      'localhost';

    const site = siteResolver.getByHost(hostName);

    const startTimestamp = Date.now();
    debug.robots('robots route handler start: %o', { hostName, siteName: site.name });

    try {
      const robotsContent = await getRobotsCached(site.name);

      if (!robotsContent) {
        setResponseStatus(event, 404);
        await send(event, 'User-agent: *\nDisallow: /');
        return;
      }

      await send(event, robotsContent);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      console.error(`Failed to fetch robots.txt from Sitecore for site "${site.name}": ${message}`);

      setResponseStatus(event, 500);
      await send(event, `Internal Server Error. ${ERROR_MESSAGES.CONTACT_SUPPORT}`);
    } finally {
      debug.robots('robots route handler end in %dms', Date.now() - startTimestamp);
    }
  };

  return { handle };
};
