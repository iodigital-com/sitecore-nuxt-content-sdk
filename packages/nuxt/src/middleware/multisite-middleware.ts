import { H3Event, getCookie, setCookie } from 'h3';
import { SITE_KEY } from '@sitecore-content-sdk/content/site';
import { MiddlewareBase, MiddlewareBaseConfig, REWRITE_HEADER_NAME } from './middleware';
import { SitecoreConfig } from '../config';
import { PREVIEW_KEY } from '@sitecore-content-sdk/content/editing';
import debug from '../debug';

/**
 * Cookie attributes for the site cookie.
 * @public
 */
export type CookieAttributes = {
  /** The Secure attribute of the site cookie. */
  secure: boolean;
  /** The HttpOnly attribute of the site cookie. */
  httpOnly: boolean;
  /** The SameSite attribute of the site cookie. */
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
 * Because Nuxt uses file-based routing with a `[site]` dynamic segment, the middleware
 * always runs regardless of whether multisite is configured with multiple sites.
 * Skipping it would cause 404 errors for regular page requests.
 * This middleware is only needed when your Nuxt app uses multisite routing
 * with a `[site]` dynamic segment. If your app serves a single site, do not
 * register this middleware.
 *
 * Site resolution order:
 * 1. `sc_site` cookie — when in Sitecore preview mode (`sc_preview` cookie present)
 * 2. `sc_site` query string parameter
 * 3. `site` query string parameter (used in Sitecore Page Builder preview)
 * 4. `sc_site` cookie — when `useCookieResolution` returns true
 * 5. Hostname-based resolution via `SiteResolver`
 *
 * On success, rewrites `event.node.req.url` to `/${siteName}${pathname}` and sets
 * the `sc_site` cookie for downstream middleware.
 * @example
 * // server/middleware/multisite.ts
 * import { MultisiteMiddleware } from '@sitecore-content-sdk/nuxt';
 *
 * const middleware = new MultisiteMiddleware({
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
   * Skips execution for static files, API routes, Nuxt internal routes, and when
   * a custom skip function returns true.
   *
   * In Sitecore preview mode, the site name is read from the `sc_site` cookie to
   * preserve site context during navigation between pages.
   *
   * Errors are caught and logged without re-throwing, so the request continues normally.
   * @param {H3Event} event - The incoming H3 event
   * @returns {Promise<void>}
   */
  handle = async (event: H3Event): Promise<void> => {
    try {
      // Debug: log wat er beschikbaar is op het event
      console.log('[Multisite] event.node:', !!event.node);
      console.log('[Multisite] event.node?.req:', !!event.node?.req);
      console.log('[Multisite] event.node?.req?.url:', event.node?.req?.url);
      console.log('[Multisite] event.node?.res:', !!event.node?.res);
      console.log('[Multisite] event.runtime:', !!event.runtime);
      console.log('[Multisite] event.runtime?.node:', !!event.runtime?.node);
      console.log('[Multisite] event.req:', !!event.req);
      console.log('[Multisite] event.req?.url:', (event.req as any)?.url);
      console.log('[Multisite] typeof event.req?.headers:', typeof (event.req as any)?.headers);
      console.log('[Multisite] event.req constructor:', event.req?.constructor?.name);
      console.log(
        '[Multisite] event.req headers constructor:',
        (event.req?.headers as any)?.constructor?.name
      );
      console.log(
        '[Multisite] typeof event.req?.headers?.get:',
        typeof (event.req as any)?.headers?.get
      );
      console.log('[Multisite] event.res:', !!event.res);
      console.log('[Multisite] typeof event.res?.headers:', typeof (event.res as any)?.headers);

      // Tijdelijk hardcoded om te testen of de rest werkt
      const rawUrl = (event.node?.req?.url || '/') as string;
      const host = (event.node?.req?.headers?.host || 'localhost') as string;
      console.log('[Multisite] rawUrl:', rawUrl, 'host:', host);

      const url = new URL(`http://${host}${rawUrl.startsWith('/') ? rawUrl : '/' + rawUrl}`);
      console.log('[Multisite] url:', url.href);

      const pathname =
        (event.node?.res?.getHeader(REWRITE_HEADER_NAME) as string) ||
        (event.res?.headers as any)?.get?.(REWRITE_HEADER_NAME) ||
        url.pathname;
      const language = this.getLanguage(event);
      const hostname = this.getHostHeader(event) || this.defaultHostname;

      const startTimestamp = Date.now();

      debug.multisite('multisite middleware start: %o', { pathname, language, hostname });

      if (this.disabled(event)) {
        debug.multisite('skipped (multisite middleware is disabled)');
        return;
      }

      const isSitecorePreview = getCookie(event, PREVIEW_KEY);

      const siteName = isSitecorePreview
        ? (getCookie(event, SITE_KEY) as string)
        : url.searchParams.get(SITE_KEY) ||
          url.searchParams.get('site') ||
          (this.config.useCookieResolution?.(event) && getCookie(event, SITE_KEY)) ||
          this.siteResolver.getByHost(hostname).name;

      const rewritePath = this.getSiteRewrite(pathname, siteName);

      this.rewrite(rewritePath, event);

      setCookie(event, SITE_KEY, siteName, {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
      } as CookieAttributes);

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
   * when the base disabled check matches (API routes, Nuxt internal routes, custom skip).
   * @param {H3Event} event - The incoming H3 event
   * @returns {boolean} `true` if the middleware should be skipped
   */
  protected disabled(event: H3Event): boolean {
    const rawUrl = (event.node?.req?.url || event.req?.url || '/') as string;
    const host = (event.node?.req?.headers?.host ||
      event.req?.headers?.get('host') ||
      'localhost') as string;
    const requestURL = new URL(rawUrl.startsWith('http') ? rawUrl : `http://${host}${rawUrl}`);
    const pathname = requestURL.pathname;
    return pathname.includes('.') || super.disabled(event);
  }

  /**
   * Generates the site-specific rewrite path by prepending the site name segment.
   * @example
   * // '/about' + 'my-site' → '/my-site/about'
   * // 'about' + 'my-site' → '/my-site/about'
   * @param {string} pathname - The pathname to rewrite
   * @param {string} siteName - The resolved site name
   * @returns {string} The rewritten path
   */
  protected getSiteRewrite(pathname: string, siteName: string): string {
    const path = pathname.startsWith('/') ? pathname : '/' + pathname;
    return `/${siteName}${path}`;
  }
}
