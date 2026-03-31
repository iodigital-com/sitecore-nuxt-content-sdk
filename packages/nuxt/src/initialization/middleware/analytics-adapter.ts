import {
  COOKIE_NAME_PREFIX,
  fetchClientIdFromEdgeProxy,
  getDefaultCookieAttributes,
} from '@sitecore-content-sdk/analytics-core/internal';
import {
  getAnalyticsPlugin,
  AnalyticsAdapter,
} from '@sitecore-content-sdk/analytics-core/internal';
import { getCoreContext } from '@sitecore-content-sdk/core';
import { H3Event, getCookie, setCookie, deleteCookie, getRequestURL } from 'h3';

/**
 * Defines the AnalyticsMiddlewareAdapter.
 * @public
 */
export interface AnalyticsMiddlewareAdapter extends AnalyticsAdapter {
  /**
   * The type of the adapter.
   */
  type: 'middleware';
}

/**
 * Creates a middleware-based analytics adapter that reads and writes the visitor ID
 * using cookies and can resolve a new client ID from the Edge proxy when needed.
 * The adapter also provides access to the current URL search parameters.
 * @param {H3Event} event - The H3 event object.
 * @returns {AnalyticsMiddlewareAdapter} The analytics middleware adapter.
 * @public
 */
export function analyticsMiddlewareAdapter(event: H3Event): AnalyticsMiddlewareAdapter {
  return {
    type: 'middleware',
    getClientId: () => {
      return getClientId(event);
    },
    setClientId: async () => {
      const coreConfig = getCoreContext().config;
      const analyticsOptions = getAnalyticsPlugin().options;
      const cookieOptions = analyticsOptions.cookies;
      const clientIdCookieName = cookieOptions.name;
      const legacyClientIdCookieName = `${COOKIE_NAME_PREFIX}${coreConfig.contextId}`;
      const cookieAttributes = getDefaultCookieAttributes(
        cookieOptions.expiryDays,
        cookieOptions.domain
      );

      const legacyClientIdCookie = getCookie(event, legacyClientIdCookieName);
      if (legacyClientIdCookie) {
        setCookie(event, clientIdCookieName, legacyClientIdCookie, {
          ...cookieAttributes,
          sameSite: 'none',
        });

        deleteCookie(event, legacyClientIdCookieName);

        return;
      }

      const clientIdCookie = getClientId(event);

      let newClientIdCookieValue;
      if (!clientIdCookie) {
        const cookieValues = await fetchClientIdFromEdgeProxy(
          coreConfig.edgeUrl,
          coreConfig.contextId,
          analyticsOptions.timeout
        );

        newClientIdCookieValue = cookieValues.clientId;
        analyticsOptions.visitorIds = cookieValues;
      } else {
        newClientIdCookieValue = clientIdCookie;
      }

      const attributes = getDefaultCookieAttributes(cookieOptions.expiryDays, cookieOptions.domain);

      setCookie(event, clientIdCookieName, newClientIdCookieValue, {
        ...attributes,
        sameSite: 'none',
      });
    },
    location: {
      getSearchParams: () => {
        return getRequestURL(event).searchParams.toString();
      },
    },
  };
}

/**
 * Retrieves the client ID from the request cookies.
 * @param {H3Event} event
 * @returns {string | null} The client ID or null if not found.
 * @internal
 */
export const getClientId = (event: H3Event): string | null => {
  const clientIdCookieName = getAnalyticsPlugin().options.cookies.name;

  return getCookie(event, clientIdCookieName) || null;
};
