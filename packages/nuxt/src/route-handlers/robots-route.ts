import { H3Event, setResponseHeader, getRequestHeader, setResponseStatus, send } from 'h3';
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
};

/**
 * Creates a route handler to serve the robots.txt file.
 * Fetches robots.txt content from Sitecore and serves it as plain text.
 * Resolves the correct site based on the incoming request hostname.
 *
 * Caching is handled by Nuxt's built-in route rules. Configure cache duration in `nuxt.config.ts`:
 * ```ts
 * routeRules: {
 *   '/robots.txt': { cache: { maxAge: 60 } },
 * }
 * ```
 * @param {RobotsRouteOptions} options - The options for the route handler.
 * @returns The route handler object with handle method.
 * @example
 * // server/routes/robots.txt.ts
 * import { createRobotsRoute } from '@sitecore-content-sdk/nuxt/routes';
 * import { useSitecoreClient } from '@sitecore-content-sdk/nuxt';
 * import sites from '../../.sitecore/sites.json';
 *
 * const { handle } = createRobotsRoute({ client: useSitecoreClient(), sites });
 *
 * export default defineEventHandler(handle);
 * @public
 */
export const createRobotsRoute = (options: RobotsRouteOptions) => {
  const { client, sites } = options;

  const siteResolver = new SiteResolver(sites);

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
      const robotsContent = await client.getRobots(site.name);

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
