import {
  COOKIE_NAME_PREFIX,
  getAnalyticsPlugin,
  getDefaultCookieAttributes,
} from '@sitecore-content-sdk/analytics-core/internal';
import { getCoreContext } from '@sitecore-content-sdk/core';
import {
  PersonalizeAdapter,
  fetchProfileIdFromEdgeProxy,
  getPersonalizePlugin,
} from '@sitecore-content-sdk/personalize/internal';
import { H3Event, deleteCookie, getCookie, getRequestHeader, setCookie } from 'h3';
import { getClientId } from './analytics-adapter';

/**
 * Defines the PersonalizeMiddlewareAdapter.
 * @public
 */
export interface PersonalizeMiddlewareAdapter extends Required<PersonalizeAdapter> {
  /**
   * The type of the adapter.
   */
  type: 'middleware';
}

/**
 * Creates a middleware-based personalize adapter that reads and writes the profile ID
 * using cookies and can resolve a new profile ID from the Edge proxy when needed.
 * The adapter also provides the user agent from the request headers.
 * @example
 * // server/middleware/personalize.ts
 * export default defineEventHandler(async (event) => {
 *   const adapter = personalizeMiddlewareAdapter(event);
 *   await personalize({ adapter, ... });
 * });
 * @param {H3Event} event - The H3 event object.
 * @returns {PersonalizeMiddlewareAdapter} The personalize middleware adapter.
 * @public
 */
export function personalizeMiddlewareAdapter(event: H3Event): PersonalizeMiddlewareAdapter {
  // H3 has no request-side cookie mutation API. This map caches writes so that
  // getProfileId() picks them up within the same request lifecycle.
  const requestCookies: Record<string, string> = {};

  return {
    type: 'middleware',
    getUserAgent: () => getRequestHeader(event, 'user-agent') || undefined,
    getProfileId: () => {
      return getProfileId(event, requestCookies);
    },
    setProfileId: async () => {
      const coreConfig = getCoreContext().config;
      const cookieOptions = getAnalyticsPlugin().options.cookies;
      const personalizePlugin = getPersonalizePlugin();
      const profileIdCookieName = personalizePlugin.options.cookies.name;
      const cookieAttributes = getDefaultCookieAttributes(
        cookieOptions.expiryDays,
        cookieOptions.domain
      );
      const legacyProfileIdCookieName = `${COOKIE_NAME_PREFIX}${coreConfig.contextId}_personalize`;

      const legacyProfileIdCookie = getCookie(event, legacyProfileIdCookieName);
      if (legacyProfileIdCookie) {
        requestCookies[profileIdCookieName] = legacyProfileIdCookie;
        setCookie(event, profileIdCookieName, legacyProfileIdCookie, {
          ...cookieAttributes,
          sameSite: 'none',
        });

        deleteCookie(event, legacyProfileIdCookieName);

        return;
      }

      const cookiesValuesFromEdgeServer = getAnalyticsPlugin().options.visitorIds;

      const profileIdCookie = getProfileId(event, requestCookies);
      const clientIdCookie = getClientId(event);

      let newProfileIdCookieValue: string | undefined;
      if (profileIdCookie) newProfileIdCookieValue = profileIdCookie;
      else if (cookiesValuesFromEdgeServer?.profileId)
        newProfileIdCookieValue = cookiesValuesFromEdgeServer.profileId;
      else if (clientIdCookie) {
        const profileIdCookieValueFromEdgeProxy = await fetchProfileIdFromEdgeProxy(
          clientIdCookie,
          coreConfig.contextId,
          coreConfig.edgeUrl
        );
        newProfileIdCookieValue = profileIdCookieValueFromEdgeProxy;
      } else return;

      if (!newProfileIdCookieValue) return;

      if (!profileIdCookie) requestCookies[profileIdCookieName] = newProfileIdCookieValue;

      const attributes = getDefaultCookieAttributes(cookieOptions.expiryDays, cookieOptions.domain);

      setCookie(event, profileIdCookieName, newProfileIdCookieValue, {
        ...attributes,
        sameSite: 'none',
      });
    },
  };
}

/**
 * Retrieves the profile ID from request cookies or the in-request mutation cache.
 * @param {H3Event} event
 * @param {Record<string, string>} requestCookies - Cache for in-request cookie mutations.
 * @returns {string | null} The profile ID, or null if not found.
 * @internal
 */
function getProfileId(event: H3Event, requestCookies: Record<string, string>): string | null {
  const profileIdCookieName = getPersonalizePlugin().options.cookies.name;
  return requestCookies[profileIdCookieName] || getCookie(event, profileIdCookieName) || null;
}
