import { H3Event, getRequestURL, setResponseHeader } from 'h3';
import { MiddlewareBase, MiddlewareBaseConfig, LOCALE_HEADER_NAME } from './middleware';
import debug from '../debug';

/**
 * Configuration for the LocaleMiddleware.
 * @public
 */
export type LocaleMiddlewareConfig = MiddlewareBaseConfig & {
  /**
   * List of locales supported by the application.
   * Used to extract the active locale from the request path.
   */
  locales: string[];
};

/**
 * Middleware that resolves the active locale from the request path and shares it
 * with downstream middleware via the `x-sc-locale` response header.
 *
 * Nuxt i18n handles the actual locale routing and path rewriting. This middleware
 * only reads the resolved locale and makes it available to other middleware in the chain,
 * such as PersonalizeMiddleware, which reads the header via `getLanguage()`.
 * @example
 * // server/middleware/locale.ts
 * import { LocaleMiddleware } from '@sitecore-content-sdk/nuxt/middleware';
 *
 * const middleware = new LocaleMiddleware({
 *   locales: ['en', 'nl', 'de'],
 *   sites: config.sites,
 * });
 *
 * export default defineEventHandler((event) => middleware.handle(event));
 * @public
 */
export class LocaleMiddleware extends MiddlewareBase {
  /**
   * @param {LocaleMiddlewareConfig} config - Locale middleware configuration
   */
  constructor(protected config: LocaleMiddlewareConfig) {
    super(config);
  }

  /**
   * Handles an incoming request by resolving the active locale and setting
   * the `x-sc-locale` response header.
   *
   * Skips execution for static files, API routes, and Nuxt internal routes.
   * Falls back to `config.defaultLanguage` or `'en'` when no locale is found in the path.
   * @param {H3Event} event - The incoming H3 event
   * @returns {Promise<void>}
   */
  handle = async (event: H3Event): Promise<void> => {
    try {
      const { pathname } = getRequestURL(event);
      const locale = this.getLocaleFromPath(pathname) ?? this.getLanguage(event);

      debug.locale('locale middleware start: %o', { pathname, locale });

      if (this.disabled(event)) {
        debug.locale('skipped (locale middleware is disabled)');
        return;
      }

      setResponseHeader(event, LOCALE_HEADER_NAME, locale);
      event.node.req.headers[LOCALE_HEADER_NAME] = locale;

      const matchedLocale = this.config.locales.find(
        (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
      );

      let rewrittenPath: string | undefined;

      if (matchedLocale) {
        const strippedPath =
          pathname === `/${matchedLocale}` ? '/' : pathname.replace(`/${matchedLocale}/`, '/');
        const qs = event.path.includes('?') ? '?' + event.path.split('?')[1] : '';
        rewrittenPath = strippedPath + qs;
        event.node.req.url = rewrittenPath;
      }

      debug.locale('locale middleware end: %o', { pathname, locale, rewrittenPath });
    } catch (error) {
      console.log('Locale middleware failed:');
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
   * Extracts the active locale from the request path by matching against the configured locales.
   * @example
   * // '/nl-NL/about' → 'nl-NL'
   * // '/en' → 'en'
   * // '/about' → undefined
   * @param {string} path - The request pathname
   * @returns {string | undefined} The matched locale, or `undefined` if not found
   */
  protected getLocaleFromPath(path: string): string | undefined {
    return this.config.locales.find(
      (locale) => path.includes(`/${locale}/`) || path.endsWith(`/${locale}`)
    );
  }
}
