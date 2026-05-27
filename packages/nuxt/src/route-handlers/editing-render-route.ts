import { H3Event, getRequestHeader, setResponseHeader, setResponseStatus, send } from 'h3';
import { NativeDataFetcher } from '@sitecore-content-sdk/core';
import {
  EDITING_ALLOWED_ORIGINS,
  EditingRenderQueryParams,
  QUERY_PARAM_EDITING_SECRET,
  INVALID_SECRET_HTML_MESSAGE,
} from '@sitecore-content-sdk/content/editing';
import { getEnforcedCorsHeaders } from '@sitecore-content-sdk/core/tools';
import { LayoutServicePageState } from '@sitecore-content-sdk/content/layout';
import { getEditingSecret } from '../utils/utils';
import {
  mapEditingParams,
  getEditingRequestHtml,
  getHeadersForPropagation,
  getRequiredEditingParamsList,
  getCSPHeader,
  resolveServerUrl,
  getPreviewCookies,
  getAllowedQueryParams,
} from '../utils/editing-utils';
import debug from '../debug';
import type { AllowedQueryParams } from '../sharedTypes/editing-types';

export type EditingRenderRouteConfig = {
  /**
   * Function used to determine route/page URL to render.
   * This may be necessary for certain custom Nuxt routing configurations.
   * @param {string} itemPath The Sitecore relative item path e.g. '/styleguide'
   * @returns {string} The URL to render
   * @default `${itemPath}`
   */
  resolvePageUrl?: (itemPath: string) => string;
  /**
   * Query string parameters to allow and include in the search params.
   * - Array: each item is a parameter name (string) or an object `{ name, required? }`.
   * - Function: receives the request's query parameter names and returns the list of allowed parameters.
   */
  allowedQueryParams?: AllowedQueryParams;

  /**
   * Optional URL for the internal host of the Sitecore editing environment, used for CORS validation.
   * If not provided, the route handler will attempt to resolve the internal host URL from the incoming request.
   * This is necessary in environments where the internal editing host URL cannot be reliably determined from the request (e.g. certain containerized setups).
   * In such cases, providing this URL explicitly can ensure CORS validation works correctly for requests coming from the Sitecore editing environment.
   * The URL should include the protocol and port (e.g. 'http://editing-host:9000').
   */
  sitecoreInternalEditingHostUrl?: string;
};

/**
 * Creates a route handler for the editing render API route (e.g. '/api/editing/render').
 * Handles GET requests for page rendering and POST requests for server action proxying.
 * @param {EditingRenderRouteConfig} config - The configuration for the route handler.
 * @returns The route handler object with handleGet and handlePost methods.
 * @example
 * // server/api/editing/render.get.ts
 * import { createEditingRenderRoute } from '@sitecore-content-sdk/nuxt/routes';
 * import componentMap from '~/components/component-map';
 *
 * const { handleGet } = createEditingRenderRoute();
 *
 * export default defineEventHandler(handleGet);
 * @example
 * // server/api/editing/render.post.ts
 * import { createEditingRenderRoute } from '@sitecore-content-sdk/nuxt/routes';
 *
 * const { handlePost } = createEditingRenderRoute();
 *
 * export default defineEventHandler(handlePost);
 * @example
 * // server/api/editing/render.options.ts
 * import { createEditingRenderRoute } from '@sitecore-content-sdk/nuxt/routes';
 *
 * const { handleOptions } = createEditingRenderRoute();
 *
 * export default defineEventHandler(handleOptions);
 * @public
 */
export const createEditingRenderRoute = (config: EditingRenderRouteConfig = {}) => {
  const dataFetcher = new NativeDataFetcher({ debugger: debug.editing });

  /**
   * Retrieves enforced CORS headers based on the incoming request origin.
   * Returns null if the origin is not allowed.
   * @param {H3Event} event - The incoming H3 event
   * @returns {Record<string, string> | null} CORS headers or null if origin is not allowed
   */
  const getCorsHeaders = (event: H3Event): Record<string, string> | null => {
    const expectedCorsHeaders = getEnforcedCorsHeaders({
      requestMethod: event.method,
      headers: new Headers({
        origin: getRequestHeader(event, 'origin') || '',
        'access-control-allow-origin': getRequestHeader(event, 'access-control-allow-origin') || '',
      }),
      presetCorsHeader: undefined,
      allowedOrigins: EDITING_ALLOWED_ORIGINS,
    });

    if (!expectedCorsHeaders) {
      debug.editing(
        'invalid origin host - set allowed origins in JSS_ALLOWED_ORIGINS environment variable'
      );
    }

    return expectedCorsHeaders;
  };

  /**
   * Validates the editing secret from the request query string.
   * @param {string} receivedSecret - The secret received in the request
   * @returns {boolean} true if the secret is valid
   */
  const validateEditingSecret = (receivedSecret: string): boolean => {
    const editingSecret = getEditingSecret();
    const secretIsValid = editingSecret === receivedSecret;

    if (!secretIsValid) {
      debug.editing(
        'invalid editing secret - sent "%s" expected "%s"',
        receivedSecret,
        editingSecret
      );
    }

    return secretIsValid;
  };

  /**
   * Handles an incoming GET request for page rendering in editing mode.
   * Validates the editing secret and CORS headers, fetches the page HTML from Nuxt,
   * and returns it to the Sitecore Page Builder.
   *
   * Returns 401 if the origin is not allowed or the editing secret is invalid.
   * Returns 400 if required query parameters are missing.
   * Returns 307 redirect if the page HTML fetch fails.
   * @param {H3Event} event - The incoming H3 event
   * @returns {Promise<void>}
   */
  const handleGet = async (event: H3Event): Promise<void> => {
    const query: EditingRenderQueryParams = {} as EditingRenderQueryParams;
    const searchParams = new URL(event.path, 'http://localhost').searchParams;
    searchParams.forEach((value, key) => {
      query[key] = value;
    });

    debug.editing('editing render handler start: %o', {
      method: event.method,
      query,
    });

    const corsHeaders = getCorsHeaders(event);
    if (!corsHeaders) {
      setResponseStatus(event, 401);
      await send(
        event,
        `<html><body>Requests from origin ${
          getRequestHeader(event, 'origin') || ''
        } not allowed</body></html>`
      );
      return;
    }

    Object.entries(corsHeaders).forEach(([key, value]) => setResponseHeader(event, key, value));

    if (!validateEditingSecret(query[QUERY_PARAM_EDITING_SECRET])) {
      setResponseStatus(event, 401);
      setResponseHeader(event, 'Content-Type', 'application/json');
      await send(event, JSON.stringify({ html: INVALID_SECRET_HTML_MESSAGE }));
      return;
    }

    const startTimestamp = Date.now();
    const mode = query.mode;
    const requiredQueryParams = getRequiredEditingParamsList(mode);
    const missingQueryParams = requiredQueryParams.filter((param) => !query[param]);
    const { allowedQueryParams, missingAllowedParams } = getAllowedQueryParams(
      query,
      config.allowedQueryParams
    );

    if (missingQueryParams.length || missingAllowedParams.length) {
      const missing = [...missingQueryParams, ...missingAllowedParams];
      debug.editing('missing required query parameters: %o', missing);

      setResponseStatus(event, 400);
      setResponseHeader(event, 'Content-Type', 'application/json');
      await send(
        event,
        JSON.stringify({
          html: `<html><body>Missing required query parameters: ${missing.join(
            ', '
          )}</body></html>`,
        })
      );
      return;
    }

    const encodedRoute = encodeURI(query.route);
    const route = config?.resolvePageUrl?.(encodedRoute) || encodedRoute;

    const base = config.sitecoreInternalEditingHostUrl || resolveServerUrl(event);
    const requestUrl = new URL(route, base);

    setResponseHeader(event, 'Content-Security-Policy', getCSPHeader());

    const previewCookies =
      mode === LayoutServicePageState.Preview ? getPreviewCookies(query.sc_site) : [];

    try {
      debug.editing('fetching page route for %s', query.route);

      const propagatedQsParams = {
        ...mapEditingParams(query as { [key: string]: string }),
        ...(allowedQueryParams as { [key: string]: string }),
      };

      const propagatedHeaders = getHeadersForPropagation(
        new Headers(event.node.req.headers as Record<string, string>)
      );

      const html = await getEditingRequestHtml(
        requestUrl,
        propagatedQsParams,
        propagatedHeaders,
        previewCookies,
        dataFetcher
      );

      debug.editing('editing render handler end in %dms: %o', Date.now() - startTimestamp, {
        status: 200,
        route,
      });

      setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8');
      await send(event, html);
    } catch (err) {
      debug.editing('error fetching page route %s: %o', requestUrl, err);
      debug.editing('falling back to redirect method...');
      debug.editing(
        'editing render handler end in %dms: redirect %o',
        Date.now() - startTimestamp,
        {
          status: 307,
          route,
        }
      );

      setResponseStatus(event, 307);
      setResponseHeader(event, 'Location', route);
      await send(event, '');
    }
  };

  /**
   * Handles an incoming OPTIONS preflight request.
   * Validates the origin and returns the appropriate CORS headers.
   *
   * Returns 401 if the origin is not allowed.
   * Returns 204 if the origin is valid.
   * @param {H3Event} event - The incoming H3 event
   * @returns {Promise<void>}
   */
  const handleOptions = async (event: H3Event): Promise<void> => {
    debug.editing('preflight request');

    try {
      const corsHeaders = getCorsHeaders(event);

      if (!corsHeaders) {
        setResponseStatus(event, 401);
        await send(
          event,
          `<html><body>Requests from origin ${
            getRequestHeader(event, 'origin') || ''
          } not allowed</body></html>`
        );
        return;
      }

      Object.entries(corsHeaders).forEach(([key, value]) => setResponseHeader(event, key, value));
      setResponseStatus(event, 204);
      await send(event, '');
    } catch (error) {
      console.error(
        'Editing render OPTIONS route handler failed:',
        error instanceof Error ? error.message : String(error)
      );
      setResponseStatus(event, 500);
      await send(event, 'Internal Server Error');
    }
  };

  return { handleGet, handleOptions };
};
