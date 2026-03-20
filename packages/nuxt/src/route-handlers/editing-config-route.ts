import { H3Event, getRequestHeader, setResponseHeader, setResponseStatus, send } from 'h3';
import { ComponentMap } from '@sitecore-content-sdk/vue';
import { Metadata } from '@sitecore-content-sdk/core/node-tools';
import { NuxtContentSdkComponent } from '../sharedTypes/component-props';
import {
  EDITING_ALLOWED_ORIGINS,
  QUERY_PARAM_EDITING_SECRET,
} from '@sitecore-content-sdk/content/editing';
import { getEnforcedCorsHeaders as getCorsHeaders } from '@sitecore-content-sdk/core/tools';
import { EditMode } from '@sitecore-content-sdk/content/layout';
import { getEditingSecret } from '../utils/utils';
import debug from '../debug';

/**
 * Configuration for the createEditingConfigRoute factory function.
 * @public
 */
export type EditingConfigRouteConfig = {
  /**
   * Components available in the application.
   * Used to report available components to the Sitecore Page Builder.
   */
  components: ComponentMap<NuxtContentSdkComponent>;
  /**
   * Application metadata containing package information.
   */
  metadata: Metadata;
  /**
   * Contains only client and universal components that can be used in client bundles.
   * When provided, Page Builder can distinguish between server and client components.
   */
  clientComponents?: ComponentMap<NuxtContentSdkComponent>;
};

/**
 * Creates a route handler for the editing config API route (e.g. /api/editing/config).
 * Provides configuration information to determine feature compatibility on the Sitecore Page Builder side.
 * @param {EditingConfigRouteConfig} config - The configuration for the editing config route.
 * @returns The route handler object with handle method.
 * @example
 * // server/api/editing/config.get.ts
 * import { createEditingConfigRoute } from '@sitecore-content-sdk/nuxt/editing';
 * import componentMap from '~/components/component-map';
 * import metadata from '~/package.json';
 *
 * const { handle } = createEditingConfigRoute({ components: componentMap, metadata });
 *
 * export default defineEventHandler(handle);
 * @public
 */
export const createEditingConfigRoute = (config: EditingConfigRouteConfig) => {
  /**
   * Validates the editing secret from the request query string.
   * Logs a debug message if the secret is invalid.
   * @param {H3Event} event - The incoming H3 event
   * @returns {boolean} true if the secret is valid
   */
  const validateSecret = (event: H3Event): boolean => {
    const secret = new URL(event.path, 'http://localhost').searchParams.get(
      QUERY_PARAM_EDITING_SECRET
    );
    const editingSecret = getEditingSecret();
    const isValid = secret === editingSecret;

    if (!isValid) {
      debug.editing('invalid editing secret - sent "%s"', secret);
    }

    return isValid;
  };

  /**
   * Retrieves enforced CORS headers based on the incoming request origin.
   * Returns null if the origin is not allowed.
   * @param {H3Event} event - The incoming H3 event
   * @returns {Record<string, string> | null} CORS headers or null if origin is not allowed
   */
  const getEnforcedCorsHeaders = (event: H3Event): Record<string, string> | null => {
    return getCorsHeaders({
      requestMethod: event.method,
      headers: new Headers({
        origin: getRequestHeader(event, 'origin') || '',
        'access-control-allow-origin': getRequestHeader(event, 'access-control-allow-origin') || '',
      }),
      presetCorsHeader: undefined,
      allowedOrigins: EDITING_ALLOWED_ORIGINS,
    });
  };

  /**
   * Handles an incoming editing config request.
   * Validates the editing secret and CORS headers, then returns the list of
   * available components, packages and edit mode to the Sitecore Page Builder.
   *
   * Returns 401 if the origin is not allowed or the editing secret is invalid.
   * Returns 500 if an unexpected error occurs.
   * @param {H3Event} event - The incoming H3 event
   * @returns {Promise<void>}
   */
  const handle = async (event: H3Event): Promise<void> => {
    const startTimestamp = Date.now();
    debug.editing('editing config route handler start');

    try {
      const corsHeaders = getEnforcedCorsHeaders(event);

      if (!corsHeaders) {
        debug.editing(
          'invalid origin host - set allowed origins in JSS_ALLOWED_ORIGINS environment variable'
        );
        setResponseStatus(event, 401);
        setResponseHeader(event, 'Content-Type', 'application/json');
        await send(event, JSON.stringify({ message: 'Invalid origin' }));
        return;
      }

      if (!validateSecret(event)) {
        setResponseStatus(event, 401);
        Object.entries(corsHeaders).forEach(([key, value]) => setResponseHeader(event, key, value));
        setResponseHeader(event, 'Content-Type', 'application/json');
        await send(event, JSON.stringify({ message: 'Missing or invalid editing secret' }));
        return;
      }

      const componentNames = Array.from(config.components.keys());
      const clientComponentNames = config.clientComponents
        ? Array.from(config.clientComponents.keys())
        : [];

      const responseData = {
        framework: 'nuxt',
        components: componentNames,
        clientComponents: clientComponentNames,
        packages: config.metadata.packages,
        editMode: EditMode.Metadata,
      };

      Object.entries(corsHeaders).forEach(([key, value]) => setResponseHeader(event, key, value));
      setResponseHeader(event, 'Content-Type', 'application/json');
      await send(event, JSON.stringify(responseData));

      debug.editing('editing config route handler end in %dms', Date.now() - startTimestamp);
    } catch (error) {
      console.error(
        'Editing config route handler failed:',
        error instanceof Error ? error.message : String(error)
      );
      setResponseStatus(event, 500);
      await send(event, 'Internal Server Error');
    }
  };

  return { handle };
};
