// src/routes/robots-route.ts
import { H3Event, setResponseHeader, getRequestHeader, setResponseStatus, send } from 'h3';
import { defineCachedFunction } from 'nitro/cache';
import { SitecoreClient } from '@sitecore-content-sdk/content/client';
import { constants } from '@sitecore-content-sdk/core';
import { SiteInfo, SiteResolver } from '@sitecore-content-sdk/content/site';
import debug from '../debug';

const { ERROR_MESSAGES } = constants;

/**
 * Route handler for robots.txt requests in a Nuxt application.
 * Fetches robots.txt content from Sitecore and serves it as plain text.
 * Resolves the correct site based on the incoming request hostname.
 * @public
 * @example
 * // server/routes/robots.txt.ts
 * import { RobotsRoute } from '@sitecore-content-sdk/nuxt/routes';
 * import { client } from '../lib/sitecore-client';
 * import sites from '../../.sitecore/sites.json';
 *
 * const route = new RobotsRoute(client, sites);
 *
 * export default defineEventHandler((event) => route.handle(event));
 */
export class RobotsRoute {
  private siteResolver: SiteResolver;
  private getRobotsCached: (site: string) => Promise<string | null | undefined>;

  /**
   * @param {SitecoreClient} client - Sitecore client instance used to fetch robots.txt content
   * @param {SiteInfo[]} sites - List of sites used for site resolution by hostname
   * @param {number | false} revalidate - Cache revalidation interval in seconds. Pass false to cache indefinitely. Defaults to 60.
   */
  constructor(client: SitecoreClient, sites: SiteInfo[], revalidate: number | false = 60) {
    this.siteResolver = new SiteResolver(sites);
    this.getRobotsCached = defineCachedFunction(async (site: string) => client.getRobots(site), {
      maxAge: revalidate === false ? undefined : revalidate,
      name: 'robots',
    });
  }

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
  async handle(event: H3Event): Promise<void> {
    setResponseHeader(event, 'Content-Type', 'text/plain');

    const hostName =
      getRequestHeader(event, 'x-forwarded-host') ||
      getRequestHeader(event, 'host')?.split(':')[0] ||
      'localhost';

    const site = this.siteResolver.getByHost(hostName);

    const startTimestamp = Date.now();
    debug.robots('robots route handler start: %o', { hostName, siteName: site.name });

    try {
      const robotsContent = await this.getRobotsCached(site.name);

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
  }
}
