import { H3Event } from 'h3';
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

  const handle = async (event: H3Event) => {
    event.res.headers.set('Content-Type', 'text/plain');

    const hostName =
      event.req.headers.get('x-forwarded-host') ||
      event.req.headers.get('host')?.split(':')[0] ||
      'localhost';

    const site = hostName
      ? siteResolver.getByHost(hostName)
      : siteResolver.getByName(process.env.NUXT_PUBLIC_DEFAULT_SITE_NAME || '');

    if (!site) {
      console.warn(`No site found for hostname "${hostName}". Unable to serve robots.txt.`);
      event.res.status = 404;
      return 'User-agent: *\nDisallow: /';
    }

    const startTimestamp = Date.now();
    debug.robots('robots route handler start: %o', { hostName, siteName: site.name });

    try {
      const robotsContent = await client.getRobots(site.name);

      if (!robotsContent) {
        event.res.status = 404;
        return 'User-agent: *\nDisallow: /';
      }

      event.res.status = 200;
      return robotsContent;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      console.error(`Failed to fetch robots.txt from Sitecore for site "${site.name}": ${message}`);

      event.res.status = 500;
      return `Internal Server Error. ${ERROR_MESSAGES.CONTACT_SUPPORT}`;
    } finally {
      debug.robots('robots route handler end in %dms', Date.now() - startTimestamp);
    }
  };

  return { handle };
};
