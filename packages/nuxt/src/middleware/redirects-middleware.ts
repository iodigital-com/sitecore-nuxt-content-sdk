import { H3Event, getRequestURL, sendRedirect, setResponseHeader } from 'h3';
import {
  RedirectsService,
  RedirectsServiceConfig,
  REDIRECT_TYPE_301,
  REDIRECT_TYPE_302,
  REDIRECT_TYPE_SERVER_TRANSFER,
  RedirectInfo,
  SiteInfo,
} from '@sitecore-content-sdk/content/site';
import {
  areURLSearchParamsEqual,
  escapeNonSpecialQuestionMarks,
  isRegexOrUrl,
  mergeURLSearchParams,
} from '@sitecore-content-sdk/core/tools';
import regexParser from 'regex-parser';
import { MiddlewareBase, MiddlewareBaseConfig, REWRITE_HEADER_NAME } from './middleware';
import { SitecoreConfig } from '../config';
import debug from '../debug';

const REGEXP_CONTEXT_SITE_LANG = new RegExp(/\$siteLang/, 'i');
const REGEXP_ABSOLUTE_URL = new RegExp('^(?:[a-z]+:)?//', 'i');

type RedirectResult = RedirectInfo & { matchedQueryString?: string };

/**
 * Configuration for the RedirectsMiddleware.
 *
 * Requires either Edge API configuration (`contextId`/`clientContextId`) or local API
 * configuration (`apiHost`/`apiKey`). When neither is present, the middleware initializes
 * without a redirects service and skips execution.
 * @public
 */
export type RedirectsMiddlewareConfig = Omit<RedirectsServiceConfig, 'fetch' | 'clientFactory'> &
  SitecoreConfig['api']['edge'] &
  Partial<NonNullable<SitecoreConfig['api']['local']>> &
  MiddlewareBaseConfig &
  SitecoreConfig['redirects'] & {
    /**
     * Optional override for the redirects service. When provided, the default
     * RedirectsService is not instantiated.
     */
    redirectsService?: RedirectsService;
  };

/**
 * Middleware that fetches redirect rules from Sitecore and applies them to incoming requests.
 *
 * Supports 301, 302, and server transfer (rewrite) redirect types.
 * Handles both static URL patterns and regex-based patterns.
 * Preserves query strings and language prefixes when configured.
 *
 * Requires the `LocaleMiddleware` to run before this middleware so that the
 * `x-sc-locale` response header is set and the locale can be resolved correctly.
 *
 * When neither Edge nor local API configuration is provided, the middleware initializes
 * in a degraded state and skips all redirect processing. This is expected when running
 * locally without a connected Sitecore environment.
 * @example
 * // server/middleware/redirects.ts
 * import { RedirectsMiddleware } from '@iodigital-com/sitecore-content-sdk-nuxt/middleware';
 *
 * const middleware = new RedirectsMiddleware({
 *   enabled: true,
 *   contextId: process.env.SITECORE_CONTEXT_ID,
 *   locales: ['en', 'nl'],
 *   sites: config.sites,
 * });
 *
 * export default defineEventHandler((event) => middleware.handle(event));
 * @public
 */
export class RedirectsMiddleware extends MiddlewareBase {
  protected redirectsService: RedirectsService | null;
  private locales: string[];

  /**
   * @param {RedirectsMiddlewareConfig} config - Redirects middleware configuration.
   * When neither Edge nor local API configuration is provided, `redirectsService` is set
   * to `null` and redirect processing is disabled.
   */
  constructor(protected config: RedirectsMiddlewareConfig) {
    super(config);
    this.locales = config.locales;

    if (this.config.redirectsService) {
      this.redirectsService = this.config.redirectsService;
      return;
    }

    const hasEdgeConfig = !!(this.config.contextId || this.config.clientContextId);
    const hasLocalConfig = !!(this.config.apiHost && this.config.apiKey);

    if (!hasEdgeConfig && !hasLocalConfig) {
      console.warn(
        '[RedirectsMiddleware] Redirects middleware requires either Edge configuration (contextId/clientContextId) or local API configuration (apiHost/apiKey). ' +
          'Redirects features will be disabled. This is expected when API configuration is not available.'
      );
      this.redirectsService = null;
      return;
    }

    const graphQLOptions = {
      api: {
        edge: {
          contextId: this.config.contextId,
          clientContextId: this.config.clientContextId,
          edgeUrl: this.config.edgeUrl,
        },
        ...(this.config.apiHost && this.config.apiKey
          ? {
              local: {
                apiHost: this.config.apiHost,
                apiKey: this.config.apiKey,
                path: this.config.path,
              },
            }
          : {}),
      },
    };

    this.redirectsService = new RedirectsService({
      ...config,
      clientFactory: this.getClientFactory(graphQLOptions),
      fetch: fetch,
    });
  }

  /**
   * Handles an incoming request by checking for matching redirect rules and applying them.
   *
   * Skips execution when:
   * - The middleware is globally disabled via config
   * - The request targets a static file, API route, or Nuxt internal route
   * - The request is a preview or prefetch
   * - No redirects service is configured
   * - No matching redirect rule is found
   *
   * For 301/302 redirects, sends an HTTP redirect response via `sendRedirect`.
   * For server transfer redirects, rewrites the request path in place.
   *
   * Errors are caught and logged without re-throwing, so the request continues normally.
   * @param {H3Event} event - The incoming H3 event
   * @returns {Promise<void>}
   */
  handle = async (event: H3Event): Promise<void> => {
    if (!this.config.enabled) {
      debug.redirects('skipped (redirects middleware is disabled globally)');
      return;
    }

    try {
      const url = getRequestURL(event);
      const pathname = url.pathname;
      const language = this.getLanguage(event);
      const hostname = this.getHostHeader(event) || this.defaultHostname;
      let site: SiteInfo | undefined;
      const startTimestamp = Date.now();

      debug.redirects('redirects middleware start: %o', {
        pathname,
        language,
        hostname,
      });

      if (this.disabled(event)) {
        debug.redirects('skipped (redirects middleware is disabled)');
        return;
      }

      if (this.isPreview(event)) {
        debug.redirects('skipped (preview)');
        return;
      }

      if (this.isPrefetch(event)) {
        debug.redirects('skipped (prefetch)');
        setResponseHeader(event, 'x-proxy-cache', 'no-cache');
        setResponseHeader(event, 'Cache-Control', 'no-store, must-revalidate');
        return;
      }

      site = this.getSite(event);

      const existsRedirect = await this.getExistsRedirect(event, site.name);

      if (!existsRedirect) {
        debug.redirects('skipped (redirect does not exist)');
        return;
      }

      debug.redirects('Matched redirect rule: %o', { existsRedirect });

      // Replace $siteLang token in target if exists
      existsRedirect.target = existsRedirect.target.replace(
        REGEXP_CONTEXT_SITE_LANG,
        site.language
      );

      const reqUrl = this.normalizeUrl(new URL(url.href));

      // Apply regex replacements to the target URL if the pattern is a regex
      const matched = reqUrl.pathname
        .replace(/\/*$/gi, '')
        .match(regexParser(existsRedirect.pattern));

      if (matched) {
        existsRedirect.target = existsRedirect.target.replace(
          /\$(\d+)/g,
          (_: string, index: string): string => matched[parseInt(index, 10)] || ''
        );
      }

      if (REGEXP_ABSOLUTE_URL.test(existsRedirect.target)) {
        await this.processAbsoluteUrlTarget(event, reqUrl, existsRedirect);
      } else {
        await this.processRelativeUrlTarget(event, reqUrl, existsRedirect, language);
      }

      debug.redirects('redirects middleware end in %dms: %o', Date.now() - startTimestamp, {
        target: existsRedirect.target,
        redirectType: existsRedirect.redirectType,
      });
    } catch (error) {
      console.log('Redirects middleware failed:');
      console.log(error);
    }
  };

  /**
   * Determines whether the middleware should be skipped for the current request.
   *
   * Returns `true` when the redirects service is not configured, the path contains
   * a file extension (static assets), or the base disabled check matches.
   * @param {H3Event} event - The incoming H3 event
   * @returns {boolean} `true` if the middleware should be skipped
   */
  protected disabled(event: H3Event): boolean {
    if (!this.redirectsService) {
      debug.redirects('skipped (redirects service not configured - API config required)');
      return true;
    }

    const { pathname } = getRequestURL(event);
    return pathname.includes('.') || super.disabled(event);
  }

  /**
   * Handles redirect logic for absolute (external) URLs.
   * Merges query strings when `isQueryStringPreserved` is set on the redirect rule.
   * @param {H3Event} event - The incoming H3 event
   * @param {URL} url - The normalized incoming URL
   * @param {RedirectResult} existsRedirect - The matched redirect rule
   * @returns {Promise<void>}
   */
  protected async processAbsoluteUrlTarget(
    event: H3Event,
    url: URL,
    existsRedirect: RedirectResult
  ): Promise<void> {
    let targetUrl = existsRedirect.target;

    if (url.search && existsRedirect.isQueryStringPreserved) {
      const incomingQS = new URLSearchParams(url.search);
      const [targetMainUrl, targetQS] = targetUrl.split('?');
      const mergedQueryString = mergeURLSearchParams(
        incomingQS,
        new URLSearchParams(targetQS || '')
      );
      targetUrl = `${targetMainUrl}?${mergedQueryString}`;
    }

    await this.dispatchRedirect(event, targetUrl, existsRedirect.redirectType);
  }

  /**
   * Handles redirect logic for relative (internal) URLs.
   * Resolves the target locale, merges query strings when configured, and applies
   * any site prefix from the `x-sc-rewrite` response header.
   * @param {H3Event} event - The incoming H3 event
   * @param {URL} url - The normalized incoming URL
   * @param {RedirectResult} existsRedirect - The matched redirect rule
   * @param {string} language - The resolved language for the current request
   * @returns {Promise<void>}
   */
  protected async processRelativeUrlTarget(
    event: H3Event,
    url: URL,
    existsRedirect: RedirectResult,
    language: string
  ): Promise<void> {
    let targetUrl = existsRedirect.target;
    const possiblyLocalePrefix = targetUrl.split('/')[1];
    let targetLocale = '';

    if (this.locales.includes(possiblyLocalePrefix)) {
      targetLocale = possiblyLocalePrefix;
      targetUrl = targetUrl.replace(`/${possiblyLocalePrefix}`, '');
    } else if (existsRedirect.isLanguagePreserved) {
      targetLocale = language;
    }

    let [targetMainUrl, targetQS] = targetUrl.split('?');

    if (url.search && existsRedirect.isQueryStringPreserved) {
      const incomingQS = new URLSearchParams(url.search);
      targetQS = mergeURLSearchParams(incomingQS, new URLSearchParams(targetQS || ''));
    }

    const prepareNewURL = new URL(`${targetMainUrl}${targetQS ? '?' + targetQS : ''}`, url.origin);

    let rewritePath = `${prepareNewURL.pathname}${prepareNewURL.search || ''}`;

    if (targetLocale) {
      rewritePath = `/${targetLocale}${rewritePath}`;
    }

    // Preserve site prefix from x-sc-rewrite header if present
    if (existsRedirect.redirectType === REDIRECT_TYPE_SERVER_TRANSFER) {
      const incomingRewrite = event.node.res.getHeader(REWRITE_HEADER_NAME) as string | undefined;
      if (incomingRewrite && targetLocale) {
        const localePattern = `/${targetLocale}/`;
        const localeIndex = incomingRewrite.indexOf(localePattern);
        if (localeIndex > 0) {
          const sitePrefix = incomingRewrite.substring(0, localeIndex);
          rewritePath = `${sitePrefix}${rewritePath}`;
        }
      }
    }

    await this.dispatchRedirect(event, rewritePath, existsRedirect.redirectType);
  }

  /**
   * Dispatches a redirect or rewrite based on the redirect type.
   *
   * - `REDIRECT_TYPE_301` → HTTP 301 redirect via `sendRedirect`
   * - `REDIRECT_TYPE_302` → HTTP 302 redirect via `sendRedirect`
   * - `REDIRECT_TYPE_SERVER_TRANSFER` → internal rewrite via `this.rewrite`
   * - Unknown types → falls back to a 302 redirect with a console warning
   * @param {H3Event} event - The incoming H3 event
   * @param {string} target - The target URL or path
   * @param {string} type - The redirect type constant
   * @returns {Promise<void>}
   */
  protected async dispatchRedirect(event: H3Event, target: string, type: string): Promise<void> {
    switch (type) {
      case REDIRECT_TYPE_301:
        await sendRedirect(event, target, 301);
        break;
      case REDIRECT_TYPE_302:
        await sendRedirect(event, target, 302);
        break;
      case REDIRECT_TYPE_SERVER_TRANSFER:
        this.rewrite(target, event);
        break;
      default:
        console.warn(
          `[RedirectsMiddleware] Unsupported redirect type: ${type}. Defaulting to 302 redirect.`
        );
        await sendRedirect(event, target, 302);
    }
  }

  /**
   * Finds a matching redirect rule for the current request by comparing the normalized
   * incoming URL against all redirect rules fetched from the Sitecore redirects service.
   *
   * Handles both static URL patterns and regex-based patterns. For regex patterns,
   * language prefixes are stripped before matching and query strings are evaluated separately.
   * @param {H3Event} event - The incoming H3 event
   * @param {string} siteName - The resolved Sitecore site name
   * @returns {Promise<RedirectResult | undefined>} The matched redirect rule, or `undefined` if none found
   */
  protected async getExistsRedirect(
    event: H3Event,
    siteName: string
  ): Promise<RedirectResult | undefined> {
    if (!this.redirectsService) {
      return undefined;
    }

    const url = getRequestURL(event);
    const normalizedUrl = this.normalizeUrl(new URL(url.href));
    const incomingURL = normalizedUrl.pathname;
    const incomingQS = normalizedUrl.search ?? '';
    const locale = this.getLanguage(event);
    const normalizedPath = incomingURL.replace(/\/*$/gi, '').toLowerCase();
    const redirects = await this.redirectsService.fetchRedirects(siteName);
    const modifyRedirects = structuredClone(redirects);
    let matchedQueryString: string | undefined;
    const localePath = `/${locale.toLowerCase()}${normalizedPath}`;

    return modifyRedirects.length
      ? modifyRedirects.find((redirect: RedirectResult) => {
          if (isRegexOrUrl(redirect.pattern) === 'url') {
            const urlArray = redirect.pattern.endsWith('/')
              ? redirect.pattern.slice(0, -1).split('?')
              : redirect.pattern.split('?');
            const patternQS = urlArray[1];
            let patternPath = urlArray[0].toLowerCase();
            const patternParts = patternPath.split('/');
            const maybeLocale = patternParts[1].toLowerCase();

            if (new RegExp(this.locales.join('|'), 'i').test(maybeLocale)) {
              patternPath = patternPath.replace(`/${patternParts[1]}`, `/${maybeLocale}`);
            }

            return (
              (patternPath === localePath || patternPath === normalizedPath) &&
              (!patternQS ||
                areURLSearchParamsEqual(
                  new URLSearchParams(patternQS),
                  new URLSearchParams(incomingQS)
                ))
            );
          }

          redirect.pattern = escapeNonSpecialQuestionMarks(
            '^' + redirect.pattern.replace(new RegExp(`^[^]?/${locale}/`, 'gi'), '')
          );

          redirect.pattern = `/^\/${redirect.pattern
            .replace(/^\/|\/$/g, '')
            .replace(/^\^\/|\/\$$/g, '')
            .replace(/^\^|\$$/g, '')
            .replace(/\$\/gi$/g, '')}[\/]?$/i`;

          matchedQueryString = [
            regexParser(redirect.pattern).test(`/${localePath}${incomingQS}`),
            regexParser(redirect.pattern).test(`${normalizedPath}${incomingQS}`),
          ].some(Boolean)
            ? incomingQS
            : undefined;

          redirect.matchedQueryString = matchedQueryString || '';

          return (
            !!(
              regexParser(redirect.pattern).test(`/${locale}${incomingURL}`) ||
              regexParser(redirect.pattern).test(incomingURL) ||
              matchedQueryString
            ) && (redirect.locale ? redirect.locale.toLowerCase() === locale.toLowerCase() : true)
          );
        })
      : undefined;
  }

  /**
   * Normalizes the incoming URL by removing Next.js-style `path=` query parameters
   * that are added when using the `Link` component.
   * @example
   * // '/about/contact?path=about&path=contact' → '/about/contact'
   * @param {URL} url - The URL to normalize
   * @returns {URL} The normalized URL
   */
  protected normalizeUrl(url: URL): URL {
    if (!url.search) {
      return url;
    }

    const splittedPathname = url.pathname
      .split('/')
      .filter((route: string) => route)
      .map((route) => `path=${route}`);

    const newQueryString = url.search
      .replace(/^\?/, '')
      .split('&')
      .filter((param) => !splittedPathname.includes(param))
      .join('&');

    const newUrl = new URL(
      `${url.pathname.toLowerCase()}${newQueryString ? '?' + newQueryString : ''}`,
      url.origin
    );

    url.search = newUrl.search;
    url.pathname = newUrl.pathname.toLowerCase();

    return url;
  }
}
