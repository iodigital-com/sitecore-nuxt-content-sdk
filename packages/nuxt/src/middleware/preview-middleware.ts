import { H3Event, setResponseHeader } from 'h3';
import { MiddlewareBase, MiddlewareBaseConfig } from './middleware';

/**
 * Configuration for the PreviewMiddleware.
 * @public
 */
export type PreviewMiddlewareConfig = MiddlewareBaseConfig;

/**
 * Proxy handler for bypassing cache in editing and preview mode.
 * Reads the preview cookie set by EditingRenderRoute and sets cache control
 * headers to prevent cached responses from being served to the Page Builder editor.
 * NOTE: This middleware has no dependencies on other proxies
 * and can run at any position in the middleware chain.
 * @public
 * @example
 * // server/middleware/05.preview.ts
 * import { PreviewMiddleware } from '@sitecore-content-sdk/nuxt/proxy';
 * import sites from '../../.sitecore/sites.json';
 *
 * const middleware = new PreviewMiddleware({ sites });
 *
 * export default defineEventHandler((event) => middleware.handle(event));
 */
export class PreviewMiddleware extends MiddlewareBase {
  /**
   * @param {PreviewMiddlewareConfig} config Preview middleware configuration
   */
  constructor(protected config: PreviewMiddlewareConfig) {
    super(config);
  }

  /**
   * Handles an incoming request.
   * If the request is a preview request, bypasses the cache.
   * Errors are caught and logged, the request always continues.
   * @
   * @param {H3Event} event - The incoming H3 event
   * @returns {Promise<void>}
   */
  async handle(event: H3Event): Promise<void> {
    try {
      if (this.disabled(event)) {
        return;
      }

      if (this.isPreview(event)) {
        this.bypassCache(event);
      }
    } catch (error) {
      console.error('PreviewProxy failed:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Sets cache control headers to prevent the response from being cached.
   * This ensures the Page Builder editor always receives the most recent version of a page.
   * @todo Test of these headers are sufficient for Nitro server caching, or if additional headers are needed
   * @param {H3Event} event - The incoming H3 event
   * @see {@link https://nitro.build/docs/cache} for Nitro server cache configuration
   * @internal
   */
  private bypassCache(event: H3Event): void {
    setResponseHeader(event, 'Cache-Control', 'no-store, must-revalidate');
  }
}
