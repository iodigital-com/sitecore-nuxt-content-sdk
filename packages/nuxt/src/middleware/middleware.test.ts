import sinon from 'sinon';
import { describe, it, expect } from 'vitest';
import { createEvent, H3Event } from 'h3';
import { IncomingMessage, ServerResponse } from 'http';
import { MiddlewareBase, REWRITE_HEADER_NAME } from './middleware';
import { SiteResolver } from '@sitecore-content-sdk/content/site';
import { PreviewCookies } from '../utils/editing-utils';

class MockSiteResolver extends SiteResolver {
  getByName = sinon.stub().callsFake((siteName: string) => ({
    name: siteName,
    language: 'en',
    hostName: 'foo.net',
  }));

  getByHost = sinon.stub().callsFake((hostName: string) => ({
    name: 'foo',
    language: 'en',
    hostName,
  }));
}

const createMockEvent = (
  headers: Record<string, string> = {},
  cookies: Record<string, string> = {},
  path: string = '/'
): H3Event => {
  const req = new IncomingMessage(null as any);
  req.headers = headers;
  req.url = path;

  if (Object.keys(cookies).length) {
    req.headers.cookie = Object.entries(cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  const res = new ServerResponse(req);
  return createEvent(req, res);
};

describe('MiddlewareBase', () => {
  class SampleMiddleware extends MiddlewareBase {
    _defaultHostname = this.defaultHostname;

    handle(): Promise<void> {
      return Promise.resolve();
    }

    _setSiteResolver(resolver: SiteResolver) {
      this.siteResolver = resolver;
    }

    _disabled(event: H3Event): boolean {
      return this.disabled(event);
    }

    _isPreview(event: H3Event): boolean {
      return this.isPreview(event);
    }

    _isPrefetch(event: H3Event): boolean {
      return this.isPrefetch(event);
    }

    _getHostHeader(event: H3Event): string | undefined {
      return this.getHostHeader(event);
    }

    _getLanguage(event: H3Event): string {
      return this.getLanguage(event);
    }

    _getSite(event: H3Event) {
      return this.getSite(event);
    }

    _rewrite(rewritePath: string, event: H3Event, skipHeader?: boolean): void {
      this.rewrite(rewritePath, event, skipHeader);
    }
  }

  describe('defaultHostname', () => {
    it('should set default hostname', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      expect(middleware._defaultHostname).toBe('localhost');
    });

    it('should set custom hostname', () => {
      const middleware = new SampleMiddleware({ sites: [], defaultHostname: 'foo' });
      expect(middleware._defaultHostname).toBe('foo');
    });
  });

  describe('isPreview', () => {
    it('should return true when preview cookie is provided', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const event = createMockEvent({}, { [PreviewCookies.PREVIEW]: 'true' });
      expect(middleware._isPreview(event)).toBe(true);
    });

    it('should return false when preview cookie is not provided', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const event = createMockEvent();
      expect(middleware._isPreview(event)).toBe(false);
    });
  });

  describe('isPrefetch', () => {
    it('should return true when purpose header is prefetch', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const event = createMockEvent({ purpose: 'prefetch' });
      expect(middleware._isPrefetch(event)).toBe(true);
    });

    it('should return false when required header is not provided', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const event = createMockEvent();
      expect(middleware._isPrefetch(event)).toBe(false);
    });

    it('should return false for known device with navigate fetch mode', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const event = createMockEvent({
        'sec-fetch-mode': 'navigate',
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X)',
      });
      expect(middleware._isPrefetch(event)).toBe(false);
    });
  });

  describe('disabled', () => {
    it('should return true for /api/ path', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const event = createMockEvent({ host: 'localhost' }, {}, '/api/layout/render');
      expect(middleware._disabled(event)).toBe(true);
    });

    it('should return true for /sitecore/ path', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const event = createMockEvent({ host: 'localhost' }, {}, '/sitecore/render');
      expect(middleware._disabled(event)).toBe(true);
    });

    it('should return true for /_nuxt path', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const event = createMockEvent({ host: 'localhost' }, {}, '/_nuxt/webpack');
      expect(middleware._disabled(event)).toBe(true);
    });

    it('should return false for regular path', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const event = createMockEvent({ host: 'localhost' }, {}, '/about');
      expect(middleware._disabled(event)).toBe(false);
    });

    it('should use custom skip function', () => {
      const middleware = new SampleMiddleware({
        sites: [],
        skip: (event: H3Event) => event.path === '/foo',
      });

      const eventFoo = createMockEvent({ host: 'localhost' }, {}, '/foo');
      expect(middleware._disabled(eventFoo)).toBe(true);

      const eventBar = createMockEvent({ host: 'localhost' }, {}, '/bar');
      expect(middleware._disabled(eventBar)).toBe(false);
    });
  });

  describe('getHostHeader', () => {
    it('should return undefined when header is not present', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const event = createMockEvent();
      expect(middleware._getHostHeader(event)).toBe(undefined);
    });

    it('should return host header without port', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const event = createMockEvent({ host: 'bar.net:9999' });
      expect(middleware._getHostHeader(event)).toBe('bar.net');
    });

    it('should return x-forwarded-host header when present', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const event = createMockEvent({
        'x-forwarded-host': 'middleware.forwarded.com',
        host: 'localhost:3000',
      });
      expect(middleware._getHostHeader(event)).toBe('middleware.forwarded.com');
    });
  });

  describe('getLanguage', () => {
    it('should use fallback language from config when present', () => {
      const middleware = new SampleMiddleware({ sites: [], defaultLanguage: 'es-ES' });
      const event = createMockEvent();
      expect(middleware._getLanguage(event)).toBe('es-ES');
    });

    it('should return fallback language', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const event = createMockEvent();
      expect(middleware._getLanguage(event)).toBe('en');
    });

    it('should return language from x-sc-locale response header if present', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const event = createMockEvent();
      event.node.res.setHeader('x-sc-locale', 'de-DE');
      expect(middleware._getLanguage(event)).toBe('de-DE');
    });
  });

  describe('getSite', () => {
    it('should get site by name when site cookie is provided', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const resolver = new MockSiteResolver([]);
      middleware._setSiteResolver(resolver);
      const event = createMockEvent({}, { sc_site: 'xxx' });

      expect(middleware._getSite(event).name).toBe('xxx');
      sinon.assert.calledWith(resolver.getByName, 'xxx');
    });

    it('should return default site info when site cookie is provided but site not found', () => {
      class NotFoundSiteResolver extends SiteResolver {
        getByName = sinon.stub().returns(undefined);
      }

      const middleware = new SampleMiddleware({ sites: [] });
      const resolver = new NotFoundSiteResolver([]);
      middleware._setSiteResolver(resolver);
      const event = createMockEvent({}, { sc_site: 'xxx' });

      expect(middleware._getSite(event)).toEqual({
        name: 'xxx',
        language: 'en',
        hostName: '*',
      });
    });

    it('should get site by host header', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const resolver = new MockSiteResolver([]);
      middleware._setSiteResolver(resolver);
      const event = createMockEvent({ host: 'xxx.net:9999' });

      expect(middleware._getSite(event).hostName).toBe('xxx.net');
      sinon.assert.calledWith(resolver.getByHost, 'xxx.net');
    });

    it('should get site by default host', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const resolver = new MockSiteResolver([]);
      middleware._setSiteResolver(resolver);
      const event = createMockEvent();

      expect(middleware._getSite(event).hostName).toBe('localhost');
      sinon.assert.calledWith(resolver.getByHost, 'localhost');
    });

    it('should get site by custom default host', () => {
      const middleware = new SampleMiddleware({ sites: [], defaultHostname: 'yyy.net' });
      const resolver = new MockSiteResolver([]);
      middleware._setSiteResolver(resolver);
      const event = createMockEvent();

      expect(middleware._getSite(event).hostName).toBe('yyy.net');
      sinon.assert.calledWith(resolver.getByHost, 'yyy.net');
    });
  });

  describe('rewrite', () => {
    it('should rewrite path and add header by default', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const event = createMockEvent({ host: 'localhost' }, {}, '/old');

      middleware._rewrite('/new', event);

      expect(event.path).toBe('/new');
      expect(event.node.res.getHeader(REWRITE_HEADER_NAME)).toBe('/new');
    });

    it('should rewrite path and not set header when skipHeader is true', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const event = createMockEvent({ host: 'localhost' }, {}, '/old');

      middleware._rewrite('/new', event, true);

      expect(event.path).toBe('/new');
      expect(event.node.res.getHeader(REWRITE_HEADER_NAME)).toBe(undefined);
    });
  });
});
