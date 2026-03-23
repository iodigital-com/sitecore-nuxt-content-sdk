import {
  H3Event,
  getCookie,
  getRequestHeader,
  getResponseHeader,
  getRequestURL,
  setResponseHeader,
} from 'h3';
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
 *  Header name used by LocaleProxy to share the resolved locale with subsequent proxies.
 */
export const LOCALE_HEADER_NAME = 'x-sc-locale';

/**
 * The interface for the Proxy configuration
 * @public
 */
export type ProxyBaseConfig = {
  /**
   * function, determines if the proxy execution should be skipped, based on cookie, header, or other considerations
   * @param {H3Event} event event object from proxy handler
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
 * Proxy handler class to be extended by all proxy implementations
 * @public
 */
export abstract class ProxyHandler {
  /**
   * Handler method to execute proxy logic
   * @param {H3Event} event
   */
  abstract handle(event: H3Event): Promise<void>;
}

/**
 * Base proxy class with common methods
 * @public
 */
export abstract class ProxyBase extends ProxyHandler {
  protected defaultHostname: string;
  protected siteResolver: SiteResolver;

  /**
   * @param {ProxyBaseConfig} config - Proxy configuration
   */
  constructor(protected config: ProxyBaseConfig) {
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
    const isMobile = getRequestHeader(event, 'sec-ch-ua-mobile') === '?1';
    const userAgent = getRequestHeader(event, 'user-agent') || '';
    const isKnownPlatform = /iPhone|Mac|Linux|Windows|Android/i.test(userAgent);
    const isKnownDevice = isMobile || isKnownPlatform;

    const purpose = getRequestHeader(event, 'purpose');
    const fetchMode = getRequestHeader(event, 'sec-fetch-mode');

    if (isKnownDevice && fetchMode === 'navigate') {
      return false;
    }

    return purpose === 'prefetch' || fetchMode === 'no-cors';
  }

  /**
   * Determines if the proxy should be skipped for the current request.
   * Returns true for Nuxt internal routes, API routes, Sitecore API routes,
   * or when the custom skip function returns true.
   * @param {H3Event} event
   * @returns {boolean} true if the proxy should be skipped
   */
  protected disabled(event: H3Event): boolean {
    const pathname = getRequestURL(event).pathname;

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
      (getResponseHeader(event, LOCALE_HEADER_NAME) as string) ||
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

    return this.siteResolver.getByHost(hostName);
  }

  /**
   * Rewrites the request path for subsequent handling.
   * @param {string} rewritePath - The destination path
   * @param {H3Event} event - The incoming H3 event
   * @param {boolean} [skipHeader] - When true, does not write the x-sc-rewrite header
   * @returns {void}
   */
  protected rewrite(rewritePath: string, event: H3Event, skipHeader?: boolean): void {
    event.node.req.url = rewritePath;

    // Share rewrite path with following proxies
    if (!skipHeader) {
      setResponseHeader(event, REWRITE_HEADER_NAME, rewritePath);
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
