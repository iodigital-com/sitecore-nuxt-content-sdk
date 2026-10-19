import { H3Event, getRequestHeader, getRequestURL, setCookie } from 'h3';
import { initContentSdk } from '@sitecore-content-sdk/core';
import { SitecoreConfig } from '@sitecore-content-sdk/content/config';
import { analyticsPlugin } from '@sitecore-content-sdk/analytics-core';
import { eventsPlugin, botPageView } from '@sitecore-content-sdk/events';
import { isBot, BOT_DETECTION_COOKIE } from '@sitecore-content-sdk/analytics-core/internal';
import { MiddlewareBase, MiddlewareBaseConfig } from './middleware';
import debug from '../debug';
import { analyticsMiddlewareAdapter } from '../initialization/middleware/analytics-adapter';

/**
 * Configuration for BotTrackingMiddleware.
 * @public
 */
export type BotTrackingMiddlewareConfig = SitecoreConfig['api']['edge'] & MiddlewareBaseConfig;

/**
 * Nuxt server middleware that detects bots and tracks their page views via Sitecore Analytics.
 *
 * Run first in the middleware chain to ensure the bot detection cookie is set
 * before other middlewares execute.
 * @public
 * @example
 * // server/middleware/bot-tracking.ts
 * import { BotTrackingMiddleware } from '@iodigital-com/sitecore-content-sdk-nuxt/middleware';
 *
 * const middleware = new BotTrackingMiddleware({
 *   contextId: process.env.SITECORE_EDGE_CONTEXT_ID,
 *   edgeUrl: process.env.SITECORE_EDGE_URL,
 *   sites: config.sites,
 * });
 *
 * export default defineEventHandler((event) => middleware.handle(event));
 */
export class BotTrackingMiddleware extends MiddlewareBase {
  /**
   * @param {BotTrackingMiddlewareConfig} config - Bot tracking middleware configuration.
   */
  constructor(protected config: BotTrackingMiddlewareConfig) {
    super(config);
  }

  /**
   * Handles an incoming request and applies bot tracking if applicable.
   *
   * Skips execution when:
   * - The middleware is disabled via config
   * - The request is a preview
   * - The environment is local or dev (unless `SITECORE_ENABLE_BOT_TRACKING=true`)
   * - The request has no `user-agent` header
   * - The user-agent does not match a known bot
   * - The request is a prefetch
   *
   * On success, sets the bot detection cookie and tracks the page view via `botPageView()`.
   * Errors are caught and logged without re-throwing, so the request continues normally.
   * @param {H3Event} event - The incoming H3 event
   * @returns {Promise<void>}
   */
  handle = async (event: H3Event): Promise<void> => {
    try {
      const pathname = getRequestURL(event).pathname;

      debug.common('bot tracking middleware start: %o', { pathname });

      if (this.disabled(event)) {
        debug.common('bot tracking middleware skipped (disabled)');
        return;
      }

      if (this.isPreview(event)) {
        debug.common('bot tracking middleware skipped (preview)');
        return;
      }

      if (this.shouldSkipForLocalEnvironment(event)) {
        debug.common('bot tracking middleware skipped (local environment)');
        return;
      }

      const userAgent = getRequestHeader(event, 'user-agent');
      if (!userAgent) {
        debug.common('bot tracking middleware skipped (no user-agent)');
        return;
      }

      if (!isBot(userAgent)) {
        debug.common('bot tracking middleware skipped (not a bot)');
        return;
      }

      if (this.isPrefetch(event)) {
        debug.common('bot tracking middleware skipped (prefetch)');
        return;
      }

      const site = this.getSite(event);
      const language = this.getLanguage(event);

      setCookie(event, BOT_DETECTION_COOKIE, '1', {
        secure: true,
        sameSite: 'lax',
        path: '/',
      });

      debug.common('bot tracking middleware (visitor is a bot)');

      await initContentSdk({
        config: {
          contextId: this.config.contextId,
          edgeUrl: this.config.edgeUrl,
          siteName: site.name,
        },
        plugins: [
          analyticsPlugin({
            options: {
              enableCookie: false,
            },
            adapter: analyticsMiddlewareAdapter(event),
          }),
          eventsPlugin(),
        ],
      });

      await botPageView({
        page: pathname,
        language,
        userAgent,
      });

      debug.common('bot tracking middleware end: %o', { pathname });
    } catch (error) {
      debug.common('bot tracking middleware error: %o', error);
    }
  };

  /**
   * Returns `true` when bot tracking should be skipped for a local or development environment.
   *
   * Can be overridden by setting `SITECORE_ENABLE_BOT_TRACKING=true`, which forces
   * bot tracking to run even in local environments.
   * @param {H3Event} event - The incoming H3 event
   * @returns {boolean} `true` if the environment is local or dev
   * @internal
   */
  protected shouldSkipForLocalEnvironment(event: H3Event): boolean {
    if (process.env.SITECORE_ENABLE_BOT_TRACKING === 'true') {
      return false;
    }

    if (process.env.NODE_ENV === 'development') {
      return true;
    }

    const hostname = (
      this.getHostHeader(event) ||
      getRequestURL(event).hostname ||
      this.defaultHostname ||
      ''
    ).toLowerCase();

    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '[::1]'
    );
  }
}
