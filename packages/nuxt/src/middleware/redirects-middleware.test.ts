/* eslint-disable no-unused-expressions */
/* eslint-disable dot-notation */
import sinon, { spy } from 'sinon';
import { expect } from 'chai';
import { describe, it, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { createEvent, H3Event } from 'h3';
import { IncomingMessage, ServerResponse } from 'http';
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
  const req = new IncomingMessage(null as any);
  req.url = path;
  req.headers = {
    host: hostname,
    referer: 'http://localhost:3000',
    ...headers,
  };

  if (Object.keys(cookies).length) {
    req.headers.cookie = Object.entries(cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  const res = new ServerResponse(req);

  Object.entries(responseHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  return createEvent(req, res);
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
  fetchRedirectsStub?: sinon.SinonStub;
  getClientFactoryStub?: sinon.SinonStub;
  defaultHostname?: string;
  siteResolver?: SiteResolver;
};

const createMiddleware = (input: TestMiddlewareProps = {}) => {
  const sandbox = sinon.createSandbox();

  const props = {
    ...defaultConfig,
    ...input.redirectsMiddlewareConfig,
    ...(input.defaultHostname ? { defaultHostname: input.defaultHostname } : {}),
  };

  class MockSiteResolver extends SiteResolver {
    getByName = sandbox.stub().returns({
      name: siteName,
      language: input.locale ?? 'en',
      hostName: hostname,
    });

    getByHost = sandbox.stub().returns({
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

  const getClientFactory = input.getClientFactoryStub ?? sandbox.stub().returns(clientFactory);

  const defaultRedirects = input.redirectMaps ?? [
    {
      pattern: input.pattern ?? '/old-page',
      target: input.target ?? '/new-page',
      redirectType: input.redirectType ?? REDIRECT_TYPE_301,
      isQueryStringPreserved: input.isQueryStringPreserved ?? true,
      isLanguagePreserved: input.isLanguagePreserved ?? true,
    },
  ];

  const fetchRedirectsStub = input.fetchRedirectsStub ?? sandbox.stub().resolves(defaultRedirects);

  const mockRedirectsService = {
    fetchRedirects: fetchRedirectsStub,
  } as unknown as RedirectsService;

  const middleware = new RedirectsMiddleware({
    ...props,
    redirectsService: mockRedirectsService,
  } as RedirectsMiddlewareConfig);

  middleware['siteResolver'] = siteResolver;
  middleware['getClientFactory'] = getClientFactory;

  return { middleware, siteResolver, fetchRedirectsStub, getClientFactory, sandbox };
};

describe('RedirectsMiddleware', () => {
  const sandbox = sinon.createSandbox();
  const debugSpy = spy(debug, 'redirects');

  const validateDebugLog = (message: string, ...params: unknown[]) => {
    const foundLog = debugSpy.args.find((log) => log[0] === message);
    expect(foundLog).to.deep.equal([message, ...params]);
  };

  const validateEndMessageDebugLog = (message: string, params: unknown) => {
    const logParams = debugSpy.args.find((log) => log[0] === message) as Array<unknown>;
    expect(logParams[2]).to.deep.equal(params);
  };

  beforeEach(() => {
    debugSpy.resetHistory();
  });

  afterEach(() => {
    sandbox.restore();
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

        debugSpy.resetHistory();
      };

      it('default', async () => {
        const { middleware } = createMiddleware();
        await test('/src/image.png', middleware);
        await test('/api/layout/render', middleware);
        await test('/sitecore/render', middleware);
        await test('/_nuxt/webpack', middleware);
      });

      it('should apply both default and custom rules when custom skip function provided', async () => {
        const skip = (event: H3Event) => event.path === '/crazypath/luna';
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
        expect(event.node.res.getHeader('x-proxy-cache')).to.equal('no-cache');
        expect(event.node.res.getHeader('Cache-Control')).to.equal('no-store, must-revalidate');
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

      expect(fetchRedirectsStub.calledWith(siteName)).to.be.true;
      expect(event.node.res.statusCode).to.equal(301);

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

      expect(fetchRedirectsStub.calledWith(siteName)).to.be.true;
      expect(event.node.res.statusCode).to.equal(302);

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

      expect(event.node.req.url).to.equal('/new-page');

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

      expect(event.node.res.getHeader('location')).to.include('param1=value1');
      expect(event.node.res.getHeader('location')).to.include('param2=value2');
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

      const location = event.node.res.getHeader('location') as string;
      expect(location).to.include('/new-page');
      expect(location).to.not.include('param1');
      expect(location).to.not.include('param2');
    });

    it('should handle absolute URL targets', async () => {
      const event = createMockEvent();
      const { middleware } = createMiddleware({
        pattern: '/old-page',
        target: 'https://example.com/new-page',
        redirectType: REDIRECT_TYPE_301,
      });

      await middleware.handle(event);

      const location = event.node.res.getHeader('location') as string;
      expect(location).to.include('https://example.com/new-page');
    });

    it('should handle regex patterns with capture groups', async () => {
      const event = createMockEvent({}, {}, '/old-page/123');
      const { middleware } = createMiddleware({
        pattern: '/old-page/(\\d+)',
        target: '/new-page/$1',
        redirectType: REDIRECT_TYPE_301,
      });

      await middleware.handle(event);

      const location = event.node.res.getHeader('location') as string;
      expect(location).to.include('/new-page/123');
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

      const location = event.node.res.getHeader('location') as string;
      expect(location).to.include('/da/new-page');
    });

    it('should handle multiple redirect rules', async () => {
      const event = createMockEvent({}, {}, '/old-page-2');
      const { middleware, fetchRedirectsStub } = createMiddleware({
        redirectMaps: [
          {
            pattern: '/old-page-1',
            target: '/new-page-1',
            redirectType: REDIRECT_TYPE_301,
          },
          {
            pattern: '/old-page-2',
            target: '/new-page-2',
            redirectType: REDIRECT_TYPE_302,
          },
        ],
      });

      await middleware.handle(event);

      expect(fetchRedirectsStub.calledWith(siteName)).to.be.true;
      expect(event.node.res.statusCode).to.equal(302);
      expect(event.node.res.getHeader('location')).to.include('/new-page-2');
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

      expect(event.node.res.statusCode).to.equal(301);
    });

    it('should preserve site prefix from x-sc-rewrite on server transfer', async () => {
      const event = createMockEvent({}, {}, '/old-page', {
        'x-sc-rewrite': '/foo/en/old-page',
      });
      const { middleware } = createMiddleware({
        pattern: '/old-page',
        target: '/en/new-page',
        redirectType: REDIRECT_TYPE_SERVER_TRANSFER,
        isLanguagePreserved: true,
      });

      await middleware.handle(event);

      expect(event.node.req.url).to.include('/foo/en/new-page');
    });
  });

  describe('error handling', () => {
    let errorSpy: ReturnType<typeof spy>;

    beforeAll(() => {
      errorSpy = spy(console, 'log');
    });

    beforeEach(() => {
      errorSpy.resetHistory();
    });

    afterAll(() => {
      errorSpy.restore();
    });

    it('should handle error when fetchRedirects throws', async () => {
      const error = new Error('Custom error');
      const event = createMockEvent();
      const fetchRedirectsWithError = sandbox.stub().throws(error);

      const { middleware, fetchRedirectsStub } = createMiddleware({
        fetchRedirectsStub: fetchRedirectsWithError,
      });

      await middleware.handle(event);

      expect(fetchRedirectsStub.called).to.be.true;
      expect(errorSpy.getCall(0).calledWith('Redirects middleware failed:')).to.be.true;
      expect(errorSpy.getCall(1).calledWith(error)).to.be.true;
    });
  });

  describe('configuration - API config required', () => {
    it('gracefully disables when API config is missing', () => {
      const middleware = new RedirectsMiddleware({
        enabled: true,
        locales: ['en'],
        sites: [],
      } as any);

      expect(middleware).to.not.be.undefined;
      expect(middleware['redirectsService']).to.be.null;
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

      expect(middleware).to.not.be.undefined;
      expect(middleware['redirectsService']).to.not.be.null;
    });

    it('works normally when local API config is provided', () => {
      const middleware = new RedirectsMiddleware({
        enabled: true,
        apiHost: 'https://api.example.com',
        apiKey: 'api-key',
        locales: ['en'],
        sites: [],
      } as any);

      expect(middleware).to.not.be.undefined;
      expect(middleware['redirectsService']).to.not.be.null;
    });
  });
});
