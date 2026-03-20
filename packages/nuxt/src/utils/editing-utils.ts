import { H3Event, getRequestHeader } from 'h3';
import { NativeDataFetcher } from '@sitecore-content-sdk/core';
import {
  EDITING_ALLOWED_ORIGINS,
  EditingRenderQueryParams,
  PREVIEW_KEY,
  isDesignLibraryMode,
  DesignLibraryRenderPreviewData,
} from '@sitecore-content-sdk/content/editing';
import { DEFAULT_VARIANT } from '@sitecore-content-sdk/content/personalize';
import { SITE_KEY } from '@sitecore-content-sdk/content/site';
import { getAllowedOriginsFromEnv } from '@sitecore-content-sdk/core/tools';
import { EDITING_PASS_THROUGH_HEADERS } from './constants';
import { AllowedQueryParams, GetAllowedQueryParamsResult } from '../sharedTypes/editing-types';

/**
 * Parses query string and its parameters to required editing parameters.
 * @param {{ [key: string]: string | undefined }} query query string values
 * @returns {EditingRenderQueryParams} editing parameters
 */
export const mapEditingParams = (query: {
  [key: string]: string | undefined;
}): { [key: string]: string | undefined } => {
  const params = isDesignLibraryMode(query.mode)
    ? {
        itemId: query.sc_itemid,
        componentUid: query.sc_uid,
        renderingId: query.sc_renderingId,
        language: query.sc_lang,
        site: query.sc_site,
        mode: query.mode,
        dataSourceId: query.dataSourceId,
        version: query.sc_version,
        generation: query.generation,
      }
    : {
        site: query.sc_site,
        itemId: query.sc_itemid,
        language: query.sc_lang,
        variantIds: query.sc_variant || DEFAULT_VARIANT,
        version: query.sc_version,
        mode: query.mode,
        layoutKind: query.sc_layoutKind,
      };
  return params;
};

/**
 * Parses the query parameters based on the provided allowed parameters or a resolver function,
 * to extract additional parameters that should be allowed.
 * @param {{ [key: string]: string | undefined }} queryParams Object of query parameters from incoming URL.
 * @param {AllowedQueryParams} allowedParams Allowed parameters to map.
 * @returns Object containing the list of missing required parameters and the allowed query parameters that were extracted.
 * @internal
 */
export const getAllowedQueryParams = (
  queryParams: { [key: string]: unknown },
  allowedParams?: AllowedQueryParams
): GetAllowedQueryParamsResult => {
  const allowedQueryParamsList =
    typeof allowedParams === 'function'
      ? allowedParams(Object.keys(queryParams))
      : Array.isArray(allowedParams)
      ? allowedParams
      : [];

  if (!allowedQueryParamsList.length) return { missingAllowedParams: [], allowedQueryParams: {} };

  return allowedQueryParamsList.reduce(
    (acc, param) => {
      const name = typeof param === 'string' ? param : param.name;
      const required = typeof param === 'string' ? false : param.required;

      const value = queryParams[name];
      if (value !== undefined) {
        acc.allowedQueryParams[name] = value;
        return acc;
      }

      if (required) acc.missingAllowedParams.push(name);

      return acc;
    },
    { missingAllowedParams: [], allowedQueryParams: {} } as GetAllowedQueryParamsResult
  );
};

/**
 * Returns the list of required query parameters based on the page editing mode.
 * @param {EditingRenderQueryParams['mode']} mode current page mode
 * @returns {string[]} list of required parameters for validation
 */
export const getRequiredEditingParamsList = (mode: EditingRenderQueryParams['mode']) => {
  const editingRequiredParams = ['sc_site', 'sc_itemid', 'sc_lang', 'route', 'mode'];
  const componentRequiredParams = [
    'sc_site',
    'sc_itemid',
    'sc_renderingId',
    'sc_uid',
    'sc_lang',
    'mode',
  ];
  return isDesignLibraryMode(mode) ? componentRequiredParams : editingRequiredParams;
};

/**
 * Gets the preview cookies to enable preview mode.
 * Sets the site cookie and preview cookie on the internal request so the PreviewProxy
 * can read them and bypass the cache.
 * @param {string} site current site name
 * @returns {string[]} list of cookies to set
 */
export const getPreviewCookies = (site: string) => {
  const previewSite = `${SITE_KEY}=${site}; Path=/; HttpOnly; SameSite=None; Secure`;
  const previewCookie = `${PREVIEW_KEY}=true; Path=/; HttpOnly; SameSite=None; Secure`;
  return [previewSite, previewCookie];
};

/**
 * Get headers that should be passed along to subsequent requests.
 * @param {Headers} headers Incoming HTTP Headers
 * @returns Object of approved headers
 * @internal
 */
export const getHeadersForPropagation = (headers: Headers): { [key: string]: string } => {
  return EDITING_PASS_THROUGH_HEADERS.reduce((acc, header) => {
    const value = headers.get(header);
    if (value) {
      acc[header] = value;
    }
    return acc;
  }, {} as Record<string, string>);
};

/**
 * Performs an internal request to get the HTML for the editing mode.
 * @param {URL} requestUrl URL to send request to
 * @param {object} propagatedQsParams query string params to use with request
 * @param {object} propagatedHeaders headers to use with request
 * @param {string[]} cookies cookies to use with request
 * @param {NativeDataFetcher} dataFetcher NativeDataFetcher instance to send request with
 * @returns {Promise<string>} HTML with editing markup
 */
export const getEditingRequestHtml = async (
  requestUrl: URL,
  propagatedQsParams: { [key: string]: string | undefined },
  propagatedHeaders: { [key: string]: string },
  cookies: string[],
  dataFetcher: NativeDataFetcher
): Promise<string> => {
  propagatedHeaders.cookie = `${
    propagatedHeaders.cookie ? propagatedHeaders.cookie + ';' : ''
  }${cookies.join(';')}`;

  propagatedHeaders.__content_sdk_preview = '1';

  for (const key in propagatedQsParams) {
    if ({}.hasOwnProperty.call(propagatedQsParams, key)) {
      propagatedQsParams[key] && requestUrl.searchParams.append(key, propagatedQsParams[key]);
    }
  }
  requestUrl.searchParams.append('timestamp', Date.now().toString());

  const pageRes = await dataFetcher
    .get<string>(requestUrl.toString(), {
      credentials: 'include',
      headers: propagatedHeaders,
    })
    .catch((err) => {
      if (err.response.status === 404) {
        return err.response;
      }
      throw err;
    });

  const html = pageRes.data;
  if (!html || html.length === 0) {
    throw new Error(`Failed to render html for ${requestUrl.toString()}`);
  }

  return html;
};

/**
 * Type guard for Design Library mode.
 * @param {object} data preview data to check
 * @returns true if the data is DesignLibraryRenderPreviewData
 * @public
 */
export const isDesignLibraryPreviewData = (
  data: unknown
): data is DesignLibraryRenderPreviewData => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'mode' in data &&
    isDesignLibraryMode((data as DesignLibraryRenderPreviewData).mode)
  );
};

/**
 * Server URL resolution order (highest to lowest priority):
 * 1. `SITECORE_INTERNAL_EDITING_HOST_URL` environment variable
 * 2. `http://localhost:3000` for XM Cloud deployments
 * 3. Request host header, using https for Vercel/Netlify deployments
 * @param {H3Event} event - The incoming H3 event
 * @returns {string} resolved server URL
 */
export const resolveServerUrl = (event: H3Event): string => {
  const internalHostUrl = process.env.SITECORE_INTERNAL_EDITING_HOST_URL;
  if (internalHostUrl) {
    return internalHostUrl;
  }

  if (process.env.SITECORE) {
    return 'http://localhost:3000';
  }

  const useHttps = (process.env.VERCEL || process.env.NETLIFY) !== undefined;
  const host = getRequestHeader(event, 'x-forwarded-host') || getRequestHeader(event, 'host');

  return `${useHttps ? 'https' : 'http'}://${host}`;
};

/**
 * Gets the Content-Security-Policy header value.
 * @returns {string} Content-Security-Policy header value
 */
export const getCSPHeader = (): string => {
  return `frame-ancestors 'self' ${[...getAllowedOriginsFromEnv(), ...EDITING_ALLOWED_ORIGINS].join(
    ' '
  )}`;
};
