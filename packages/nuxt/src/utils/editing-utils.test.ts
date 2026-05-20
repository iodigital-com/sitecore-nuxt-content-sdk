import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockEvent } from 'h3';
import { DesignLibraryMode, PREVIEW_KEY } from '@sitecore-content-sdk/content/editing';
import { DEFAULT_VARIANT } from '@sitecore-content-sdk/content/personalize';
import { SITE_KEY } from '@sitecore-content-sdk/content/site';
import {
  mapEditingParams,
  getAllowedQueryParams,
  getPreviewCookies,
  getRequiredEditingParamsList,
  getHeadersForPropagation,
  getEditingRequestHtml,
  isDesignLibraryPreviewData,
  resolveServerUrl,
  getCSPHeader,
} from './editing-utils';
import { LayoutServicePageState } from '@sitecore-content-sdk/content/layout';

const createMockEvent = (headers: Record<string, string> = {}) => {
  return mockEvent('http://localhost/', { headers });
};

describe('editing-utils', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.SITECORE_INTERNAL_EDITING_HOST_URL;
    delete process.env.SITECORE;
    delete process.env.VERCEL;
    delete process.env.NETLIFY;
    delete process.env.JSS_ALLOWED_ORIGINS;
  });

  describe('mapEditingParams', () => {
    it('should return design library params when mode is design library', () => {
      const query = {
        mode: DesignLibraryMode.Normal,
        sc_itemid: 'item-123',
        sc_uid: 'component-uid',
        sc_renderingId: 'rendering-456',
        sc_lang: 'en',
        sc_site: 'test-site',
        dataSourceId: 'datasource-789',
        sc_version: '1',
        generation: 'variant',
      };

      const params = mapEditingParams(query);

      expect(params).toEqual({
        itemId: 'item-123',
        componentUid: 'component-uid',
        renderingId: 'rendering-456',
        language: 'en',
        site: 'test-site',
        mode: DesignLibraryMode.Normal,
        dataSourceId: 'datasource-789',
        version: '1',
        generation: 'variant',
      });
    });

    it('should return design library params when mode is library metadata', () => {
      const query = {
        mode: DesignLibraryMode.Metadata,
        sc_itemid: 'item-123',
        sc_uid: 'component-uid',
        sc_renderingId: 'rendering-456',
        sc_lang: 'en',
        sc_site: 'test-site',
        dataSourceId: 'datasource-789',
        sc_version: '1',
        generation: 'variant',
      };

      const params = mapEditingParams(query);

      expect(params).toEqual({
        itemId: 'item-123',
        componentUid: 'component-uid',
        renderingId: 'rendering-456',
        language: 'en',
        site: 'test-site',
        mode: DesignLibraryMode.Metadata,
        dataSourceId: 'datasource-789',
        version: '1',
        generation: 'variant',
      });
    });

    it('should return standard editing params when mode is not design library', () => {
      const query = {
        mode: 'edit',
        sc_site: 'test-site',
        sc_itemid: 'item-123',
        sc_lang: 'en',
        sc_variant: 'variant1,variant2',
        sc_version: '1',
        sc_layoutKind: 'mvc',
      };

      const params = mapEditingParams(query);

      expect(params).toEqual({
        site: 'test-site',
        itemId: 'item-123',
        language: 'en',
        variantIds: 'variant1,variant2',
        version: '1',
        mode: 'edit',
        layoutKind: 'mvc',
      });
    });

    it('should use default variant when no variant is specified', () => {
      const query = {
        mode: 'edit',
        sc_site: 'test-site',
        sc_itemid: 'item-123',
        sc_lang: 'en',
      };

      const params = mapEditingParams(query);

      expect(params.variantIds).toBe(DEFAULT_VARIANT);
    });

    it('should handle empty variant string', () => {
      const query = {
        mode: 'edit',
        sc_site: 'test-site',
        sc_itemid: 'item-123',
        sc_lang: 'en',
        sc_variant: '',
      };

      const params = mapEditingParams(query);

      expect(params.variantIds).toBe(DEFAULT_VARIANT);
    });

    it('should handle undefined values gracefully', () => {
      const query = {
        mode: 'edit',
        sc_site: undefined,
        sc_itemid: undefined,
        sc_lang: undefined,
      };

      const params = mapEditingParams(query);

      expect(params.site).toBe(undefined);
      expect(params.itemId).toBe(undefined);
      expect(params.language).toBe(undefined);
    });
  });

  describe('getAllowedQueryParams', () => {
    it('should return empty results when allowedParams is undefined', () => {
      const queryParams = { param1: 'value1', param2: 'value2' };

      const result = getAllowedQueryParams(queryParams);

      expect(result).toEqual({ missingAllowedParams: [], allowedQueryParams: {} });
    });

    it('should return empty results when allowedParams is an empty array', () => {
      const queryParams = { param1: 'value1', param2: 'value2' };

      const result = getAllowedQueryParams(queryParams, []);

      expect(result).toEqual({ missingAllowedParams: [], allowedQueryParams: {} });
    });

    it('should extract allowed parameters when they exist in queryParams', () => {
      const queryParams = { param1: 'value1', param2: 'value2', param3: 'value3' };
      const allowedParams = [{ name: 'param1' }, { name: 'param3' }];

      const result = getAllowedQueryParams(queryParams, allowedParams);

      expect(result).toEqual({
        missingAllowedParams: [],
        allowedQueryParams: { param1: 'value1', param3: 'value3' },
      });
    });

    it('should handle missing required parameters', () => {
      const queryParams = { param1: 'value1' };
      const allowedParams = [
        { name: 'param1', required: true },
        { name: 'param2', required: true },
        { name: 'param3', required: true },
      ];

      const result = getAllowedQueryParams(queryParams, allowedParams);

      expect(result).toEqual({
        missingAllowedParams: ['param2', 'param3'],
        allowedQueryParams: { param1: 'value1' },
      });
    });

    it('should not include missing optional parameters in missingAllowedParams', () => {
      const queryParams = { param1: 'value1' };
      const allowedParams = [
        { name: 'param1' },
        { name: 'param2' },
        { name: 'param3', required: false },
      ];

      const result = getAllowedQueryParams(queryParams, allowedParams);

      expect(result).toEqual({
        missingAllowedParams: [],
        allowedQueryParams: { param1: 'value1' },
      });
    });

    it('should handle mixed required and optional parameters', () => {
      const queryParams = { requiredParam1: 'value1', optionalParam1: 'value2' };
      const allowedParams = [
        { name: 'requiredParam1', required: true },
        { name: 'requiredParam2', required: true },
        { name: 'optionalParam1' },
        { name: 'optionalParam2' },
      ];

      const result = getAllowedQueryParams(queryParams, allowedParams);

      expect(result).toEqual({
        missingAllowedParams: ['requiredParam2'],
        allowedQueryParams: { requiredParam1: 'value1', optionalParam1: 'value2' },
      });
    });

    it('should call resolver function with query parameter keys', () => {
      const queryParams = { param1: 'value1', param2: 'value2', param3: 'value3' };
      const resolver = vi
        .fn()
        .mockReturnValue([{ name: 'param1', required: true }, { name: 'param2' }]);

      const result = getAllowedQueryParams(queryParams, resolver);

      expect(resolver).toHaveBeenCalledOnce();
      expect(resolver).toHaveBeenCalledWith(['param1', 'param2', 'param3']);
      expect(result).toEqual({
        missingAllowedParams: [],
        allowedQueryParams: { param1: 'value1', param2: 'value2' },
      });
    });

    it('should handle resolver function returning empty array', () => {
      const queryParams = { param1: 'value1' };
      const resolver = vi.fn().mockReturnValue([]);

      const result = getAllowedQueryParams(queryParams, resolver);

      expect(resolver).toHaveBeenCalledOnce();
      expect(result).toEqual({ missingAllowedParams: [], allowedQueryParams: {} });
    });

    it('should handle resolver function with missing required parameters', () => {
      const queryParams = { param1: 'value1' };
      const resolver = vi.fn().mockReturnValue([
        { name: 'param1', required: true },
        { name: 'param2', required: true },
      ]);

      const result = getAllowedQueryParams(queryParams, resolver);

      expect(result).toEqual({
        missingAllowedParams: ['param2'],
        allowedQueryParams: { param1: 'value1' },
      });
    });

    it('should handle undefined query parameter values correctly', () => {
      const queryParams = { param1: 'value1', param2: undefined, param3: 'value3' };
      const allowedParams = [
        { name: 'param1' },
        { name: 'param2', required: true },
        { name: 'param3' },
      ];

      const result = getAllowedQueryParams(queryParams, allowedParams);

      expect(result).toEqual({
        missingAllowedParams: ['param2'],
        allowedQueryParams: { param1: 'value1', param3: 'value3' },
      });
    });

    it('should handle various data types in query parameter values', () => {
      const queryParams = {
        stringParam: 'string-value',
        numberParam: 123,
        booleanParam: true,
        arrayParam: ['val1', 'val2'],
        objectParam: { nested: 'value' },
      };
      const allowedParams = [
        { name: 'stringParam' },
        { name: 'numberParam' },
        { name: 'booleanParam' },
        { name: 'arrayParam' },
        { name: 'objectParam' },
      ];

      const result = getAllowedQueryParams(queryParams, allowedParams);

      expect(result).toEqual({
        missingAllowedParams: [],
        allowedQueryParams: {
          stringParam: 'string-value',
          numberParam: 123,
          booleanParam: true,
          arrayParam: ['val1', 'val2'],
          objectParam: { nested: 'value' },
        },
      });
    });

    it('should handle empty queryParams object', () => {
      const queryParams = {};
      const allowedParams = [{ name: 'param1', required: true }, { name: 'param2' }];

      const result = getAllowedQueryParams(queryParams, allowedParams);

      expect(result).toEqual({
        missingAllowedParams: ['param1'],
        allowedQueryParams: {},
      });
    });

    it('should handle null and false values as valid (not undefined)', () => {
      const queryParams = {
        nullParam: null,
        falseParam: false,
        zeroParam: 0,
        emptyStringParam: '',
      };
      const allowedParams = [
        { name: 'nullParam' },
        { name: 'falseParam' },
        { name: 'zeroParam' },
        { name: 'emptyStringParam' },
      ];

      const result = getAllowedQueryParams(queryParams, allowedParams);

      expect(result).toEqual({
        missingAllowedParams: [],
        allowedQueryParams: {
          nullParam: null,
          falseParam: false,
          zeroParam: 0,
          emptyStringParam: '',
        },
      });
    });

    it('should handle array with string parameters (optional by default)', () => {
      const queryParams = { param1: 'value1', param2: 'value2', param3: 'value3' };
      const allowedParams = ['param1', 'param2', 'missingParam'];

      const result = getAllowedQueryParams(queryParams, allowedParams);

      expect(result).toEqual({
        missingAllowedParams: [],
        allowedQueryParams: { param1: 'value1', param2: 'value2' },
      });
    });

    it('should handle mixed array with strings and objects', () => {
      const queryParams = {
        stringParam1: 'value1',
        stringParam2: 'value2',
        requiredParam: 'required-value',
        optionalParam: 'optional-value',
      };
      const allowedParams = [
        'stringParam1',
        'stringParam2',
        'missingStringParam',
        { name: 'requiredParam', required: true },
        { name: 'optionalParam', required: false },
        { name: 'missingRequiredParam', required: true },
      ];

      const result = getAllowedQueryParams(queryParams, allowedParams);

      expect(result).toEqual({
        missingAllowedParams: ['missingRequiredParam'],
        allowedQueryParams: {
          stringParam1: 'value1',
          stringParam2: 'value2',
          requiredParam: 'required-value',
          optionalParam: 'optional-value',
        },
      });
    });

    it('should handle resolver function returning strings', () => {
      const queryParams = {
        prefixedParam1: 'value1',
        prefixedParam2: 'value2',
        otherParam: 'value3',
      };
      const resolver = vi.fn().mockReturnValue(['prefixedParam1', 'prefixedParam2']);

      const result = getAllowedQueryParams(queryParams, resolver);

      expect(resolver).toHaveBeenCalledOnce();
      expect(result).toEqual({
        missingAllowedParams: [],
        allowedQueryParams: { prefixedParam1: 'value1', prefixedParam2: 'value2' },
      });
    });

    it('should handle resolver function returning mixed strings and objects', () => {
      const queryParams = {
        stringParam1: 'value1',
        stringParam2: 'value2',
        requiredParam: 'required-value',
        optionalParam: 'optional-value',
      };
      const resolver = vi
        .fn()
        .mockReturnValue([
          'stringParam1',
          'stringParam2',
          { name: 'requiredParam', required: true },
          { name: 'optionalParam', required: false },
          { name: 'missingRequiredParam', required: true },
        ]);

      const result = getAllowedQueryParams(queryParams, resolver);

      expect(resolver).toHaveBeenCalledOnce();
      expect(result).toEqual({
        missingAllowedParams: ['missingRequiredParam'],
        allowedQueryParams: {
          stringParam1: 'value1',
          stringParam2: 'value2',
          requiredParam: 'required-value',
          optionalParam: 'optional-value',
        },
      });
    });
  });

  describe('getPreviewCookies', () => {
    it('should generate correct preview cookies for a site', () => {
      const cookies = getPreviewCookies('test-site');

      expect(cookies).toHaveLength(2);
      expect(cookies[0]).toBe(`${SITE_KEY}=test-site; Path=/; HttpOnly; SameSite=None; Secure`);
      expect(cookies[1]).toBe(`${PREVIEW_KEY}=true; Path=/; HttpOnly; SameSite=None; Secure`);
    });

    it('should handle empty site name', () => {
      const cookies = getPreviewCookies('');

      expect(cookies).toHaveLength(2);
      expect(cookies[0]).toBe(`${SITE_KEY}=; Path=/; HttpOnly; SameSite=None; Secure`);
      expect(cookies[1]).toBe(`${PREVIEW_KEY}=true; Path=/; HttpOnly; SameSite=None; Secure`);
    });

    it('should handle site name with special characters', () => {
      const cookies = getPreviewCookies('test-site-with_special.chars');

      expect(cookies[0]).toBe(
        `${SITE_KEY}=test-site-with_special.chars; Path=/; HttpOnly; SameSite=None; Secure`
      );
    });
  });

  describe('getRequiredEditingParamsList', () => {
    it('should return component required params for design library mode', () => {
      expect(getRequiredEditingParamsList(DesignLibraryMode.Normal)).toEqual([
        'sc_site',
        'sc_itemid',
        'sc_renderingId',
        'sc_uid',
        'sc_lang',
        'mode',
      ]);
    });

    it('should return component required params for library metadata mode', () => {
      expect(getRequiredEditingParamsList(DesignLibraryMode.Metadata)).toEqual([
        'sc_site',
        'sc_itemid',
        'sc_renderingId',
        'sc_uid',
        'sc_lang',
        'mode',
      ]);
    });

    it('should return editing required params for edit mode', () => {
      expect(getRequiredEditingParamsList(LayoutServicePageState.Edit)).toEqual([
        'sc_site',
        'sc_itemid',
        'sc_lang',
        'route',
        'mode',
      ]);
    });

    it('should return editing required params for preview mode', () => {
      expect(getRequiredEditingParamsList(LayoutServicePageState.Preview)).toEqual([
        'sc_site',
        'sc_itemid',
        'sc_lang',
        'route',
        'mode',
      ]);
    });

    it('should return editing required params for undefined mode', () => {
      expect(getRequiredEditingParamsList(undefined as any)).toEqual([
        'sc_site',
        'sc_itemid',
        'sc_lang',
        'route',
        'mode',
      ]);
    });
  });

  describe('getHeadersForPropagation', () => {
    it('should filter and return approved headers from Headers object', () => {
      const headers = new Headers();
      headers.set('authorization', 'Bearer token123');
      headers.set('cookie', 'session=abc123');
      headers.set('content-type', 'application/json');
      headers.set('user-agent', 'Mozilla/5.0');

      expect(getHeadersForPropagation(headers)).toEqual({
        authorization: 'Bearer token123',
        cookie: 'session=abc123',
      });
    });

    it('should return empty object when no approved headers are present', () => {
      const headers = new Headers();
      headers.set('content-type', 'application/json');
      headers.set('user-agent', 'Mozilla/5.0');

      expect(getHeadersForPropagation(headers)).toEqual({});
    });

    it('should handle empty headers object', () => {
      expect(getHeadersForPropagation(new Headers())).toEqual({});
    });

    it('should ignore headers with null values', () => {
      expect(getHeadersForPropagation(new Headers())).toEqual({});
    });
  });

  describe('getEditingRequestHtml', () => {
    let mockDataFetcher: any;
    let requestUrl: URL;

    beforeEach(() => {
      mockDataFetcher = {
        get: vi.fn(),
      };
      requestUrl = new URL('https://example.com/page');
    });

    it('should successfully fetch and return HTML', async () => {
      const mockHtml = '<html><body>Content</body></html>';
      mockDataFetcher.get.mockResolvedValue({ data: mockHtml } as any);

      const result = await getEditingRequestHtml(
        requestUrl,
        { param1: 'value1' },
        { authorization: 'Bearer token' },
        ['session=abc123', 'other=xyz789'],
        mockDataFetcher as any
      );

      expect(result).toBe(mockHtml);
      expect(mockDataFetcher.get).toHaveBeenCalledOnce();

      const calledUrl = mockDataFetcher.get.mock.calls[0][0];
      expect(calledUrl).toContain('param1=value1');
      expect(calledUrl).toContain('timestamp=');

      const calledOptions = mockDataFetcher.get.mock.calls[0][1] as any;
      expect(calledOptions.headers.cookie).toBe('session=abc123;other=xyz789');
      expect(calledOptions.credentials).toBe('include');
    });

    it('should append cookies to existing cookie header', async () => {
      mockDataFetcher.get.mockResolvedValue({ data: '<html><body>Content</body></html>' } as any);

      await getEditingRequestHtml(
        requestUrl,
        {},
        { authorization: 'Bearer token', cookie: 'existing=cookie' },
        ['session=abc123'],
        mockDataFetcher as any
      );

      const calledOptions = mockDataFetcher.get.mock.calls[0][1] as any;
      expect(calledOptions.headers.cookie).toBe('existing=cookie;session=abc123');
    });

    it('should set __content_sdk_preview header', async () => {
      mockDataFetcher.get.mockResolvedValue({ data: '<html><body>Content</body></html>' } as any);

      await getEditingRequestHtml(requestUrl, {}, {}, [], mockDataFetcher as any);

      const calledOptions = mockDataFetcher.get.mock.calls[0][1] as any;
      expect(calledOptions.headers.__content_sdk_preview).toBe('1');
    });

    it('should handle 404 response without throwing', async () => {
      mockDataFetcher.get.mockRejectedValue({
        response: { status: 404, data: '<html><body>404 Not Found</body></html>' },
      });

      const result = await getEditingRequestHtml(requestUrl, {}, {}, [], mockDataFetcher as any);

      expect(result).toBe('<html><body>404 Not Found</body></html>');
    });

    it('should throw error for non-404 fetch failures', async () => {
      const error = { response: { status: 500 } };
      mockDataFetcher.get.mockRejectedValue(error);

      await expect(
        getEditingRequestHtml(requestUrl, {}, {}, [], mockDataFetcher as any)
      ).rejects.toEqual(error);
    });

    it('should throw error when HTML is empty', async () => {
      mockDataFetcher.get.mockResolvedValue({ data: '' } as any);

      await expect(
        getEditingRequestHtml(requestUrl, {}, {}, [], mockDataFetcher as any)
      ).rejects.toThrow('Failed to render html for');
    });

    it('should throw error when HTML is null', async () => {
      mockDataFetcher.get.mockResolvedValue({ data: null } as any);

      await expect(
        getEditingRequestHtml(requestUrl, {}, {}, [], mockDataFetcher as any)
      ).rejects.toThrow('Failed to render html for');
    });

    it('should add timestamp to URL', async () => {
      mockDataFetcher.get.mockResolvedValue({ data: '<html><body>Content</body></html>' } as any);

      const beforeTime = Date.now();
      await getEditingRequestHtml(requestUrl, {}, {}, [], mockDataFetcher as any);
      const afterTime = Date.now();

      const calledUrl = mockDataFetcher.get.mock.calls[0][0];
      const url = new URL(calledUrl);
      const timestamp = parseInt(url.searchParams.get('timestamp') || '0', 10);
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('isDesignLibraryPreviewData', () => {
    it('should return true for valid design library preview data', () => {
      expect(isDesignLibraryPreviewData({ mode: DesignLibraryMode.Normal })).toBe(true);
    });

    it('should return true for library metadata mode', () => {
      expect(isDesignLibraryPreviewData({ mode: DesignLibraryMode.Metadata })).toBe(true);
    });

    it('should return false for non-design library mode', () => {
      expect(isDesignLibraryPreviewData({ mode: 'edit' })).toBe(false);
    });

    it('should return false for null data', () => {
      expect(isDesignLibraryPreviewData(null)).toBe(false);
    });

    it('should return false for undefined data', () => {
      expect(isDesignLibraryPreviewData(undefined)).toBe(false);
    });

    it('should return false for non-object data', () => {
      expect(isDesignLibraryPreviewData('string')).toBe(false);
    });

    it('should return false for object without mode property', () => {
      expect(isDesignLibraryPreviewData({ otherProp: 'value' })).toBe(false);
    });

    it('should return false for empty object', () => {
      expect(isDesignLibraryPreviewData({})).toBe(false);
    });
  });

  describe('resolveServerUrl', () => {
    it('should return SITECORE_INTERNAL_EDITING_HOST_URL when set', () => {
      process.env.SITECORE_INTERNAL_EDITING_HOST_URL = 'https://custom-host.com';
      expect(resolveServerUrl(createMockEvent({ host: 'example.com' }))).toBe(
        'https://custom-host.com'
      );
    });

    it('should return localhost:3000 for XM Cloud deployments', () => {
      process.env.SITECORE = 'true';
      expect(resolveServerUrl(createMockEvent({ host: 'example.com' }))).toBe(
        'http://localhost:3000'
      );
    });

    it('should use https for Vercel deployment', () => {
      process.env.VERCEL = 'true';
      expect(resolveServerUrl(createMockEvent({ host: 'vercel-app.vercel.app' }))).toBe(
        'https://vercel-app.vercel.app'
      );
    });

    it('should use https for Netlify deployment', () => {
      process.env.NETLIFY = 'true';
      expect(resolveServerUrl(createMockEvent({ host: 'netlify-app.netlify.app' }))).toBe(
        'https://netlify-app.netlify.app'
      );
    });

    it('should use http for local development', () => {
      expect(resolveServerUrl(createMockEvent({ host: 'localhost:3000' }))).toBe(
        'http://localhost:3000'
      );
    });

    it('should prioritize SITECORE_INTERNAL_EDITING_HOST_URL over environment flags', () => {
      process.env.SITECORE_INTERNAL_EDITING_HOST_URL = 'https://priority-host.com';
      process.env.VERCEL = 'true';
      process.env.SITECORE = 'true';
      expect(resolveServerUrl(createMockEvent({ host: 'example.com' }))).toBe(
        'https://priority-host.com'
      );
    });

    it('should prioritize SITECORE over hosting platform flags', () => {
      process.env.SITECORE = 'true';
      process.env.VERCEL = 'true';
      process.env.NETLIFY = 'true';
      expect(resolveServerUrl(createMockEvent({ host: 'example.com' }))).toBe(
        'http://localhost:3000'
      );
    });

    it('should prioritize x-forwarded-host over host header', () => {
      expect(
        resolveServerUrl(
          createMockEvent({ 'x-forwarded-host': 'forwarded.com', host: 'localhost:3000' })
        )
      ).toBe('http://forwarded.com');
    });

    it('should handle missing host header gracefully', () => {
      expect(resolveServerUrl(createMockEvent({}))).toBe('http://null');
    });
  });

  describe('getCSPHeader', () => {
    it('should return CSP header with default allowed origins', () => {
      const result = getCSPHeader();
      expect(result).toContain("frame-ancestors 'self'");
      expect(result).toContain('https://pages.sitecorecloud.io');
    });

    it('should include custom allowed origins from environment', () => {
      process.env.JSS_ALLOWED_ORIGINS = 'https://custom1.com,https://custom2.com';
      const result = getCSPHeader();
      expect(result).toContain("frame-ancestors 'self'");
      expect(result).toContain('https://custom1.com');
      expect(result).toContain('https://custom2.com');
      expect(result).toContain('https://pages.sitecorecloud.io');
    });

    it('should handle empty JSS_ALLOWED_ORIGINS', () => {
      process.env.JSS_ALLOWED_ORIGINS = '';
      const result = getCSPHeader();
      expect(result).toContain("frame-ancestors 'self'");
      expect(result).toContain('https://pages.sitecorecloud.io');
    });

    it('should handle JSS_ALLOWED_ORIGINS with spaces', () => {
      process.env.JSS_ALLOWED_ORIGINS = ' https://custom1.com , https://custom2.com ';
      const result = getCSPHeader();
      expect(result).toContain('https://custom1.com');
      expect(result).toContain('https://custom2.com');
    });

    it('should include origins from both env and defaults even if duplicated', () => {
      process.env.JSS_ALLOWED_ORIGINS = 'https://pages.sitecorecloud.io,https://custom.com';

      const result = getCSPHeader();

      const matches = (result.match(/https:\/\/pages\.sitecorecloud\.io/g) || []).length;
      expect(matches).toBeGreaterThanOrEqual(1);
      expect(result).toContain('https://custom.com');
    });
  });
});
