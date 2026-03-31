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
 * Represents the geolocation data used for personalization
 * @public
 */
export type PersonalizeGeoData = {
  city?: string;
  country?: string;
  region?: string;
};

/**
 * The interface for the PersonalizeMiddleware configuration.
 * @public
 */
export type PersonalizeMiddlewareConfig = MiddlewareBaseConfig &
  SitecoreConfig['api']['edge'] &
  SitecoreConfig['personalize'] & {
    personalizeService?: PersonalizeService;
    getExtraUtmParams?: (event: H3Event) => Partial<ExperienceParams['utm']>;
    extractGeoDataCb?: (event?: H3Event) => Promise<PersonalizeGeoData> | PersonalizeGeoData;
  };

/**
 * Object model of Experience Context data
 */
export type ExperienceParams = {
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
 * Object model of personalize execution data
 */
type PersonalizeExecution = {
  friendlyId: string;
  variantIds: string[];
};

/**
 * Middleware to support Sitecore Personalize
 * @public
 */
export class PersonalizeMiddleware extends MiddlewareBase {
  protected personalizeService: PersonalizeService | null;

  /**
   * @param {PersonalizeMiddlewareConfig} config Personalize middleware config
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
   * @param {H3Event} event
   */
  handle = async (event: H3Event): Promise<void> => {
    if (!this.config.enabled) {
      debug.personalize('skipped (personalize middleware is disabled globally)');
      return;
    }

    try {
      const pathname = getRequestURL(event).pathname;
      const language = this.getLanguage(event);
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
        pathname,
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

      setResponseHeader(event, 'x-proxy-cache', 'no-cache');

      debug.personalize('personalize middleware end in %dms: %o', Date.now() - startTimestamp, {
        rewritePath,
      });
    } catch (error) {
      console.log('Personalize middleware failed:');
      console.log(error);
    }
  };

  protected disabled(event: H3Event): boolean {
    if (!this.personalizeService) {
      debug.personalize('skipped (personalize service not configured - edge config required)');
      return true;
    }

    const pathname = getRequestURL(event).pathname;
    return pathname.includes('.') || super.disabled(event);
  }

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

    return (await personalize(
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
    )) as {
      variantId: string;
    };
  }

  /**
   * Aggregates personalize executions based on the provided route personalize information and language.
   * @param {PersonalizeInfo} personalizeInfo the route personalize information
   * @param {string} language the language
   * @returns An array of personalize executions
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
