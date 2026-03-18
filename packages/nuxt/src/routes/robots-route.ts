// src/routes/robots-route.ts
import { H3Event, setHeader, getRequestHeader, setResponseStatus, send } from 'h3';
import { SitecoreClient } from '@sitecore-content-sdk/content/client';
import { constants } from '@sitecore-content-sdk/core';
import { SiteInfo, SiteResolver } from '@sitecore-content-sdk/content/site';

const { ERROR_MESSAGES } = constants;

/**
 * Route for handling robots.txt requests in a Nuxt application.
 * @public
 */
export class RobotsRoute {
  private siteResolver: SiteResolver;

  constructor(
    private client: SitecoreClient,
    sites: SiteInfo[],
    private revalidate: number | false = 60
  ) {
    this.siteResolver = new SiteResolver(sites);
  }

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
