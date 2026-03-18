import { H3Event, setResponseHeader } from 'h3';
import { ProxyBase, ProxyBaseConfig } from './proxy';

/**
 * Configuration for the PreviewProxy.
 * @public
 */
export type PreviewProxyConfig = ProxyBaseConfig;

/**
 * Proxy handler for bypassing cache in editing and preview mode.
 * Reads the preview cookie set by EditingRenderRoute and sets cache control
 * headers to prevent cached responses from being served to the Page Builder editor.
 * @example
 * // server/middleware/05.preview.ts
 * import { PreviewProxy } from '@sitecore-content-sdk/nuxt/proxy';
 * import sites from '../../.sitecore/sites.json';
 *
 * const proxy = new PreviewProxy({ sites });
 *
 * export default defineEventHandler((event) => proxy.handle(event));
 * @public
 */
export class PreviewProxy extends ProxyBase {
  /**
   * @param {PreviewProxyConfig} config Preview proxy configuration
   */
  constructor(protected config: PreviewProxyConfig) {
    super(config);
  }

  /**
   * Handles an incoming request.
   * If the request is a preview request, bypasses the cache.
   * Errors are caught and logged, the request always continues.
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
   * @param {H3Event} event - The incoming H3 event
   */
  private bypassCache(event: H3Event): void {
    // TODO: Test of these headers are sufficient for Nitro server caching, or if additional headers are needed. See https://nitro.build/docs/cache.
    setResponseHeader(event, 'Cache-Control', 'no-store, must-revalidate');
  }
}
