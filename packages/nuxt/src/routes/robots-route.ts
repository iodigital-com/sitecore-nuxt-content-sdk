// src/routes/robots-route.ts
import { H3Event, setHeader, getRequestHeader, setResponseStatus, send } from 'h3';
import { SitecoreClient } from '@sitecore-content-sdk/content/client';
import { constants } from '@sitecore-content-sdk/core';
import { SiteInfo, SiteResolver } from '@sitecore-content-sdk/content/site';

const { ERROR_MESSAGES } = constants;

/**
 * Route handler for robots.txt requests in a Nuxt application.
 * Fetches robots.txt content from Sitecore and serves it as plain text.
 * Resolves the correct site based on the incoming request hostname.
 * @example
 * // server/routes/robots.txt.ts
 * import { RobotsRoute } from '@sitecore-content-sdk/nuxt/routes';
 * import { client } from '../lib/sitecore-client';
 * import sites from '../../.sitecore/sites.json';
 *
 * const route = new RobotsRoute(client, sites);
 *
 * export default defineEventHandler((event) => route.handle(event));
 * @public
 */
export class RobotsRoute {
  private siteResolver: SiteResolver;

  /**
   * @param {SitecoreClient} client - Sitecore client instance used to fetch robots.txt content
   * @param {SiteInfo[]} sites - List of sites used for site resolution by hostname
   */
  constructor(private client: SitecoreClient, sites: SiteInfo[]) {
    this.siteResolver = new SiteResolver(sites);
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
    setHeader(event, 'Content-Type', 'text/plain');

    const hostName =
      getRequestHeader(event, 'x-forwarded-host') ||
      getRequestHeader(event, 'host')?.split(':')[0] ||
      'localhost';

    const site = this.siteResolver.getByHost(hostName);
    try {
      const robotsContent = await this.client.getRobots(site.name);

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
    }
  }
}
