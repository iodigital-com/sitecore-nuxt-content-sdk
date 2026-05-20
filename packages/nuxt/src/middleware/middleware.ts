import { H3Event, getCookie, getRequestHeader } from 'h3';
import { SITE_KEY, SiteInfo, SiteResolver } from '@sitecore-content-sdk/content/site';
import {
  createGraphQLClientFactory,
  GraphQLClientOptions,
} from '@sitecore-content-sdk/content/client';
import { GraphQLRequestClientFactory } from '@sitecore-content-sdk/core';
import { PreviewCookies } from '../utils/editing-utils';

/**
 * Header name used to share the rewrite path between proxies in the middleware chain.
 */
export const REWRITE_HEADER_NAME = 'x-sc-rewrite';

/**
 *  Header name used by LocaleMiddleware to share the resolved locale with subsequent proxies.
 */
export const LOCALE_HEADER_NAME = 'x-sc-locale';

/**
 * The interface for the Middleware configuration
 * @public
 */
export type MiddlewareBaseConfig = {
  /**
   * function, determines if the middleware execution should be skipped, based on cookie, header, or other considerations
   * @param {H3Event} event event object from middleware handler
   */
  skip?: (event: H3Event) => boolean;

  /**
   * Fallback hostname in case `host` header is not present
   * @default localhost
   */
  defaultHostname?: string;

  /**
   * Fallback language in locale cannot be extracted from request URL
   * @default 'en'
   */
  defaultLanguage?: string;

  /**
   * Site resolution implementation by name/hostname
   */
  sites: SiteInfo[];
};

/**
 * Middleware handler class to be extended by all middleware implementations
 * @public
 */
export abstract class MiddlewareHandler {
  /**
   * Handler method to execute middleware logic
   * @param {H3Event} event
   */
  abstract handle(event: H3Event): Promise<void>;
}

/**
 * Base middleware class with common methods
 * @public
 */
export abstract class MiddlewareBase extends MiddlewareHandler {
  protected defaultHostname: string;
  protected siteResolver: SiteResolver;

  /**
   * @param {MiddlewareBaseConfig} config - Middleware configuration
   */
  constructor(protected config: MiddlewareBaseConfig) {
    super();
    this.siteResolver = new SiteResolver(config.sites);
    this.defaultHostname = config.defaultHostname || 'localhost';
  }

  /**
   * Determines if mode is preview
   * @param {H3Event} event
   * @returns {boolean} is preview
   */
  protected isPreview(event: H3Event): boolean {
    return !!getCookie(event, PreviewCookies.PREVIEW);
  }

  /**
   * Determines if the request is a Nuxt prefetch request
   * @param {H3Event} event
   * @returns {boolean} is prefetch
   */
  protected isPrefetch(event: H3Event): boolean {
    const isMobile = event.req.headers.get('sec-ch-ua-mobile') === '?1';
    const userAgent = event.req.headers.get('user-agent') || '';
    const isKnownPlatform = /iPhone|Mac|Linux|Windows|Android/i.test(userAgent);
    const isKnownDevice = isMobile || isKnownPlatform;

    const purpose = event.req.headers.get('purpose');
    const fetchMode = event.req.headers.get('sec-fetch-mode');

    if (isKnownDevice && fetchMode === 'navigate') {
      return false;
    }

    return purpose === 'prefetch' || fetchMode === 'no-cors';
  }

  /**
   * Determines if the middleware should be skipped for the current request.
   * Returns true for Nuxt internal routes, API routes, Sitecore API routes,
   * or when the custom skip function returns true.
   * @param {H3Event} event
   * @returns {boolean} true if the middleware should be skipped
   */
  protected disabled(event: H3Event): boolean {
    const rawUrl = (event.node?.req?.url || event.req?.url || '/') as string;
    const host = (event.node?.req?.headers?.host ||
      event.req?.headers?.get('host') ||
      'localhost') as string;
    const requestURL = new URL(rawUrl.startsWith('http') ? rawUrl : `http://${host}${rawUrl}`);
    const pathname = requestURL.pathname;

    return (
      pathname.startsWith('/api/') || // Ignore Nuxt API calls
      pathname.startsWith('/sitecore/') || // Ignore Sitecore API calls
      pathname.startsWith('/_nuxt') || // Ignore Nuxt internal calls
      !!(this.config.skip && this.config.skip(event))
    );
  }

  /**
   * Provides used language
   * @param {H3Event} event
   * @returns {string} language
   */
  protected getLanguage(event: H3Event): string {
    return (
      (event.res?.headers?.get?.(LOCALE_HEADER_NAME) as string) ||
      this.config.defaultLanguage ||
      'en'
    );
  }

  /**
   * Extract 'host' header.
   * @param {H3Event} event
   * @returns {string | undefined} The host header, `undefined` will be returned instead of the default value when unavailable
   */
  protected getHostHeader(event: H3Event): string | undefined {
    return (
      getRequestHeader(event, 'x-forwarded-host') || getRequestHeader(event, 'host')?.split(':')[0]
    );
  }

  /**
   * Get site information. If site name is stored in cookie, use it, otherwise resolve by hostname
   * - If site can't be resolved by site name cookie use default site info based on provided parameters
   * - If site can't be resolved by hostname, resolves by default hostname
   * @param {H3Event} event
   * @returns {SiteInfo} site information
   */
  protected getSite(event: H3Event): SiteInfo {
    const siteNameCookie = getCookie(event, SITE_KEY);
    const hostName = this.getHostHeader(event) || this.defaultHostname;

    if (siteNameCookie) {
      // Usually we should be able to resolve site by cookie
      // in case of Sitecore Preview mode, there can be a case that new site was created
      // but it's not present in the sitemap, so we fallback to default site info
      return (
        this.siteResolver.getByName(siteNameCookie) || {
          name: siteNameCookie,
          language: this.getLanguage(event),
          hostName: '*',
        }
      );
    }

    try {
      return this.siteResolver.getByHost(hostName);
    } catch {
      // Host not found in sites config — typical during local development
      // with empty sites.json. Fall back to first configured site, or
      // return a default site info when no sites are configured.
      return (
        this.siteResolver.sites[0] || {
          name: 'default',
          language: this.getLanguage(event),
          hostName,
        }
      );
    }
  }

  /**
   * Rewrites the request path for subsequent handling.
   * @param {string} rewritePath - The destination path
   * @param {H3Event} event - The incoming H3 event
   * @param {boolean} [skipHeader] - When true, does not write the x-sc-rewrite header
   * @returns {void}
   */
  protected rewrite(rewritePath: string, event: H3Event, skipHeader?: boolean): void {
    const nodeReq = event.runtime?.node?.req;
    if (nodeReq) {
      nodeReq.url = rewritePath;
    }

    if (!skipHeader) {
      event.res.headers.set(REWRITE_HEADER_NAME, rewritePath);
    }
  }

  /**
   * Creates a new GraphQLRequestClientFactory instance
   * @param {GraphQLClientOptions} graphQLOptions content sdk config
   * @returns {GraphQLRequestClientFactory} GraphQLRequestClientFactory instance
   */
  protected getClientFactory(graphQLOptions: GraphQLClientOptions): GraphQLRequestClientFactory {
    return createGraphQLClientFactory(graphQLOptions);
  }
}
