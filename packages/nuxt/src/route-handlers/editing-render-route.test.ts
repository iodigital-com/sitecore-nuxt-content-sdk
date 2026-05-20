/* eslint-disable no-unused-vars */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockEvent, H3Event } from 'h3';
import { IncomingMessage, ServerResponse } from 'http';
import {
  EDITING_ALLOWED_ORIGINS,
  QUERY_PARAM_EDITING_SECRET,
  INVALID_SECRET_HTML_MESSAGE,
  DesignLibraryMode,
  PREVIEW_KEY,
} from '@sitecore-content-sdk/content/editing';
import { SITE_KEY } from '@sitecore-content-sdk/content/site';

vi.mock('../utils/utils', () => ({ getEditingSecret: vi.fn() }));
vi.mock('@sitecore-content-sdk/core/tools', () => ({ getEnforcedCorsHeaders: vi.fn() }));
vi.mock('../utils/editing-utils', () => ({
  getEditingRequestHtml: vi.fn(),
  getHeadersForPropagation: vi.fn(),
  getRequiredEditingParamsList: vi.fn(),
  getCSPHeader: vi.fn(),
  resolveServerUrl: vi.fn(),
  getAllowedQueryParams: vi.fn(),
  getPreviewCookies: vi.fn(),
  mapEditingParams: vi.fn(),
}));
vi.mock('@sitecore-content-sdk/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sitecore-content-sdk/core')>();
  return {
    ...actual,
    NativeDataFetcher: vi.fn().mockImplementation(class {}),
  };
});
vi.mock('h3', async () => {
  const actual = await vi.importActual<typeof import('h3')>('h3');
  return { ...actual, proxyRequest: vi.fn() };
});

import { getEditingSecret } from '../utils/utils';
import { getEnforcedCorsHeaders } from '@sitecore-content-sdk/core/tools';
import {
  getEditingRequestHtml,
  getHeadersForPropagation,
  getRequiredEditingParamsList,
  getCSPHeader,
  resolveServerUrl,
  getAllowedQueryParams,
  getPreviewCookies,
  mapEditingParams,
} from '../utils/editing-utils';
import { proxyRequest } from 'h3';
import { createEditingRenderRoute } from './editing-render-route';

const createMockEvent = (headers: Record<string, string> = {}, path: string = '/'): H3Event => {
  const event = mockEvent(`http://localhost${path}`, { method: 'GET', headers });

  const req = new IncomingMessage(null as any);
  req.headers = headers;
  req.url = path;
  req.method = 'GET';
  const res = new ServerResponse(req);

  (event.req as any).runtime = { node: { req, res } };

  return event;
};

const buildPath = (params: Record<string, string>) => {
  const searchParams = new URLSearchParams(params);
  return `/?${searchParams.toString()}`;
};

describe('createEditingRenderRoute', () => {
  let handlers: any;

  const allowedOrigin = 'https://allowed.com';
  const secret = 'secret1234';

  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE, PUT, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  const defaultQuery = {
    [QUERY_PARAM_EDITING_SECRET]: secret,
    mode: 'edit',
    route: '/styleguide',
    sc_itemid: '{11111111-1111-1111-1111-111111111111}',
    sc_lang: 'en',
    sc_site: 'website',
    sc_variant: 'dev',
    sc_version: 'latest',
    sc_layoutKind: 'shared',
  };

  beforeEach(() => {
    vi.mocked(getEditingSecret).mockReturnValue(secret);
    vi.mocked(getEnforcedCorsHeaders).mockReturnValue(corsHeaders);
    vi.mocked(getEditingRequestHtml).mockResolvedValue('<div>some html</div>');
    vi.mocked(resolveServerUrl).mockReturnValue('http://localhost:3000');
    vi.mocked(getHeadersForPropagation).mockReturnValue({});
    vi.mocked(getRequiredEditingParamsList).mockReturnValue([
      'sc_itemid',
      'sc_lang',
      'route',
      'mode',
    ]);
    vi.mocked(getCSPHeader).mockReturnValue(
      `frame-ancestors 'self' $${allowedOrigin} $${EDITING_ALLOWED_ORIGINS.join(' ')}`
    );
    vi.mocked(getAllowedQueryParams).mockReturnValue({
      missingAllowedParams: [],
      allowedQueryParams: {},
    });
    vi.mocked(getPreviewCookies).mockReturnValue([
      `${SITE_KEY}=website; Path=/; HttpOnly; SameSite=None; Secure`,
      `${PREVIEW_KEY}=true; Path=/; HttpOnly; SameSite=None; Secure`,
    ]);
    vi.mocked(mapEditingParams).mockImplementation((query: any) => ({
      itemId: query.sc_itemid,
      language: query.sc_lang,
      site: query.sc_site,
      mode: query.mode,
      variantIds: query.sc_variant,
      version: query.sc_version,
      layoutKind: query.sc_layoutKind,
    }));
    vi.mocked(proxyRequest).mockResolvedValue(undefined);

    handlers = createEditingRenderRoute({});
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.JSS_ALLOWED_ORIGINS;
  });

  describe('GET handler', () => {
    it('should return 401 for invalid origin', async () => {
      vi.mocked(getEnforcedCorsHeaders).mockReturnValue(null);
      const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));

      const body = await handlers.handleGet(event);

      expect(event.res.status).toBe(401);
      expect(body).toContain('not allowed');
    });

    it('should return 401 for invalid editing secret', async () => {
      const event = createMockEvent(
        { origin: allowedOrigin },
        buildPath({ ...defaultQuery, [QUERY_PARAM_EDITING_SECRET]: 'wrong-secret' })
      );

      const body = await handlers.handleGet(event);

      expect(event.res.status).toBe(401);
      expect(JSON.parse(body).html).toBe(INVALID_SECRET_HTML_MESSAGE);
    });

    it('should return 401 for missing editing secret', async () => {
      const { [QUERY_PARAM_EDITING_SECRET]: _, ...queryWithoutSecret } = defaultQuery;
      const event = createMockEvent({ origin: allowedOrigin }, buildPath(queryWithoutSecret));

      const body = await handlers.handleGet(event);

      expect(event.res.status).toBe(401);
      expect(JSON.parse(body).html).toBe(INVALID_SECRET_HTML_MESSAGE);
    });

    it('should return 400 for missing required query parameters', async () => {
      const event = createMockEvent(
        { origin: allowedOrigin },
        buildPath({ [QUERY_PARAM_EDITING_SECRET]: secret, sc_site: 'website' })
      );

      const body = await handlers.handleGet(event);

      expect(event.res.status).toBe(400);
      expect(JSON.parse(body).html).toBe(
        '<html><body>Missing required query parameters: sc_itemid, sc_lang, route, mode</body></html>'
      );
    });

    it('should handle successful request', async () => {
      const mockHtml =
        '<html><head><title>Test Page</title></head><body><div>some html content</div></body></html>';
      vi.mocked(getEditingRequestHtml).mockResolvedValue(mockHtml);

      const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));

      const body = await handlers.handleGet(event);

      expect(event.res.status ?? 200).toBe(200);
      expect(body).toBe(mockHtml);
      expect(event.res.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
      expect(event.res.headers.get('Content-Security-Policy')).toContain('frame-ancestors');
    });

    it('should launch internal request and pass preview data as search params', async () => {
      vi.mocked(getHeadersForPropagation).mockReturnValue({
        authorization: 'Bearer token123',
        cookie: 'test=value',
      });

      const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));

      await handlers.handleGet(event);

      expect(vi.mocked(getEditingRequestHtml)).toHaveBeenCalledOnce();

      const [requestUrl, propagatedQsParams, propagatedHeaders] =
        vi.mocked(getEditingRequestHtml).mock.calls[0];

      expect(requestUrl).toBeInstanceOf(URL);
      expect((requestUrl as URL).pathname).toBe('/styleguide');
      expect((requestUrl as URL).origin).toBe('http://localhost:3000');

      expect(propagatedQsParams).toMatchObject({
        itemId: defaultQuery.sc_itemid,
        language: defaultQuery.sc_lang,
        site: defaultQuery.sc_site,
        mode: defaultQuery.mode,
        variantIds: defaultQuery.sc_variant,
        version: defaultQuery.sc_version,
        layoutKind: defaultQuery.sc_layoutKind,
      });

      expect(propagatedHeaders).toEqual({
        authorization: 'Bearer token123',
        cookie: 'test=value',
      });
    });

    it('should construct request URL with route for internal request', async () => {
      const testRoute = '/products/category/item';
      vi.mocked(resolveServerUrl).mockReturnValue('https://my-app.example.com:8080');

      const event = createMockEvent(
        { origin: allowedOrigin },
        buildPath({ ...defaultQuery, route: testRoute })
      );

      await handlers.handleGet(event);

      const [requestUrl] = vi.mocked(getEditingRequestHtml).mock.calls[0];
      expect((requestUrl as URL).toString()).toBe(
        'https://my-app.example.com:8080/products/category/item'
      );
      expect((requestUrl as URL).protocol).toBe('https:');
      expect((requestUrl as URL).hostname).toBe('my-app.example.com');
      expect((requestUrl as URL).port).toBe('8080');
      expect((requestUrl as URL).pathname).toBe(testRoute);
    });

    it('should use custom resolvePageUrl', async () => {
      handlers = createEditingRenderRoute({
        resolvePageUrl: (itemPath: string) => `/custom/path${itemPath}`,
      });

      const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));

      await handlers.handleGet(event);

      const [requestUrl] = vi.mocked(getEditingRequestHtml).mock.calls[0];
      expect((requestUrl as URL).pathname).toBe('/custom/path/styleguide');
    });

    it('should handle request with special characters in route', async () => {
      const event = createMockEvent(
        { origin: allowedOrigin },
        buildPath({ ...defaultQuery, route: '/Åbout' })
      );

      await handlers.handleGet(event);

      expect(event.res.status ?? 200).toBe(200);
      const [requestUrl] = vi.mocked(getEditingRequestHtml).mock.calls[0];
      expect((requestUrl as URL).pathname).toBe('/%C3%85bout');
    });

    it('should set preview cookies for preview mode', async () => {
      const event = createMockEvent(
        { origin: allowedOrigin },
        buildPath({ ...defaultQuery, mode: 'preview' })
      );

      await handlers.handleGet(event);

      expect(event.res.status ?? 200).toBe(200);
      expect(vi.mocked(getPreviewCookies)).toHaveBeenCalledWith('website');

      const [, , , cookies] = vi.mocked(getEditingRequestHtml).mock.calls[0];
      expect(cookies).toContain(`${PREVIEW_KEY}=true; Path=/; HttpOnly; SameSite=None; Secure`);
      expect(cookies).toContain(`${SITE_KEY}=website; Path=/; HttpOnly; SameSite=None; Secure`);
    });

    it('should not set preview cookies for non-preview mode', async () => {
      const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));

      await handlers.handleGet(event);

      expect(vi.mocked(getPreviewCookies)).not.toHaveBeenCalled();
    });

    it('should handle request failure with redirect fallback', async () => {
      vi.mocked(getEditingRequestHtml).mockRejectedValue(new Error('Request failed'));

      const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));

      await handlers.handleGet(event);

      expect(event.res.status).toBe(307);
      expect(event.res.headers.get('Location')).toBe('/styleguide');
    });

    it('should set Content-Security-Policy header', async () => {
      const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));

      await handlers.handleGet(event);

      expect(vi.mocked(getCSPHeader)).toHaveBeenCalledOnce();
      expect(event.res.headers.get('Content-Security-Policy')).toBe(
        `frame-ancestors 'self' $${allowedOrigin} $${EDITING_ALLOWED_ORIGINS.join(' ')}`
      );
    });

    it('should set correct CORS headers', async () => {
      const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));

      await handlers.handleGet(event);

      expect(event.res.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin);
      expect(event.res.headers.get('Access-Control-Allow-Methods')).toBe(
        corsHeaders['Access-Control-Allow-Methods']
      );
      expect(event.res.headers.get('Access-Control-Allow-Headers')).toBe(
        corsHeaders['Access-Control-Allow-Headers']
      );
    });

    it('should call getEnforcedCorsHeaders with correct parameters', async () => {
      const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));

      await handlers.handleGet(event);

      expect(vi.mocked(getEnforcedCorsHeaders)).toHaveBeenCalledOnce();
      const args = vi.mocked(getEnforcedCorsHeaders).mock.calls[0][0];
      expect(args.requestMethod).toBe('GET');
      expect((args.headers as Headers).get('origin')).toBe(allowedOrigin);
      expect(args.allowedOrigins).toEqual(EDITING_ALLOWED_ORIGINS);
    });

    describe('allowedQueryParams configuration', () => {
      it('should not include additional query params when allowedQueryParams is not configured', async () => {
        vi.mocked(getAllowedQueryParams).mockReturnValue({
          missingAllowedParams: [],
          allowedQueryParams: {},
        });

        const event = createMockEvent(
          { origin: allowedOrigin },
          buildPath({ ...defaultQuery, customParam1: 'value1', customParam2: 'value2' })
        );

        await handlers.handleGet(event);

        expect(event.res.status ?? 200).toBe(200);
        expect(vi.mocked(getAllowedQueryParams)).toHaveBeenCalled();
      });

      it('should include allowed query params when configured as array', async () => {
        handlers = createEditingRenderRoute({
          allowedQueryParams: [{ name: 'customParam1' }, { name: 'customParam2' }, 'stringParam'],
        });

        vi.mocked(getAllowedQueryParams).mockReturnValue({
          missingAllowedParams: [],
          allowedQueryParams: {
            customParam1: 'value1',
            customParam2: 'value2',
            stringParam: 'string-value',
          },
        });

        const event = createMockEvent(
          { origin: allowedOrigin },
          buildPath({ ...defaultQuery, customParam1: 'value1', customParam2: 'value2' })
        );

        await handlers.handleGet(event);

        expect(event.res.status ?? 200).toBe(200);
        expect(vi.mocked(getAllowedQueryParams)).toHaveBeenCalledWith(
          expect.anything(),
          expect.any(Array)
        );
      });

      it('should return 400 when required allowed query param is missing', async () => {
        handlers = createEditingRenderRoute({
          allowedQueryParams: [{ name: 'customParam1', required: true }],
        });

        vi.mocked(getAllowedQueryParams).mockReturnValue({
          missingAllowedParams: ['customParam1'],
          allowedQueryParams: {},
        });

        const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));

        const body = await handlers.handleGet(event);

        expect(event.res.status).toBe(400);
        expect(JSON.parse(body).html).toBe(
          '<html><body>Missing required query parameters: customParam1</body></html>'
        );
      });

      it('should combine missing required editing params and missing required allowed params in error message', async () => {
        handlers = createEditingRenderRoute({
          allowedQueryParams: [{ name: 'requiredAllowedParam', required: true }],
        });

        vi.mocked(getAllowedQueryParams).mockReturnValue({
          missingAllowedParams: ['requiredAllowedParam'],
          allowedQueryParams: {},
        });

        const event = createMockEvent(
          { origin: allowedOrigin },
          buildPath({ [QUERY_PARAM_EDITING_SECRET]: secret, sc_site: 'website' })
        );

        const body = await handlers.handleGet(event);

        expect(event.res.status).toBe(400);
        const responseBody = JSON.parse(body);
        expect(responseBody.html).toContain('sc_itemid');
        expect(responseBody.html).toContain('sc_lang');
        expect(responseBody.html).toContain('route');
        expect(responseBody.html).toContain('mode');
        expect(responseBody.html).toContain('requiredAllowedParam');
      });

      it('should pass allowed query params to getEditingRequestHtml', async () => {
        handlers = createEditingRenderRoute({
          allowedQueryParams: [{ name: 'customParam1' }, { name: 'customParam2' }],
        });

        vi.mocked(getAllowedQueryParams).mockReturnValue({
          missingAllowedParams: [],
          allowedQueryParams: {
            customParam1: 'value1',
            customParam2: 'value2',
          },
        });

        const event = createMockEvent(
          { origin: allowedOrigin },
          buildPath({ ...defaultQuery, customParam1: 'value1', customParam2: 'value2' })
        );

        await handlers.handleGet(event);

        const [, propagatedQsParams] = vi.mocked(getEditingRequestHtml).mock.calls[0];
        expect(propagatedQsParams).toMatchObject({
          customParam1: 'value1',
          customParam2: 'value2',
        });
      });

      it('should use resolver function for allowedQueryParams', async () => {
        handlers = createEditingRenderRoute({
          allowedQueryParams: (keys: string[]) => keys.filter((k) => k.startsWith('prefixed')),
        });

        vi.mocked(getAllowedQueryParams).mockReturnValue({
          missingAllowedParams: [],
          allowedQueryParams: { prefixedParam1: 'value1' },
        });

        const event = createMockEvent(
          { origin: allowedOrigin },
          buildPath({ ...defaultQuery, prefixedParam1: 'value1' })
        );

        await handlers.handleGet(event);

        expect(vi.mocked(getAllowedQueryParams)).toHaveBeenCalledWith(
          expect.anything(),
          expect.any(Function)
        );
      });
    });

    describe('Design Library handling', () => {
      it('should handle request with mode=library', async () => {
        const mockLibraryHtml =
          '<html><head><title>Design Library</title></head><body><div class="component-library">Library Content</div></body></html>';
        vi.mocked(getEditingRequestHtml).mockResolvedValue(mockLibraryHtml);

        const event = createMockEvent(
          { origin: allowedOrigin },
          buildPath({
            [QUERY_PARAM_EDITING_SECRET]: secret,
            mode: DesignLibraryMode.Normal,
            sc_itemid: '{11111111-1111-1111-1111-111111111111}',
            sc_lang: 'en',
            sc_site: 'website',
            route: '/components',
            sc_renderingId: '123',
            sc_uid: '789',
          })
        );

        const body = await handlers.handleGet(event);

        expect(event.res.status ?? 200).toBe(200);
        expect(body).toBe(mockLibraryHtml);
        expect(body).toContain('Design Library');
        expect(body).toContain('component-library');
      });

      it('should handle request with mode=library-metadata', async () => {
        const mockMetadataHtml =
          '<html><head><title>Component Metadata</title></head><body><div class="metadata-view"></div></body></html>';
        vi.mocked(getEditingRequestHtml).mockResolvedValue(mockMetadataHtml);

        const event = createMockEvent(
          { origin: allowedOrigin },
          buildPath({
            [QUERY_PARAM_EDITING_SECRET]: secret,
            mode: DesignLibraryMode.Metadata,
            sc_itemid: '{11111111-1111-1111-1111-111111111111}',
            sc_lang: 'en',
            sc_site: 'website',
            route: '/components',
            sc_renderingId: '123',
            sc_uid: '789',
          })
        );

        const body = await handlers.handleGet(event);

        expect(event.res.status ?? 200).toBe(200);
        expect(body).toBe(mockMetadataHtml);
        expect(body).toContain('Component Metadata');
      });
    });

    describe('multiple variant handling', () => {
      it('should handle multiple variant ids', async () => {
        const event = createMockEvent(
          { origin: allowedOrigin },
          buildPath({ ...defaultQuery, sc_variant: 'id-1,id-2,id-3' })
        );

        await handlers.handleGet(event);

        expect(event.res.status ?? 200).toBe(200);
      });
    });

    describe('internal server request host resolution', () => {
      it('should use resolveServerUrl for making internal request', async () => {
        vi.mocked(resolveServerUrl).mockReturnValue('http://some-other-host:8080');

        const event = createMockEvent(
          { origin: allowedOrigin, host: 'some-other-host:8080' },
          buildPath(defaultQuery)
        );

        await handlers.handleGet(event);

        expect(vi.mocked(resolveServerUrl)).toHaveBeenCalledOnce();
        const [requestUrl] = vi.mocked(getEditingRequestHtml).mock.calls[0];
        expect((requestUrl as URL).origin).toBe('http://some-other-host:8080');
      });
    });
  });

  describe('OPTIONS handler', () => {
    it('should return 401 for invalid origin', async () => {
      vi.mocked(getEnforcedCorsHeaders).mockReturnValue(null);

      const event = createMockEvent({ origin: allowedOrigin }, '/');

      const body = await handlers.handleOptions(event);

      expect(event.res.status).toBe(401);
      expect(body).toContain('not allowed');
    });

    it('should return 204 for valid preflight request', async () => {
      const event = createMockEvent({ origin: allowedOrigin }, '/');

      await handlers.handleOptions(event);

      expect(event.res.status).toBe(204);
      expect(event.res.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin);
      expect(event.res.headers.get('Access-Control-Allow-Methods')).toBe(
        corsHeaders['Access-Control-Allow-Methods']
      );
      expect(event.res.headers.get('Access-Control-Allow-Headers')).toBe(
        corsHeaders['Access-Control-Allow-Headers']
      );
    });

    it('should call getEnforcedCorsHeaders with correct parameters', async () => {
      const event = createMockEvent({ origin: allowedOrigin }, '/');

      await handlers.handleOptions(event);

      expect(vi.mocked(getEnforcedCorsHeaders)).toHaveBeenCalledOnce();
      const args = vi.mocked(getEnforcedCorsHeaders).mock.calls[0][0];
      expect(args.requestMethod).toBe('GET');
      expect((args.headers as Headers).get('origin')).toBe(allowedOrigin);
    });

    it('should return 500 for unexpected errors', async () => {
      vi.mocked(getEnforcedCorsHeaders).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const event = createMockEvent({ origin: allowedOrigin }, '/');

      const body = await handlers.handleOptions(event);

      expect(event.res.status).toBe(500);
      expect(body).toBe('Internal Server Error');
    });
  });

  describe('Design Library handling', () => {
    it('should handle request with mode=library', async () => {
      const mockLibraryHtml =
        '<html><head><title>Design Library</title></head><body><div class="component-library">Library Content</div></body></html>';
      vi.mocked(getEditingRequestHtml).mockResolvedValue(mockLibraryHtml);

      const event = createMockEvent(
        { origin: allowedOrigin },
        buildPath({
          [QUERY_PARAM_EDITING_SECRET]: secret,
          mode: DesignLibraryMode.Normal,
          sc_itemid: '{11111111-1111-1111-1111-111111111111}',
          sc_lang: 'en',
          sc_site: 'website',
          route: '/components',
          sc_renderingId: '123',
          sc_uid: '789',
        })
      );

      const body = await handlers.handleGet(event);

      expect(event.res.status ?? 200).toBe(200);
      expect(body).toBe(mockLibraryHtml);
      expect(body).toContain('Design Library');
      expect(body).toContain('component-library');
      expect(body).toContain('Library Content');
    });

    it('should handle request with mode=library-metadata', async () => {
      const mockMetadataHtml =
        '<html><head><title>Component Metadata</title></head><body><div class="metadata-view"><script type="application/json">{"componentId":"123","metadata":{}}</script></div></body></html>';
      vi.mocked(getEditingRequestHtml).mockResolvedValue(mockMetadataHtml);

      const event = createMockEvent(
        { origin: allowedOrigin },
        buildPath({
          [QUERY_PARAM_EDITING_SECRET]: secret,
          mode: DesignLibraryMode.Metadata,
          sc_itemid: '{11111111-1111-1111-1111-111111111111}',
          sc_lang: 'en',
          sc_site: 'website',
          route: '/components',
          sc_renderingId: '123',
          sc_uid: '789',
        })
      );

      const body = await handlers.handleGet(event);

      expect(event.res.status ?? 200).toBe(200);
      expect(body).toBe(mockMetadataHtml);
      expect(body).toContain('Component Metadata');
      expect(body).toContain('metadata-view');
      expect(body).toContain('componentId');
    });
  });

  describe('Sitecore Preview handling', () => {
    it('should handle preview request', async () => {
      const mockPreviewHtml =
        '<html><head><title>Preview Mode</title><meta name="preview" content="true"></head><body><div class="preview-content">Preview page content</div></body></html>';
      vi.mocked(getEditingRequestHtml).mockResolvedValue(mockPreviewHtml);

      const event = createMockEvent(
        { origin: allowedOrigin },
        buildPath({
          [QUERY_PARAM_EDITING_SECRET]: secret,
          mode: 'preview',
          route: '/styleguide',
          sc_itemid: '{11111111-1111-1111-1111-111111111111}',
          sc_lang: 'en',
          sc_site: 'website',
          sc_variant: 'dev',
          sc_version: 'latest',
          sc_layoutKind: 'final',
        })
      );

      const body = await handlers.handleGet(event);

      expect(event.res.status ?? 200).toBe(200);
      expect(body).toBe(mockPreviewHtml);
      expect(event.res.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
      expect(vi.mocked(getPreviewCookies)).toHaveBeenCalledWith('website');

      const [, , , cookies] = vi.mocked(getEditingRequestHtml).mock.calls[0];
      expect(cookies).toContain(`${PREVIEW_KEY}=true; Path=/; HttpOnly; SameSite=None; Secure`);
      expect(cookies).toContain(`${SITE_KEY}=website; Path=/; HttpOnly; SameSite=None; Secure`);

      expect(body).toContain('Preview Mode');
      expect(body).toContain('name="preview"');
      expect(body).toContain('preview-content');
      expect(body).toContain('Preview page content');
    });
  });

  describe('internal server request host resolution', () => {
    it('should use resolveServerUrl for making internal request', async () => {
      vi.mocked(resolveServerUrl).mockReturnValue('http://some-other-host:8080');

      const event = createMockEvent(
        { origin: allowedOrigin, host: 'some-other-host:8080' },
        buildPath(defaultQuery)
      );

      await handlers.handleGet(event);

      expect(vi.mocked(resolveServerUrl)).toHaveBeenCalledOnce();
      const [requestUrl] = vi.mocked(getEditingRequestHtml).mock.calls[0];
      expect((requestUrl as URL).origin).toBe('http://some-other-host:8080');
    });

    it('should use custom sitecoreInternalEditingHostUrl if provided', async () => {
      const customHost = 'http://custom-internal-host:9000';
      const customHandlers = createEditingRenderRoute({
        sitecoreInternalEditingHostUrl: customHost,
      });

      vi.mocked(resolveServerUrl).mockReturnValue(customHost);

      const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));

      await customHandlers.handleGet(event);

      const [requestUrl] = vi.mocked(getEditingRequestHtml).mock.calls[0];
      expect((requestUrl as URL).origin).toBe(customHost);
    });
  });

  describe('multiple variant handling', () => {
    it('should handle multiple variant ids', async () => {
      const event = createMockEvent(
        { origin: allowedOrigin },
        buildPath({ ...defaultQuery, sc_variant: 'id-1,id-2,id-3' })
      );

      await handlers.handleGet(event);

      expect(event.res.status ?? 200).toBe(200);
    });
  });

  describe('CORS handling', () => {
    it('should set correct CORS headers on GET response', async () => {
      const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));

      await handlers.handleGet(event);

      expect(event.res.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin);
      expect(event.res.headers.get('Access-Control-Allow-Methods')).toBe(
        corsHeaders['Access-Control-Allow-Methods']
      );
      expect(event.res.headers.get('Access-Control-Allow-Headers')).toBe(
        corsHeaders['Access-Control-Allow-Headers']
      );
    });

    it('should handle multiple allowed origins', async () => {
      process.env.JSS_ALLOWED_ORIGINS = 'https://allowed.com,https://anotherallowed.com';
      vi.mocked(getCSPHeader).mockReturnValue(
        `frame-ancestors 'self' https://allowed.com https://anotherallowed.com ${EDITING_ALLOWED_ORIGINS.join(
          ' '
        )}`
      );

      const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));

      await handlers.handleGet(event);

      expect(vi.mocked(getCSPHeader)).toHaveBeenCalledOnce();
      expect(event.res.headers.get('Content-Security-Policy')).toContain(
        'https://anotherallowed.com'
      );
    });
  });
});
