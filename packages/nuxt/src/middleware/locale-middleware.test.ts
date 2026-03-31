/* eslint-disable no-unused-expressions */
import sinon, { spy } from 'sinon';
import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'vitest';
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
  const sandbox = sinon.createSandbox();
  const debugSpy = spy(debug, 'locale');

  const validateDebugLog = (message: string, ...params: unknown[]) => {
    expect(debugSpy.args.find((log) => log[0] === message)).to.deep.equal([message, ...params]);
  };

  beforeEach(() => {
    debugSpy.resetHistory();
  });

  afterEach(() => {
    sandbox.restore();
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
      expect(event.node.res.getHeader(LOCALE_HEADER_NAME)).to.be.undefined;

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

      expect(event.node.res.getHeader(LOCALE_HEADER_NAME)).to.equal('de-DE');
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

      expect(event.node.res.getHeader(LOCALE_HEADER_NAME)).to.equal('en');
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

      expect(event.node.res.getHeader(LOCALE_HEADER_NAME)).to.equal('de-DE');
    });

    it('should match locale at end of path', async () => {
      const event = createMockEvent({}, '/en');
      const { middleware } = createMiddleware();

      await middleware.handle(event);

      expect(event.node.res.getHeader(LOCALE_HEADER_NAME)).to.equal('en');
    });
  });

  describe('error handling', () => {
    it('should log error and not throw when an error occurs', async () => {
      const event = createMockEvent({}, '/about');
      const consoleLogStub = sandbox.stub(console, 'log');
      const { middleware } = createMiddleware();

      sandbox.stub(middleware as any, 'getLocaleFromPath').throws(new Error('Unexpected failure'));

      await middleware.handle(event);

      expect(consoleLogStub.getCall(0).calledWith('Locale middleware failed:')).to.be.true;
    });
  });
});
