/* eslint-disable no-unused-expressions */
/* eslint-disable dot-notation */
import { describe, it, beforeEach, afterEach, beforeAll, afterAll, vi, expect } from 'vitest';
import { mockEvent, H3Event } from 'h3';
import {
  REDIRECT_TYPE_301,
  REDIRECT_TYPE_302,
  REDIRECT_TYPE_SERVER_TRANSFER,
  RedirectsService,
  SiteResolver,
} from '@sitecore-content-sdk/content/site';
import { GraphQLRequestClient } from '@sitecore-content-sdk/core';
import { RedirectsMiddleware, RedirectsMiddlewareConfig } from './redirects-middleware';
import debug from '../debug';

const hostname = 'foo.net';
const siteName = 'nextjs-app';
const sitesFromConfigFile = [
  { name: 'basicSite', hostName: 'localhost', language: 'en' },
  { name: 'nextjs-app', hostName: '*', language: 'da' },
];

const defaultConfig: Omit<RedirectsMiddlewareConfig, 'clientFactory'> = {
  enabled: true,
  contextId: '0000-0000-0000',
  clientContextId: '0000-0000-0000',
  edgeUrl: 'https://foo.bar',
  locales: ['en', 'da'],
  sites: sitesFromConfigFile,
};

const createMockEvent = (
  headers: Record<string, string> = {},
  cookies: Record<string, string> = {},
  path: string = '/old-page',
  responseHeaders: Record<string, string> = {}
): H3Event => {
  const cookieHeader = Object.keys(cookies).length
    ? Object.entries(cookies)
        .map(([k, v]) => `${k}=${v}`)
        .join('; ')
    : undefined;

  const event = mockEvent(`http://${hostname}${path}`, {
    headers: {
      host: hostname,
      referer: 'http://localhost:3000',
      ...headers,
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
  });

  Object.entries(responseHeaders).forEach(([key, value]) => {
    event.res.headers.set(key, value);
  });

  return event;
};

type TestMiddlewareProps = {
  redirectsMiddlewareConfig?: Partial<RedirectsMiddlewareConfig>;
  redirectMaps?: {
    pattern: string;
    target: string;
    redirectType?: string;
    isQueryStringPreserved?: boolean;
    isLanguagePreserved?: boolean;
  }[];
  pattern?: string;
  target?: string;
  redirectType?: string;
  isQueryStringPreserved?: boolean;
  isLanguagePreserved?: boolean;
  locale?: string;
  fetchRedirectsStub?: any;
  getClientFactoryStub?: any;
  defaultHostname?: string;
  siteResolver?: SiteResolver;
};

const createMiddleware = (input: TestMiddlewareProps = {}) => {
  const props = {
    ...defaultConfig,
    ...input.redirectsMiddlewareConfig,
    ...(input.defaultHostname ? { defaultHostname: input.defaultHostname } : {}),
  };

  class MockSiteResolver extends SiteResolver {
    getByName = vi.fn().mockReturnValue({
      name: siteName,
      language: input.locale ?? 'en',
      hostName: hostname,
    });

    getByHost = vi.fn().mockReturnValue({
      name: siteName,
      language: input.locale ?? 'en',
      hostName: hostname,
    });
  }

  const siteResolver = input.siteResolver ?? new MockSiteResolver([]);

  const clientFactory = GraphQLRequestClient.createClientFactory({
    apiKey: 'edge-api-key',
    endpoint: 'http://edge-endpoint/api/graph/edge',
  });

  const getClientFactory = input.getClientFactoryStub ?? vi.fn().mockReturnValue(clientFactory);

  const defaultRedirects = input.redirectMaps ?? [
    {
      pattern: input.pattern ?? '/old-page',
      target: input.target ?? '/new-page',
      redirectType: input.redirectType ?? REDIRECT_TYPE_301,
      isQueryStringPreserved: input.isQueryStringPreserved ?? true,
      isLanguagePreserved: input.isLanguagePreserved ?? true,
    },
  ];

  const fetchRedirectsStub =
    input.fetchRedirectsStub ?? vi.fn().mockResolvedValue(defaultRedirects);

  const mockRedirectsService = {
    fetchRedirects: fetchRedirectsStub,
  } as unknown as RedirectsService;

  const middleware = new RedirectsMiddleware({
    ...props,
    redirectsService: mockRedirectsService,
  } as RedirectsMiddlewareConfig);

  middleware['siteResolver'] = siteResolver;
  middleware['getClientFactory'] = getClientFactory;

  return { middleware, siteResolver, fetchRedirectsStub, getClientFactory };
};

describe('RedirectsMiddleware', () => {
  let debugSpy: ReturnType<typeof vi.spyOn>;

  const validateDebugLog = (message: string, ...params: unknown[]) => {
    const foundLog = debugSpy.mock.calls.find((log: unknown[]) => log[0] === message);
    expect(foundLog).toEqual([message, ...params]);
  };

  const validateEndMessageDebugLog = (message: string, params: unknown) => {
    const logParams = debugSpy.mock.calls.find(
      (log: unknown[]) => log[0] === message
    ) as Array<unknown>;
    expect(logParams[2]).toEqual(params);
  };

  beforeEach(() => {
    debugSpy = vi.spyOn(debug, 'redirects').mockImplementation(() => {});
  });

  afterEach(() => {
    debugSpy.mockRestore();
  });

  describe('request skipped', () => {
    describe('disabled / skip', () => {
      const test = async (pathname: string, middleware: RedirectsMiddleware) => {
        const event = createMockEvent({}, {}, pathname);

        await middleware.handle(event);

        const isDisabledGlobally = middleware['config'].enabled === false;

        if (!isDisabledGlobally) {
          validateDebugLog('redirects middleware start: %o', {
            pathname,
            language: 'en',
            hostname: 'foo.net',
          });
        }

        const message = isDisabledGlobally
          ? 'skipped (redirects middleware is disabled globally)'
          : 'skipped (redirects middleware is disabled)';
        validateDebugLog(message);

        debugSpy.mockClear();
      };

      it('default', async () => {
        const { middleware } = createMiddleware();
        await test('/src/image.png', middleware);
        await test('/api/layout/render', middleware);
        await test('/sitecore/render', middleware);
        await test('/_nuxt/webpack', middleware);
      });

      it('should apply both default and custom rules when custom skip function provided', async () => {
        const skip = (event: H3Event) => event.url.pathname === '/crazypath/luna';
        const { middleware } = createMiddleware({
          redirectsMiddlewareConfig: { ...defaultConfig, skip },
        });
        await test('/src/image.png', middleware);
        await test('/api/layout/render', middleware);
        await test('/sitecore/render', middleware);
        await test('/_nuxt/webpack', middleware);
        await test('/crazypath/luna', middleware);
      });
    });

    describe('preview', () => {
      it('preview cookie is present', async () => {
        const event = createMockEvent({}, { sc_preview: 'true' });
        const { middleware } = createMiddleware();

        await middleware.handle(event);

        validateDebugLog('skipped (preview)');
      });
    });

    describe('prefetch', () => {
      it('prefetch header is present', async () => {
        const event = createMockEvent({ purpose: 'prefetch' });
        const { middleware } = createMiddleware();

        await middleware.handle(event);

        validateDebugLog('redirects middleware start: %o', {
          pathname: '/old-page',
          language: 'en',
          hostname: 'foo.net',
        });
        validateDebugLog('skipped (prefetch)');
        expect(event.res.headers.get('x-proxy-cache')).toBe('no-cache');
        expect(event.res.headers.get('Cache-Control')).toBe('no-store, must-revalidate');
      });
    });
  });

  describe('request passed', () => {
    it('should redirect with 301 when redirect type is 301', async () => {
      const event = createMockEvent();
      const { middleware, fetchRedirectsStub } = createMiddleware({
        pattern: '/old-page',
        target: '/new-page',
        redirectType: REDIRECT_TYPE_301,
      });

      await middleware.handle(event);

      validateDebugLog('redirects middleware start: %o', {
        pathname: '/old-page',
        language: 'en',
        hostname: 'foo.net',
      });

      expect(fetchRedirectsStub).toHaveBeenCalledWith(siteName);
      expect(event.res.status).toBe(301);

      validateEndMessageDebugLog('redirects middleware end in %dms: %o', {
        target: '/new-page',
        redirectType: REDIRECT_TYPE_301,
      });
    });

    it('should redirect with 302 when redirect type is 302', async () => {
      const event = createMockEvent();
      const { middleware, fetchRedirectsStub } = createMiddleware({
        pattern: '/old-page',
        target: '/new-page',
        redirectType: REDIRECT_TYPE_302,
      });

      await middleware.handle(event);

      expect(fetchRedirectsStub).toHaveBeenCalledWith(siteName);
      expect(event.res.status).toBe(302);

      validateEndMessageDebugLog('redirects middleware end in %dms: %o', {
        target: '/new-page',
        redirectType: REDIRECT_TYPE_302,
      });
    });

    it('should rewrite when redirect type is SERVER_TRANSFER', async () => {
      const event = createMockEvent();
      const { middleware } = createMiddleware({
        pattern: '/old-page',
        target: '/new-page',
        redirectType: REDIRECT_TYPE_SERVER_TRANSFER,
        isLanguagePreserved: false,
      });

      await middleware.handle(event);

      expect(event.res.headers.get('x-sc-rewrite')).toBe('/new-page');

      validateEndMessageDebugLog('redirects middleware end in %dms: %o', {
        target: '/new-page',
        redirectType: REDIRECT_TYPE_SERVER_TRANSFER,
      });
    });

    it('should preserve query string when isQueryStringPreserved is true', async () => {
      const event = createMockEvent({}, {}, '/old-page?param1=value1&param2=value2');
      const { middleware } = createMiddleware({
        pattern: '/old-page',
        target: '/new-page',
        redirectType: REDIRECT_TYPE_301,
        isQueryStringPreserved: true,
      });

      await middleware.handle(event);

      expect(event.res.headers.get('location')).toContain('param1=value1');
      expect(event.res.headers.get('location')).toContain('param2=value2');
    });

    it('should not preserve query string when isQueryStringPreserved is false', async () => {
      const event = createMockEvent({}, {}, '/old-page?param1=value1&param2=value2');
      const { middleware } = createMiddleware({
        pattern: '/old-page',
        target: '/new-page',
        redirectType: REDIRECT_TYPE_301,
        isQueryStringPreserved: false,
      });

      await middleware.handle(event);

      const location = event.res.headers.get('location') as string;
      expect(location).toContain('/new-page');
      expect(location).not.toContain('param1');
      expect(location).not.toContain('param2');
    });

    it('should handle absolute URL targets', async () => {
      const event = createMockEvent();
      const { middleware } = createMiddleware({
        pattern: '/old-page',
        target: 'https://example.com/new-page',
        redirectType: REDIRECT_TYPE_301,
      });

      await middleware.handle(event);

      const location = event.res.headers.get('location') as string;
      expect(location).toContain('https://example.com/new-page');
    });

    it('should handle regex patterns with capture groups', async () => {
      const event = createMockEvent({}, {}, '/old-page/123');
      const { middleware } = createMiddleware({
        pattern: '/old-page/(\\d+)',
        target: '/new-page/$1',
        redirectType: REDIRECT_TYPE_301,
      });

      await middleware.handle(event);

      const location = event.res.headers.get('location') as string;
      expect(location).toContain('/new-page/123');
    });

    it('should replace $siteLang token in target', async () => {
      const event = createMockEvent({}, {}, '/old-page', { 'x-sc-locale': 'da' });
      const { middleware } = createMiddleware({
        pattern: '/old-page',
        target: '/$siteLang/new-page',
        redirectType: REDIRECT_TYPE_301,
        locale: 'da',
      });

      await middleware.handle(event);

      const location = event.res.headers.get('location') as string;
      expect(location).toContain('/da/new-page');
    });

    it('should handle multiple redirect rules', async () => {
      const event = createMockEvent({}, {}, '/old-page-2');
      const { middleware, fetchRedirectsStub } = createMiddleware({
        redirectMaps: [
          { pattern: '/old-page-1', target: '/new-page-1', redirectType: REDIRECT_TYPE_301 },
          { pattern: '/old-page-2', target: '/new-page-2', redirectType: REDIRECT_TYPE_302 },
        ],
      });

      await middleware.handle(event);

      expect(fetchRedirectsStub).toHaveBeenCalledWith(siteName);
      expect(event.res.status).toBe(302);
      expect(event.res.headers.get('location')).toContain('/new-page-2');
    });

    it('should use fallback hostname when host header is missing', async () => {
      const event = createMockEvent({ host: '' });
      const { middleware } = createMiddleware({
        redirectsMiddlewareConfig: { ...defaultConfig, defaultHostname: 'bar.net' },
        pattern: '/old-page',
        target: '/new-page',
        redirectType: REDIRECT_TYPE_301,
      });

      await middleware.handle(event);

      validateDebugLog('redirects middleware start: %o', {
        pathname: '/old-page',
        language: 'en',
        hostname: 'bar.net',
      });

      expect(event.res.status).toBe(301);
    });

    it('should preserve site prefix from x-sc-rewrite on server transfer', async () => {
      const event = createMockEvent({}, {}, '/old-page', { 'x-sc-rewrite': '/foo/en/old-page' });
      const { middleware } = createMiddleware({
        pattern: '/old-page',
        target: '/en/new-page',
        redirectType: REDIRECT_TYPE_SERVER_TRANSFER,
        isLanguagePreserved: true,
      });

      await middleware.handle(event);

      expect(event.res.headers.get('x-sc-rewrite')).toContain('/foo/en/new-page');
    });
  });

  describe('error handling', () => {
    let errorSpy: ReturnType<typeof vi.spyOn>;

    beforeAll(() => {
      errorSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    beforeEach(() => {
      errorSpy.mockClear();
    });

    afterAll(() => {
      errorSpy.mockRestore();
    });

    it('should handle error when fetchRedirects throws', async () => {
      const error = new Error('Custom error');
      const event = createMockEvent();
      const fetchRedirectsWithError = vi.fn().mockImplementation(() => {
        throw error;
      });

      const { middleware, fetchRedirectsStub } = createMiddleware({
        fetchRedirectsStub: fetchRedirectsWithError,
      });

      await middleware.handle(event);

      expect(fetchRedirectsStub).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenNthCalledWith(1, 'Redirects middleware failed:');
      expect(errorSpy).toHaveBeenNthCalledWith(2, error);
    });
  });

  describe('configuration - API config required', () => {
    it('gracefully disables when API config is missing', () => {
      const middleware = new RedirectsMiddleware({
        enabled: true,
        locales: ['en'],
        sites: [],
      } as any);

      expect(middleware).not.toBeUndefined();
      expect(middleware['redirectsService']).toBeNull();
    });

    it('skips execution when redirectsService is null', async () => {
      const event = createMockEvent();
      const middleware = new RedirectsMiddleware({
        enabled: true,
        locales: ['en'],
        sites: [],
      } as any);

      await middleware.handle(event);

      validateDebugLog('skipped (redirects service not configured - API config required)');
    });

    it('works normally when Edge config is provided', () => {
      const middleware = new RedirectsMiddleware({
        enabled: true,
        contextId: 'edge-context-id',
        clientContextId: 'edge-client-id',
        edgeUrl: 'https://edge.url',
        locales: ['en'],
        sites: [],
      } as any);

      expect(middleware).not.toBeUndefined();
      expect(middleware['redirectsService']).not.toBeNull();
    });

    it('works normally when local API config is provided', () => {
      const middleware = new RedirectsMiddleware({
        enabled: true,
        apiHost: 'https://api.example.com',
        apiKey: 'api-key',
        locales: ['en'],
        sites: [],
      } as any);

      expect(middleware).not.toBeUndefined();
      expect(middleware['redirectsService']).not.toBeNull();
    });
  });
});
