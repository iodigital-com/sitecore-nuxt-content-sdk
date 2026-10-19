import { H3Event, getRequestHeader, getRequestURL, setResponseHeader } from 'h3';
import {
  PersonalizeService,
  getPersonalizedRewrite,
  PersonalizeInfo,
  CdpHelper,
  DEFAULT_VARIANT,
} from '@sitecore-content-sdk/content/personalize';
import { MiddlewareBase, MiddlewareBaseConfig, REWRITE_HEADER_NAME } from './middleware';
import { initContentSdk } from '@sitecore-content-sdk/core';
import { personalize } from '@sitecore-content-sdk/personalize';
import { SitecoreConfig } from '../config';
import debug from '../debug';
import { analyticsPlugin } from '@sitecore-content-sdk/analytics-core';
import { analyticsMiddlewareAdapter } from '../initialization/middleware/analytics-adapter';
import { personalizeServerPlugin } from '@sitecore-content-sdk/personalize';
import { personalizeMiddlewareAdapter } from '../initialization/middleware/personalize-adapter';

/**
 * Represents the geolocation data used for personalization.
 * @public
 */
export type PersonalizeGeoData = {
  city?: string;
  country?: string;
  region?: string;
};

/**
 * Configuration for the PersonalizeMiddleware.
 *
 * Extends the base middleware config with Edge API settings and personalize options.
 * When `contextId` and `clientContextId` are omitted, the middleware initializes without
 * a personalize service and skips execution. This is expected in local container development.
 * @public
 * @example
 * const middleware = new PersonalizeMiddleware({
 *   enabled: true,
 *   contextId: 'my-context-id',
 *   clientContextId: 'my-client-context-id',
 *   edgeUrl: 'https://my-edge-url',
 *   edgeTimeout: 400,
 *   cdpTimeout: 400,
 *   sites: [{ name: 'my-site', hostName: 'my-site.com', language: 'en' }],
 * });
 */
export type PersonalizeMiddlewareConfig = MiddlewareBaseConfig &
  SitecoreConfig['api']['edge'] &
  SitecoreConfig['personalize'] & {
    /**
     * Optional override for the personalize service. When provided, the default
     * PersonalizeService is not instantiated.
     */
    personalizeService?: PersonalizeService;
    /**
     * Optional callback to provide additional UTM parameters for the experience context.
     * @param {H3Event} event - The incoming H3 event
     * @returns {Partial<ExperienceParams['utm']>} Additional UTM parameters to merge
     */
    getExtraUtmParams?: (event: H3Event) => Partial<ExperienceParams['utm']>;
    /**
     * Optional callback to extract geolocation data from the request.
     * Can be synchronous or asynchronous.
     * @param {H3Event} [event] - The incoming H3 event
     * @returns {Promise<PersonalizeGeoData> | PersonalizeGeoData} Geolocation data
     */
    extractGeoDataCb?: (event?: H3Event) => Promise<PersonalizeGeoData> | PersonalizeGeoData;
    /**
     * List of locale prefixes to strip from the pathname before personalization lookup.
     * @example ['en', 'nl-NL']
     */
    locales?: string[];
  };

/**
 * Experience context data passed to the CDP personalize call.
 * @public
 */
export type ExperienceParams = {
  /** The referrer URL of the request. */
  referrer: string;
  utm: {
    [key: string]: string | undefined;
    campaign: string | undefined;
    source: string | undefined;
    medium: string | undefined;
    content: string | undefined;
  };
};

/**
 * A single personalize execution unit, representing one CDP experience call.
 */
type PersonalizeExecution = {
  /** The CDP-friendly ID for the experience. */
  friendlyId: string;
  /** The list of variant IDs to evaluate. */
  variantIds: string[];
};

/**
 * Middleware that integrates Sitecore Personalize into the Nuxt server middleware chain.
 *
 * On each request, it resolves the current site, fetches personalize info from the Edge API,
 * calls the CDP to identify applicable variants, and rewrites the request path to the
 * personalized route.
 *
 * When Edge configuration (`contextId`/`clientContextId`) is missing, the middleware
 * initializes in a degraded state and skips all personalization. This is expected when
 * running locally without a connected Sitecore environment.
 * @public
 * @example
 * // server/middleware/personalize.ts
 * import { PersonalizeMiddleware } from '@iodigital-com/sitecore-content-sdk-nuxt/middleware';
 *
 * const middleware = new PersonalizeMiddleware({
 *   enabled: true,
 *   contextId: process.env.SITECORE_CONTEXT_ID,
 *   clientContextId: process.env.SITECORE_CLIENT_CONTEXT_ID,
 *   edgeUrl: process.env.SITECORE_EDGE_URL,
 *   edgeTimeout: 400,
 *   cdpTimeout: 400,
 *   sites: config.sites,
 * });
 *
 * export default defineEventHandler((event) => middleware.handle(event));
 */
export class PersonalizeMiddleware extends MiddlewareBase {
  protected personalizeService: PersonalizeService | null;

  /**
   * @param {PersonalizeMiddlewareConfig} config - Personalize middleware configuration.
   * When `contextId` and `clientContextId` are not provided, `personalizeService` is set
   * to `null` and personalization is disabled.
   */
  constructor(protected config: PersonalizeMiddlewareConfig) {
    super(config);

    if (!this.config.contextId && !this.config.clientContextId) {
      console.warn(
        '[PersonalizeMiddleware] Personalize middleware requires Edge configuration (contextId/clientContextId). ' +
          'Personalize features will be disabled. This is expected in local container development.'
      );
      this.personalizeService = null;
      return;
    }

    const graphQLOptions = {
      api: {
        edge: {
          contextId: this.config.contextId,
          clientContextId: this.config.clientContextId,
          edgeUrl: this.config.edgeUrl,
        },
      },
    };

    this.personalizeService =
      this.config.personalizeService ??
      new PersonalizeService({
        clientFactory: this.getClientFactory(graphQLOptions),
        timeout: this.config.edgeTimeout,
        scope: this.config.scope,
        fetch: fetch,
      });
  }

  /**
   * Handles an incoming request and applies personalization if applicable.
   *
   * Skips execution when:
   * - The middleware is globally disabled via config
   * - The request targets a static file, API route, or Nuxt internal route
   * - The request is a preview or prefetch
   * - No personalize service is configured
   * - No personalize info is found for the current route
   * - No variants are identified by the CDP
   *
   * On success, rewrites `event.node.req.url` to the personalized path and sets
   * the `x-sc-rewrite` response header for downstream middleware.
   *
   * Errors are caught and logged without re-throwing, so the request continues normally.
   * @param {H3Event} event - The incoming H3 event
   * @returns {Promise<void>}
   */
  handle = async (event: H3Event): Promise<void> => {
    if (!this.config.enabled) {
      debug.personalize('skipped (personalize middleware is disabled globally)');
      return;
    }

    try {
      const pathname = getRequestURL(event).pathname;
      const language = this.getLanguage(event);

      // Strip locale prefix from pathname
      const locales: string[] = this.config.locales || [];
      const strippedPathname = locales.some(
        (locale: string) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
      )
        ? '/' + pathname.split('/').slice(2).join('/') || '/'
        : pathname;
      const hostname = this.getHostHeader(event) || this.defaultHostname;
      const startTimestamp = Date.now();
      const cdpTimeout = this.config.cdpTimeout;
      const geo = this.config.extractGeoDataCb
        ? await this.config.extractGeoDataCb(event)
        : undefined;

      debug.personalize('personalize middleware start: %o', {
        pathname,
        language,
        hostname,
        ...(geo && { geo }),
      });

      if (this.disabled(event)) {
        debug.personalize('skipped (personalize middleware is disabled)');
        return;
      }

      if (this.isPreview(event)) {
        debug.personalize('skipped (preview)');
        return;
      }

      const site = this.getSite(event);

      if (!this.personalizeService) {
        return;
      }

      const personalizeInfo = await this.personalizeService.getPersonalizeInfo(
        strippedPathname,
        language,
        site.name
      );

      if (!personalizeInfo) {
        debug.personalize('skipped (personalize info not found)');
        return;
      }

      if (personalizeInfo.variantIds.length === 0) {
        debug.personalize('skipped (no personalization configured)');
        return;
      }

      if (this.isPrefetch(event)) {
        debug.personalize('skipped (prefetch)');
        setResponseHeader(event, 'x-proxy-cache', 'no-cache');
        setResponseHeader(event, 'Cache-Control', 'no-store, must-revalidate');
        return;
      }

      await this.initPersonalizeServer({
        hostname,
        siteName: site.name,
        event,
      });

      const params = this.getExperienceParams(event);
      const executions = this.getPersonalizeExecutions(personalizeInfo, language);
      const identifiedVariantIds: string[] = [];

      await Promise.all(
        executions.map((execution) =>
          this.personalize({
            friendlyId: execution.friendlyId,
            variantIds: execution.variantIds,
            params,
            language,
            timeout: cdpTimeout,
            ...(geo && { geo }),
          }).then((personalization) => {
            const variantId = personalization.variantId;
            if (variantId) {
              if (!execution.variantIds.includes(variantId)) {
                debug.personalize('invalid variant %s', variantId);
              } else {
                identifiedVariantIds.push(variantId);
              }
            }
          })
        )
      );

      if (identifiedVariantIds.length === 0) {
        debug.personalize('skipped (no variant(s) identified)');
        return;
      }

      const basePath = (event.node.res.getHeader(REWRITE_HEADER_NAME) as string) || pathname;
      const rewritePath = getPersonalizedRewrite(basePath, identifiedVariantIds);

      this.rewrite(rewritePath, event);

      event.node.req.headers['x-sc-rewrite'] = rewritePath;
      setResponseHeader(event, 'x-proxy-cache', 'no-cache');

      debug.personalize('personalize middleware end in %dms: %o', Date.now() - startTimestamp, {
        rewritePath,
      });
    } catch (error) {
      console.log('Personalize middleware failed:');
      console.log(error);
    }
  };

  /**
   * Determines whether the middleware should be skipped for the current request.
   *
   * Returns `true` when the personalize service is not configured, the path contains
   * a file extension (static assets), or the base disabled check matches.
   *
   * Also logs a debug message when skipping due to missing Edge configuration.
   * @param {H3Event} event - The incoming H3 event
   * @returns {boolean} `true` if the middleware should be skipped
   */
  protected disabled(event: H3Event): boolean {
    if (!this.personalizeService) {
      debug.personalize('skipped (personalize service not configured - edge config required)');
      console.log(
        '[Personalize] skipped (personalize service not configured - edge config required)'
      );
      return true;
    }

    const pathname = getRequestURL(event).pathname;
    return pathname.includes('.') || super.disabled(event);
  }

  /**
   * Builds the experience context params from the current request.
   *
   * Reads UTM parameters from the query string and merges any additional
   * params returned by `config.getExtraUtmParams`.
   * @param {H3Event} event - The incoming H3 event
   * @returns {ExperienceParams} The experience params to pass to the CDP
   */
  protected getExperienceParams(event: H3Event): ExperienceParams {
    const url = getRequestURL(event);
    const extraParams = this.config.getExtraUtmParams ? this.config.getExtraUtmParams(event) : {};

    const utm = {
      campaign: url.searchParams.get('utm_campaign') || undefined,
      content: url.searchParams.get('utm_content') || undefined,
      medium: url.searchParams.get('utm_medium') || undefined,
      source: url.searchParams.get('utm_source') || undefined,
      ...extraParams,
    };

    return {
      referrer: getRequestHeader(event, 'referer') || '',
      utm,
    };
  }

  /**
   * Initializes the Sitecore Content SDK with analytics and personalize plugins
   * for the current request context.
   *
   * This must be called before invoking `personalize()` on each request, as it
   * binds the analytics and personalize adapters to the current H3 event.
   * @param {object} params
   * @param {string} params.hostname - The request hostname, used as the cookie domain
   * @param {string} params.siteName - The resolved Sitecore site name
   * @param {H3Event} params.event - The incoming H3 event
   * @returns {Promise<void>}
   */
  protected async initPersonalizeServer({
    hostname,
    siteName,
    event,
  }: {
    hostname: string;
    siteName: string;
    event: H3Event;
  }): Promise<void> {
    await initContentSdk({
      config: {
        contextId: this.config.contextId,
        edgeUrl: this.config.edgeUrl,
        siteName,
      },
      plugins: [
        analyticsPlugin({
          options: {
            enableCookie: true,
            cookieDomain: hostname,
          },
          adapter: analyticsMiddlewareAdapter(event),
        }),
        personalizeServerPlugin({
          options: {
            enablePersonalizeCookie: true,
          },
          adapter: personalizeMiddlewareAdapter(event),
        }),
      ],
    });
  }

  /**
   * Calls the CDP to identify the variant for a single experience.
   * @param {object} params
   * @param {ExperienceParams} params.params - The experience context params
   * @param {string} params.friendlyId - The CDP-friendly ID for the experience
   * @param {string} params.language - The current page language
   * @param {number} [params.timeout] - Optional timeout in milliseconds
   * @param {string[]} [params.variantIds] - The list of variant IDs to evaluate
   * @param {PersonalizeGeoData} [params.geo] - Optional geolocation data
   * @returns {Promise<{ variantId: string }>} The identified variant ID
   */
  protected async personalize({
    params,
    friendlyId,
    language,
    timeout,
    variantIds,
    geo,
  }: {
    params: ExperienceParams;
    friendlyId: string;
    language: string;
    timeout?: number;
    variantIds?: string[];
    geo?: PersonalizeGeoData;
  }) {
    debug.personalize('executing experience for %s %o', friendlyId, params);

    const result = (await personalize(
      {
        channel: this.config.channel || 'WEB',
        currency: this.config.currency ?? 'USD',
        friendlyId,
        params,
        language,
        pageVariantIds: variantIds,
        ...(geo && { geo }),
      },
      { timeout }
    )) as { variantId: string };

    return result;
  }

  /**
   * Builds the list of CDP experience calls based on the personalize info for the current route.
   *
   * Groups component-level variant IDs (format: `componentId_variantId`) into a single
   * execution per component, and treats top-level variant IDs as page-level experiences.
   * @param {PersonalizeInfo} personalizeInfo - The personalize info for the current route
   * @param {string} language - The current page language
   * @returns {PersonalizeExecution[]} The list of executions to run in parallel
   */
  protected getPersonalizeExecutions(
    personalizeInfo: PersonalizeInfo,
    language: string
  ): PersonalizeExecution[] {
    if (personalizeInfo.variantIds.length === 0) {
      return [];
    }

    const results: PersonalizeExecution[] = [];

    return personalizeInfo.variantIds.reduce((results, variantId) => {
      if (variantId.includes('_')) {
        const componentId = variantId.split('_')[0];
        const friendlyId = CdpHelper.getComponentFriendlyId(
          personalizeInfo.pageId,
          componentId,
          language,
          this.config.scope
        );
        const execution = results.find((x) => x.friendlyId === friendlyId);
        if (execution) {
          execution.variantIds.push(variantId);
        } else {
          const defaultVariant = `${componentId}${DEFAULT_VARIANT}`;
          results.push({ friendlyId, variantIds: [defaultVariant, variantId] });
        }
      } else {
        const friendlyId = CdpHelper.getPageFriendlyId(
          personalizeInfo.pageId,
          language,
          this.config.scope
        );
        const execution = results.find((x) => x.friendlyId === friendlyId);
        if (execution) {
          execution.variantIds.push(variantId);
        } else {
          results.push({ friendlyId, variantIds: [variantId] });
        }
      }
      return results;
    }, results);
  }
}
