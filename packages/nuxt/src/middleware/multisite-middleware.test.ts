/* eslint-disable no-unused-expressions */
/* eslint-disable dot-notation */
import { describe, it, beforeEach, afterEach, beforeAll, afterAll, vi, expect } from 'vitest';
import { createEvent, H3Event } from 'h3';
import { IncomingMessage, ServerResponse } from 'http';
import { MultisiteMiddleware, MultisiteMiddlewareConfig } from './multisite-middleware';
import { SiteResolver, SiteInfo } from '@sitecore-content-sdk/content/site';
import debug from '../debug';

const siteName = 'foo';

const defaultConfig: MultisiteMiddlewareConfig = {
  sites: [],
  useCookieResolution: () => false,
  defaultHostname: '',
  enabled: true,
};

const createMockEvent = (
  headers: Record<string, string> = {},
  cookies: Record<string, string> = {},
  path: string = '/styleguide',
  responseHeaders: Record<string, string> = {}
): H3Event => {
  const req = new IncomingMessage(null as any);
  req.url = path;
  req.headers = {
    host: 'foo.net',
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

const createMiddleware = (
  input: {
    config?: Partial<MultisiteMiddlewareConfig>;
    language?: string;
    hostName?: string;
    siteResolver?: SiteResolver;
  } = {}
) => {
  const props = { ...defaultConfig, ...(input.config ?? {}) };

  class MockSiteResolver extends SiteResolver {
    getByName = vi.fn().mockReturnValue({
      name: siteName,
      language: input.language ?? '',
      hostName: input.hostName,
    });

    getByHost = vi.fn().mockReturnValue({
      name: siteName,
      language: input.language ?? '',
      hostName: input.hostName,
    });
  }

  const siteResolver = input.siteResolver ?? new MockSiteResolver([]);
  const middleware = new MultisiteMiddleware(props as MultisiteMiddlewareConfig);
  middleware['siteResolver'] = siteResolver;

  return { middleware, siteResolver };
};

describe('MultisiteMiddleware', () => {
  let debugSpy: ReturnType<typeof vi.spyOn>;

  const validateDebugLog = (message: string, ...params: unknown[]) =>
    expect(debugSpy.mock.calls.find((log: unknown[]) => log[0] === message)).toEqual([
      message,
      ...params,
    ]);

  const validateEndMessageDebugLog = (message: string, params: unknown) => {
    const logParams = debugSpy.mock.calls.find(
      (log: unknown[]) => log[0] === message
    ) as Array<unknown>;
    expect(logParams[2]).toEqual(params);
  };

  beforeEach(() => {
    debugSpy = vi.spyOn(debug, 'multisite').mockImplementation(() => {});
  });

  afterEach(() => {
    debugSpy.mockRestore();
  });

  describe('request skipped', () => {
    describe('disabled / skip', () => {
      const test = async (pathname: string, middleware: MultisiteMiddleware) => {
        const event = createMockEvent({}, {}, pathname);

        await middleware.handle(event);

        validateDebugLog('multisite middleware start: %o', {
          pathname,
          language: 'en',
          hostname: 'foo.net',
        });
        validateDebugLog('skipped (multisite middleware is disabled)');

        expect(event.node.req.url).toBe(pathname);

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
        const skip = (event: H3Event) => event.path === '/crazypath/luna';
        const { middleware } = createMiddleware({ config: { ...defaultConfig, skip } });
        await test('/src/image.png', middleware);
        await test('/api/layout/render', middleware);
        await test('/sitecore/render', middleware);
        await test('/_nuxt/webpack', middleware);
        await test('/crazypath/luna', middleware);
      });
    });

    describe('Sitecore Preview', () => {
      it('request is passed when sc_preview cookie is present', async () => {
        const event = createMockEvent({}, { sc_site: 'foobar', sc_preview: 'true' });
        const { middleware, siteResolver } = createMiddleware({
          config: { ...defaultConfig, useCookieResolution: () => true },
        });

        vi.spyOn(middleware as any, 'getSite').mockReturnValue({
          name: 'foobar',
          language: 'en',
          hostName: 'foo.net',
        });

        await middleware.handle(event);

        validateDebugLog('multisite middleware start: %o', {
          pathname: '/styleguide',
          language: 'en',
          hostname: 'foo.net',
        });

        validateEndMessageDebugLog('multisite middleware end in %dms: %o', {
          rewritePath: '/foobar/styleguide',
          siteName: 'foobar',
        });

        expect(event.node.req.url).toBe('/foobar/styleguide');
        expect((siteResolver.getByHost as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(0);
        expect((siteResolver.getByName as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(0);
      });
    });
  });

  describe('request passed', () => {
    it('fallback hostname is used', async () => {
      const event = createMockEvent({ host: '' });
      const { middleware, siteResolver } = createMiddleware({
        config: { ...defaultConfig, defaultHostname: 'bar.net' },
      });

      await middleware.handle(event);

      validateDebugLog('multisite middleware start: %o', {
        pathname: '/styleguide',
        language: 'en',
        hostname: 'bar.net',
      });

      validateEndMessageDebugLog('multisite middleware end in %dms: %o', {
        rewritePath: '/foo/styleguide',
        siteName,
      });

      expect(event.node.req.url).toBe('/foo/styleguide');
      expect((siteResolver.getByHost as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe('bar.net');
    });

    it('request pathname is used', async () => {
      const event = createMockEvent({}, {}, '/styleguide/foo');
      const { middleware, siteResolver } = createMiddleware();

      await middleware.handle(event);

      validateDebugLog('multisite middleware start: %o', {
        pathname: '/styleguide/foo',
        language: 'en',
        hostname: 'foo.net',
      });

      validateEndMessageDebugLog('multisite middleware end in %dms: %o', {
        rewritePath: '/foo/styleguide/foo',
        siteName,
      });

      expect(event.node.req.url).toBe('/foo/styleguide/foo');
      expect((siteResolver.getByHost as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe('foo.net');
    });

    it('rewritten pathname from response header is used when present', async () => {
      const event = createMockEvent({}, {}, '/styleguide/foo', {
        'x-sc-rewrite': '/en/some/otherpath',
      });
      const { middleware, siteResolver } = createMiddleware();

      await middleware.handle(event);

      validateDebugLog('multisite middleware start: %o', {
        pathname: '/en/some/otherpath',
        language: 'en',
        hostname: 'foo.net',
      });

      validateEndMessageDebugLog('multisite middleware end in %dms: %o', {
        rewritePath: '/foo/en/some/otherpath',
        siteName,
      });

      expect(event.node.req.url).toBe('/foo/en/some/otherpath');
      expect((siteResolver.getByHost as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe('foo.net');
    });

    it('fallback default hostname is used', async () => {
      const event = createMockEvent({ host: '' });
      const { middleware, siteResolver } = createMiddleware();

      await middleware.handle(event);

      validateDebugLog('multisite middleware start: %o', {
        pathname: '/styleguide',
        language: 'en',
        hostname: 'localhost',
      });

      validateEndMessageDebugLog('multisite middleware end in %dms: %o', {
        rewritePath: '/foo/styleguide',
        siteName,
      });

      expect(event.node.req.url).toBe('/foo/styleguide');
      expect((siteResolver.getByHost as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe(
        'localhost'
      );
    });

    it('host header is used', async () => {
      const event = createMockEvent();
      const { middleware, siteResolver } = createMiddleware();

      await middleware.handle(event);

      validateDebugLog('multisite middleware start: %o', {
        pathname: '/styleguide',
        language: 'en',
        hostname: 'foo.net',
      });

      validateEndMessageDebugLog('multisite middleware end in %dms: %o', {
        rewritePath: '/foo/styleguide',
        siteName,
      });

      expect(event.node.req.url).toBe('/foo/styleguide');
      expect((siteResolver.getByHost as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe('foo.net');
    });

    it('sc_site querystring parameter is provided', async () => {
      const event = createMockEvent({}, {}, '/styleguide?sc_site=qsFoo');
      const { middleware, siteResolver } = createMiddleware({
        config: { ...defaultConfig, useCookieResolution: () => true },
      });

      await middleware.handle(event);

      validateDebugLog('multisite middleware start: %o', {
        pathname: '/styleguide',
        language: 'en',
        hostname: 'foo.net',
      });

      validateEndMessageDebugLog('multisite middleware end in %dms: %o', {
        rewritePath: '/qsFoo/styleguide',
        siteName: 'qsFoo',
      });

      expect(event.node.req.url).toBe('/qsFoo/styleguide');
      expect((siteResolver.getByHost as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(0);
      expect((siteResolver.getByName as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(0);
    });

    it('site querystring parameter is provided', async () => {
      const event = createMockEvent({}, {}, '/styleguide?site=qsFoo');
      const { middleware, siteResolver } = createMiddleware({
        config: { ...defaultConfig, useCookieResolution: () => true },
      });

      await middleware.handle(event);

      validateDebugLog('multisite middleware start: %o', {
        pathname: '/styleguide',
        language: 'en',
        hostname: 'foo.net',
      });

      validateEndMessageDebugLog('multisite middleware end in %dms: %o', {
        rewritePath: '/qsFoo/styleguide',
        siteName: 'qsFoo',
      });

      expect(event.node.req.url).toBe('/qsFoo/styleguide');
      expect((siteResolver.getByHost as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(0);
      expect((siteResolver.getByName as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(0);
    });

    it('sc_site cookie is provided and its usage enabled', async () => {
      const event = createMockEvent({}, { sc_site: 'foobar' });
      const { middleware, siteResolver } = createMiddleware({
        config: { ...defaultConfig, useCookieResolution: () => true },
      });

      vi.spyOn(middleware as any, 'getSite').mockReturnValue({
        name: 'foobar',
        language: 'en',
        hostName: 'foo.net',
      });

      await middleware.handle(event);

      validateDebugLog('multisite middleware start: %o', {
        pathname: '/styleguide',
        language: 'en',
        hostname: 'foo.net',
      });

      validateEndMessageDebugLog('multisite middleware end in %dms: %o', {
        rewritePath: '/foobar/styleguide',
        siteName: 'foobar',
      });

      expect(event.node.req.url).toBe('/foobar/styleguide');
      expect((siteResolver.getByHost as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(0);
      expect((siteResolver.getByName as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(0);
    });

    it('sc_site cookie is provided and its usage disabled', async () => {
      const event = createMockEvent({}, { sc_site: 'foobar' });
      const { middleware, siteResolver } = createMiddleware();

      await middleware.handle(event);

      validateDebugLog('multisite middleware start: %o', {
        pathname: '/styleguide',
        language: 'en',
        hostname: 'foo.net',
      });

      validateEndMessageDebugLog('multisite middleware end in %dms: %o', {
        rewritePath: '/foo/styleguide',
        siteName,
      });

      expect(event.node.req.url).toBe('/foo/styleguide');
      expect((siteResolver.getByHost as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe('foo.net');
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

    it('should handle error', async () => {
      const error = new Error('Custom error');
      const event = createMockEvent();

      class SampleSiteResolver extends SiteResolver {
        constructor(sites: SiteInfo[]) {
          super(sites);
        }

        getByHost = () => {
          throw error;
        };
      }

      const { middleware } = createMiddleware({
        siteResolver: new SampleSiteResolver([]),
      });

      await middleware.handle(event);

      expect(errorSpy).toHaveBeenNthCalledWith(1, 'Multisite middleware failed:');
      expect(errorSpy).toHaveBeenNthCalledWith(2, error);
    });
  });
});
