import { H3Event, getCookie, setCookie, getRequestURL } from 'h3';
import { getSiteRewrite, SITE_KEY } from '@sitecore-content-sdk/content/site';
import { MiddlewareBase, MiddlewareBaseConfig, REWRITE_HEADER_NAME } from './middleware';
import { SitecoreConfig } from '../config';
import { PREVIEW_KEY } from '@sitecore-content-sdk/content/editing';
import debug from '../debug';

/**
 * Defines the attributes of a cookie used in the multisite middleware.
 * @public
 */
export type CookieAttributes = {
  /** the Secure attribute of the site cookie */
  secure: boolean;
  /** the HttpOnly attribute of the site cookie */
  httpOnly: boolean;
  /** the SameSite attribute of the site cookie */
  sameSite?: true | false | 'lax' | 'strict' | 'none' | undefined;
};

/**
 * Configuration for the MultisiteMiddleware.
 * @public
 */
export type MultisiteMiddlewareConfig = MiddlewareBaseConfig & SitecoreConfig['multisite'];

/**
 * Middleware that resolves the active Sitecore site for each request and rewrites
 * the request path to include the site segment.
 *
 * Site resolution order:
 * 1. `sc_site` query string parameter
 * 2. `site` query string parameter (used in Page Builder preview)
 * 3. `sc_site` cookie (when `useCookieResolution` returns true)
 * 4. Hostname-based resolution via `SiteResolver`
 *
 * In Sitecore preview mode (`sc_preview` cookie present), the site name is read
 * directly from the `sc_site` cookie to preserve site context during navigation.
 *
 * On success, rewrites `event.node.req.url` to the site-specific path and sets
 * the `sc_site` cookie for downstream middleware.
 * @example
 * // server/middleware/multisite.ts
 * import { MultisiteMiddleware } from '@sitecore-content-sdk/nuxt';
 *
 * const middleware = new MultisiteMiddleware({
 *   enabled: true,
 *   useCookieResolution: () => true,
 *   sites: config.sites,
 * });
 *
 * export default defineEventHandler((event) => middleware.handle(event));
 * @public
 */
export class MultisiteMiddleware extends MiddlewareBase {
  /**
   * @param {MultisiteMiddlewareConfig} config - Multisite middleware configuration
   */
  constructor(protected config: MultisiteMiddlewareConfig) {
    super(config);
  }

  /**
   * Handles an incoming request by resolving the active site and rewriting the path.
   *
   * Skips execution when:
   * - The middleware is globally disabled via config (unless in preview mode)
   * - The request targets a static file, API route, or Nuxt internal route
   * - The request is a preview (unless site name preservation is needed)
   *
   * Errors are caught and logged without re-throwing, so the request continues normally.
   * @param {H3Event} event - The incoming H3 event
   * @returns {Promise<void>}
   */
  handle = async (event: H3Event): Promise<void> => {
    try {
      const pathname =
        (event.node.res.getHeader(REWRITE_HEADER_NAME) as string) || getRequestURL(event).pathname;
      const language = this.getLanguage(event);
      const hostname = this.getHostHeader(event) || this.defaultHostname;
      const startTimestamp = Date.now();

      debug.multisite('multisite middleware start: %o', {
        pathname,
        language,
        hostname,
      });

      const isSitecorePreview = getCookie(event, PREVIEW_KEY);

      if (!isSitecorePreview) {
        if (!this.config.enabled) {
          this.shouldWarnWhenDisabled();
          if (this.shouldSkipWhenDisabled()) {
            debug.multisite('skipped (multisite middleware is disabled globally)');
            return;
          }
        }

        if (this.disabled(event)) {
          debug.multisite('skipped (multisite middleware is disabled)');
          return;
        }
      }

      let siteName: string;

      if (isSitecorePreview) {
        siteName = getCookie(event, SITE_KEY) as string;
      } else {
        const url = getRequestURL(event);
        siteName =
          url.searchParams.get(SITE_KEY) ||
          url.searchParams.get('site') ||
          (this.config.useCookieResolution &&
            this.config.useCookieResolution(event) &&
            getCookie(event, SITE_KEY)) ||
          this.siteResolver.getByHost(hostname).name;
      }

      const rewritePath = this.getSiteRewrite(pathname, siteName);

      this.rewrite(rewritePath, event);

      const defaultCookieAttributes: CookieAttributes = {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
      };

      setCookie(event, SITE_KEY, siteName, defaultCookieAttributes);

      debug.multisite('multisite middleware end in %dms: %o', Date.now() - startTimestamp, {
        rewritePath,
        siteName,
      });
    } catch (error) {
      console.log('Multisite middleware failed:');
      console.log(error);
    }
  };

  /**
   * Determines whether the middleware should be skipped for the current request.
   * Returns `true` for paths containing a file extension (static assets) or
   * when the base disabled check matches.
   * @param {H3Event} event - The incoming H3 event
   * @returns {boolean} `true` if the middleware should be skipped
   */
  protected disabled(event: H3Event): boolean {
    const { pathname } = getRequestURL(event);
    return pathname.includes('.') || super.disabled(event);
  }

  /**
   * Called when multisite is disabled. Override in subclasses to show
   * environment-specific warnings.
   */
  protected shouldWarnWhenDisabled(): void {
    // Base implementation does nothing - subclasses can override to show warnings
  }

  /**
   * Determines if the middleware should be skipped when multisite is disabled.
   * Override in subclasses to provide environment-specific behaviour.
   * @returns {boolean} `true` if the middleware should be skipped when disabled
   */
  protected shouldSkipWhenDisabled(): boolean {
    return true;
  }

  /**
   * Generates a site-specific rewrite path based on the provided pathname and site name.
   * @example
   * // '/about' + 'my-site' → '/_site_my-site/about'
   * @param {string} pathname - The pathname to rewrite
   * @param {string} siteName - The resolved site name
   * @returns {string} The rewritten path
   */
  protected getSiteRewrite(pathname: string, siteName: string): string {
    return getSiteRewrite(pathname, { siteName });
  }
}
