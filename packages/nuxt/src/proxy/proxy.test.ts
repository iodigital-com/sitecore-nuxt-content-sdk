import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import { createEvent, H3Event } from 'h3';
import { IncomingMessage, ServerResponse } from 'http';
import { ProxyBase, REWRITE_HEADER_NAME } from './proxy';
import { SiteResolver } from '@sitecore-content-sdk/content/site';
import { PreviewCookies } from '../editing/utils';

chai.use(sinonChai);
const expect = chai.expect;

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

describe('ProxyBase', () => {
  class SampleProxy extends ProxyBase {
    handle(): Promise<void> {
      return Promise.resolve();
    }
  }

  describe('defaultHostname', () => {
    it('should set default hostname', () => {
      const proxy = new SampleProxy({ sites: [] });
      expect(proxy.defaultHostname).to.equal('localhost');
    });

    it('should set custom hostname', () => {
      const proxy = new SampleProxy({ sites: [], defaultHostname: 'foo' });
      expect(proxy.defaultHostname).to.equal('foo');
    });
  });

  describe('isPreview', () => {
    it('should return true when preview cookie is provided', () => {
      const proxy = new SampleProxy({ sites: [] });
      const event = createMockEvent({}, { [PreviewCookies.PREVIEW]: 'true' });
      expect(proxy.isPreview(event)).to.equal(true);
    });

    it('should return false when preview cookie is not provided', () => {
      const proxy = new SampleProxy({ sites: [] });
      const event = createMockEvent();
      expect(proxy.isPreview(event)).to.equal(false);
    });
  });

  describe('isPrefetch', () => {
    it('should return true when purpose header is prefetch', () => {
      const proxy = new SampleProxy({ sites: [] });
      const event = createMockEvent({ purpose: 'prefetch' });
      expect(proxy.isPrefetch(event)).to.equal(true);
    });

    it('should return false when required header is not provided', () => {
      const proxy = new SampleProxy({ sites: [] });
      const event = createMockEvent();
      expect(proxy.isPrefetch(event)).to.equal(false);
    });

    it('should return false for known device with navigate fetch mode', () => {
      const proxy = new SampleProxy({ sites: [] });
      const event = createMockEvent({
        'sec-fetch-mode': 'navigate',
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X)',
      });
      expect(proxy.isPrefetch(event)).to.equal(false);
    });
  });

  describe('disabled', () => {
    it('should return true for /api/ path', () => {
      const proxy = new SampleProxy({ sites: [] });
      const event = createMockEvent({ host: 'localhost' }, {}, '/api/layout/render');
      expect(proxy.disabled(event)).to.equal(true);
    });

    it('should return true for /sitecore/ path', () => {
      const proxy = new SampleProxy({ sites: [] });
      const event = createMockEvent({ host: 'localhost' }, {}, '/sitecore/render');
      expect(proxy.disabled(event)).to.equal(true);
    });

    it('should return true for /_nuxt path', () => {
      const proxy = new SampleProxy({ sites: [] });
      const event = createMockEvent({ host: 'localhost' }, {}, '/_nuxt/webpack');
      expect(proxy.disabled(event)).to.equal(true);
    });

    it('should return false for regular path', () => {
      const proxy = new SampleProxy({ sites: [] });
      const event = createMockEvent({ host: 'localhost' }, {}, '/about');
      expect(proxy.disabled(event)).to.equal(false);
    });

    it('should use custom skip function', () => {
      const proxy = new SampleProxy({
        sites: [],
        skip: (event: H3Event) => event.path === '/foo',
      });

      const eventFoo = createMockEvent({ host: 'localhost' }, {}, '/foo');
      expect(proxy.disabled(eventFoo)).to.equal(true);

      const eventBar = createMockEvent({ host: 'localhost' }, {}, '/bar');
      expect(proxy.disabled(eventBar)).to.equal(false);
    });
  });

  describe('getHostHeader', () => {
    it('should return undefined when header is not present', () => {
      const proxy = new SampleProxy({ sites: [] });
      const event = createMockEvent();
      expect(proxy.getHostHeader(event)).to.equal(undefined);
    });

    it('should return host header without port', () => {
      const proxy = new SampleProxy({ sites: [] });
      const event = createMockEvent({ host: 'bar.net:9999' });
      expect(proxy.getHostHeader(event)).to.equal('bar.net');
    });

    it('should return x-forwarded-host header when present', () => {
      const proxy = new SampleProxy({ sites: [] });
      const event = createMockEvent({
        'x-forwarded-host': 'proxy.forwarded.com',
        host: 'localhost:3000',
      });
      expect(proxy.getHostHeader(event)).to.equal('proxy.forwarded.com');
    });
  });

  describe('getLanguage', () => {
    it('should use fallback language from config when present', () => {
      const proxy = new SampleProxy({ sites: [], defaultLanguage: 'es-ES' });
      const event = createMockEvent();
      expect(proxy.getLanguage(event)).to.equal('es-ES');
    });

    it('should return fallback language', () => {
      const proxy = new SampleProxy({ sites: [] });
      const event = createMockEvent();
      expect(proxy.getLanguage(event)).to.equal('en');
    });

    it('should return language from x-sc-locale response header if present', () => {
      const proxy = new SampleProxy({ sites: [] });
      const event = createMockEvent();
      event.node.res.setHeader('x-sc-locale', 'de-DE');
      expect(proxy.getLanguage(event)).to.equal('de-DE');
    });
  });

  describe('getSite', () => {
    it('should get site by name when site cookie is provided', () => {
      const proxy = new SampleProxy({ sites: [] });
      proxy.siteResolver = new MockSiteResolver([]);
      const event = createMockEvent({}, { sc_site: 'xxx' });

      expect(proxy.getSite(event).name).to.equal('xxx');
      expect(proxy.siteResolver.getByName).to.be.calledWith('xxx');
    });

    it('should return default site info when site cookie is provided but site not found', () => {
      class NotFoundSiteResolver extends SiteResolver {
        getByName = sinon.stub().returns(undefined);
      }

      const proxy = new SampleProxy({ sites: [] });
      proxy.siteResolver = new NotFoundSiteResolver([]);
      const event = createMockEvent({}, { sc_site: 'xxx' });

      expect(proxy.getSite(event)).to.deep.equal({
        name: 'xxx',
        language: 'en',
        hostName: '*',
      });
    });

    it('should get site by host header', () => {
      const proxy = new SampleProxy({ sites: [] });
      proxy.siteResolver = new MockSiteResolver([]);
      const event = createMockEvent({ host: 'xxx.net:9999' });

      expect(proxy.getSite(event).hostName).to.equal('xxx.net');
      expect(proxy.siteResolver.getByHost).to.be.calledWith('xxx.net');
    });

    it('should get site by default host', () => {
      const proxy = new SampleProxy({ sites: [] });
      proxy.siteResolver = new MockSiteResolver([]);
      const event = createMockEvent();

      expect(proxy.getSite(event).hostName).to.equal('localhost');
      expect(proxy.siteResolver.getByHost).to.be.calledWith('localhost');
    });

    it('should get site by custom default host', () => {
      const proxy = new SampleProxy({ sites: [], defaultHostname: 'yyy.net' });
      proxy.siteResolver = new MockSiteResolver([]);
      const event = createMockEvent();

      expect(proxy.getSite(event).hostName).to.equal('yyy.net');
      expect(proxy.siteResolver.getByHost).to.be.calledWith('yyy.net');
    });
  });

  describe('rewrite', () => {
    it('should rewrite path and add header by default', () => {
      const proxy = new SampleProxy({ sites: [] });
      const event = createMockEvent({ host: 'localhost' }, {}, '/old');

      proxy.rewrite('/new', event);

      expect(event.path).to.equal('/new');
      expect(event.node.res.getHeader(REWRITE_HEADER_NAME)).to.equal('/new');
    });

    it('should rewrite path and not set header when skipHeader is true', () => {
      const proxy = new SampleProxy({ sites: [] });
      const event = createMockEvent({ host: 'localhost' }, {}, '/old');

      proxy.rewrite('/new', event, true);

      expect(event.path).to.equal('/new');
      expect(event.node.res.getHeader(REWRITE_HEADER_NAME)).to.equal(undefined);
    });
  });
});
