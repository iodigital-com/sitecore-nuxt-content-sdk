/* eslint-disable no-unused-expressions */
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import { createEvent, H3Event } from 'h3';
import { IncomingMessage, ServerResponse } from 'http';
import { LocaleMiddleware, LocaleMiddlewareConfig } from './locale-middleware';
import { LOCALE_HEADER_NAME } from './middleware';
import debug from '../debug';

const defaultConfig: LocaleMiddlewareConfig = {
  locales: ['en', 'de-DE'],
  sites: [],
};

const createMockEvent = (
  headers: Record<string, string> = {},
  path: string = '/styleguide'
): H3Event => {
  const req = new IncomingMessage(null as any);
  req.url = path;
  req.headers = {
    host: 'foo.net',
    ...headers,
  };

  const res = new ServerResponse(req);
  return createEvent(req, res);
};

const createMiddleware = (config: Partial<LocaleMiddlewareConfig> = {}) => {
  const middleware = new LocaleMiddleware({ ...defaultConfig, ...config });
  return { middleware };
};

describe('LocaleMiddleware', () => {
  let debugSpy: ReturnType<typeof vi.spyOn>;

  const validateDebugLog = (message: string, ...params: unknown[]) => {
    expect(debugSpy.mock.calls.find((log: unknown[]) => log[0] === message)).toEqual([
      message,
      ...params,
    ]);
  };

  beforeEach(() => {
    debugSpy = vi.spyOn(debug, 'locale').mockImplementation(() => {});
  });

  afterEach(() => {
    debugSpy.mockRestore();
  });

  describe('disabled / skip', () => {
    const test = async (pathname: string, middleware: LocaleMiddleware) => {
      const event = createMockEvent({}, pathname);

      await middleware.handle(event);

      validateDebugLog('locale middleware start: %o', {
        pathname,
        locale: 'en',
      });
      validateDebugLog('skipped (locale middleware is disabled)');
      expect(event.node.res.getHeader(LOCALE_HEADER_NAME)).toBeUndefined();

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
      const { middleware } = createMiddleware({ skip });
      await test('/src/image.png', middleware);
      await test('/api/layout/render', middleware);
      await test('/sitecore/render', middleware);
      await test('/_nuxt/webpack', middleware);
      await test('/crazypath/luna', middleware);
    });
  });

  describe('request passed', () => {
    it('should set locale header when locale is found in path', async () => {
      const event = createMockEvent({}, '/de-DE/about');
      const { middleware } = createMiddleware();

      await middleware.handle(event);

      validateDebugLog('locale middleware start: %o', {
        pathname: '/de-DE/about',
        locale: 'de-DE',
      });
      validateDebugLog('locale middleware end: %o', {
        pathname: '/de-DE/about',
        locale: 'de-DE',
      });

      expect(event.node.res.getHeader(LOCALE_HEADER_NAME)).toBe('de-DE');
    });

    it('should set locale header with fallback to en when locale is not in path', async () => {
      const event = createMockEvent({}, '/about');
      const { middleware } = createMiddleware();

      await middleware.handle(event);

      validateDebugLog('locale middleware start: %o', {
        pathname: '/about',
        locale: 'en',
      });
      validateDebugLog('locale middleware end: %o', {
        pathname: '/about',
        locale: 'en',
      });

      expect(event.node.res.getHeader(LOCALE_HEADER_NAME)).toBe('en');
    });

    it('should set locale header with defaultLanguage when locale is not in path', async () => {
      const event = createMockEvent({}, '/about');
      const { middleware } = createMiddleware({ defaultLanguage: 'de-DE' });

      await middleware.handle(event);

      validateDebugLog('locale middleware start: %o', {
        pathname: '/about',
        locale: 'de-DE',
      });
      validateDebugLog('locale middleware end: %o', {
        pathname: '/about',
        locale: 'de-DE',
      });

      expect(event.node.res.getHeader(LOCALE_HEADER_NAME)).toBe('de-DE');
    });

    it('should match locale at end of path', async () => {
      const event = createMockEvent({}, '/en');
      const { middleware } = createMiddleware();

      await middleware.handle(event);

      expect(event.node.res.getHeader(LOCALE_HEADER_NAME)).toBe('en');
    });
  });

  describe('error handling', () => {
    it('should log error and not throw when an error occurs', async () => {
      const event = createMockEvent({}, '/about');
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { middleware } = createMiddleware();

      vi.spyOn(middleware as any, 'getLocaleFromPath').mockImplementation(() => {
        throw new Error('Unexpected failure');
      });

      await middleware.handle(event);

      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 'Locale middleware failed:');
    });
  });
});
