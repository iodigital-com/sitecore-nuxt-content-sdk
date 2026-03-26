/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import { createEvent } from 'h3';
import { IncomingMessage, ServerResponse } from 'http';
import { SitecoreClient } from '@sitecore-content-sdk/content/client';
import { SiteInfo } from '@sitecore-content-sdk/content/site';
import { constants } from '@sitecore-content-sdk/core';

const { ERROR_MESSAGES } = constants;

chai.use(sinonChai);

const createMockEvent = (headers: Record<string, string> = {}, path: string = '/') => {
  const req = new IncomingMessage(null as any);
  req.headers = headers;
  req.url = path;
  const res = new ServerResponse(req);
  return createEvent(req, res);
};

const readBody = (event: ReturnType<typeof createMockEvent>): Promise<string> => {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];

    event.node.res.write = (chunk: any) => {
      chunks.push(Buffer.from(chunk));
      return true;
    };

    event.node.res.end = (chunk?: any) => {
      if (chunk) chunks.push(Buffer.from(chunk));
      resolve(Buffer.concat(chunks).toString());
      return event.node.res;
    };
  });
};

describe('createSitemapRoute', () => {
  const sandbox = sinon.createSandbox();
  let sitecoreClientStub: sinon.SinonStubbedInstance<SitecoreClient>;
  let sitemapRouteModule: any;
  let defineCachedFunctionStub: sinon.SinonStub;
  let siteResolverStub: { getByHost: sinon.SinonStub; getByName: sinon.SinonStub };
  let route: any;

  const sites: SiteInfo[] = [
    { name: 'test-site', hostName: 'example.com', language: 'en' },
    { name: 'test-site-two', hostName: '*', language: 'da' },
  ];

  beforeEach(() => {
    sitecoreClientStub = sandbox.createStubInstance(SitecoreClient);
    siteResolverStub = {
      getByHost: sandbox.stub(),
      getByName: sandbox.stub(),
    };

    siteResolverStub.getByHost.callsFake(
      (hostName: string) => sites.find((site) => site.hostName === hostName) || sites[1]
    );

    defineCachedFunctionStub = sandbox.stub().callsFake((fn) => fn);

    sitemapRouteModule = proxyquire('./sitemap-route', {
      'nitro/cache': { defineCachedFunction: defineCachedFunctionStub },
      '@sitecore-content-sdk/content/site': {
        SiteResolver: sandbox.stub().returns(siteResolverStub),
      },
    });

    route = sitemapRouteModule.createSitemapRoute({
      client: sitecoreClientStub as unknown as SitecoreClient,
      sites,
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('handle', () => {
    it('should process sitemap request without id parameter', async () => {
      const xmlContent = '<sitemapindex>...</sitemapindex>';
      sitecoreClientStub.getSiteMap.resolves(xmlContent);

      const event = createMockEvent(
        { host: 'example.com', 'x-forwarded-proto': 'https' },
        '/sitemap.xml'
      );
      const bodyPromise = readBody(event);

      await route.handle(event);
      const body = await bodyPromise;

      expect(sitecoreClientStub.getSiteMap).to.have.been.calledOnce;
      expect(sitecoreClientStub.getSiteMap.firstCall.args[0]).to.deep.include({
        reqHost: 'example.com',
        reqProtocol: 'https',
        id: '',
        siteName: 'test-site',
      });
      expect(event.node.res.getHeader('Content-Type')).to.equal('text/xml;charset=utf-8');
      expect(body).to.equal(xmlContent);
    });

    it('should handle sitemap request with specific id parameter', async () => {
      const sitemapId = '1';
      const xmlContent = '<urlset>...</urlset>';
      sitecoreClientStub.getSiteMap.resolves(xmlContent);

      const event = createMockEvent(
        { host: 'example.com', 'x-forwarded-proto': 'https' },
        `/sitemap-${sitemapId}.xml`
      );
      const bodyPromise = readBody(event);

      await route.handle(event);
      const body = await bodyPromise;

      expect(sitecoreClientStub.getSiteMap.firstCall.args[0]).to.deep.include({
        reqHost: 'example.com',
        reqProtocol: 'https',
        id: sitemapId,
        siteName: 'test-site',
      });
      expect(body).to.equal(xmlContent);
    });

    it('should default to https protocol when x-forwarded-proto header is missing', async () => {
      const xmlContent = '<sitemapindex>...</sitemapindex>';
      sitecoreClientStub.getSiteMap.resolves(xmlContent);

      const event = createMockEvent({ host: 'example.com' }, '/sitemap.xml');
      const bodyPromise = readBody(event);

      await route.handle(event);
      await bodyPromise;

      expect(sitecoreClientStub.getSiteMap.firstCall.args[0]).to.deep.include({
        reqHost: 'example.com',
        reqProtocol: 'https',
        siteName: 'test-site',
      });
    });

    it('should use x-forwarded-host header when present', async () => {
      sitecoreClientStub.getSiteMap.resolves('<sitemapindex>...</sitemapindex>');

      const event = createMockEvent(
        { 'x-forwarded-host': 'example.com', host: 'localhost:3000' },
        '/sitemap.xml'
      );
      const bodyPromise = readBody(event);

      await route.handle(event);
      await bodyPromise;

      expect(sitecoreClientStub.getSiteMap).to.have.been.calledWithMatch({
        reqHost: 'example.com',
        siteName: 'test-site',
      });
    });

    it('should use empty string when both x-forwarded-host and host headers are missing', async () => {
      const xmlContent = '<sitemapindex>...</sitemapindex>';
      sitecoreClientStub.getSiteMap.resolves(xmlContent);

      const event = createMockEvent({ 'x-forwarded-proto': 'https' }, '/sitemap.xml');
      const bodyPromise = readBody(event);

      await route.handle(event);
      await bodyPromise;

      expect(sitecoreClientStub.getSiteMap.firstCall.args[0]).to.deep.include({
        reqHost: '',
        reqProtocol: 'https',
      });
    });

    it('should cache the response for default revalidate time', async () => {
      expect(defineCachedFunctionStub.callCount).to.equal(1);
      expect(defineCachedFunctionStub.args[0][1].maxAge).to.equal(60);
    });

    it('should cache the response for custom revalidate time', async () => {
      defineCachedFunctionStub.resetHistory();

      route = sitemapRouteModule.createSitemapRoute({
        client: sitecoreClientStub,
        sites,
        revalidate: 10,
      });

      expect(defineCachedFunctionStub.callCount).to.equal(1);
      expect(defineCachedFunctionStub.args[0][1].maxAge).to.equal(10);
    });

    it('should return 404 when REDIRECT_404 error is thrown', async () => {
      sitecoreClientStub.getSiteMap.rejects(new Error('REDIRECT_404'));

      const event = createMockEvent(
        { host: 'example.com', 'x-forwarded-proto': 'https' },
        '/sitemap.xml'
      );
      const bodyPromise = readBody(event);

      await route.handle(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).to.equal(404);
      expect(body).to.equal('Not Found');
    });

    it('should return 500 when any other error occurs', async () => {
      sitecoreClientStub.getSiteMap.rejects(new Error('Unexpected error'));

      const event = createMockEvent(
        { host: 'example.com', 'x-forwarded-proto': 'https' },
        '/sitemap.xml'
      );
      const bodyPromise = readBody(event);

      await route.handle(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).to.equal(500);
      expect(body).to.equal(`Internal Server Error.  ${ERROR_MESSAGES.CONTACT_SUPPORT}`);
    });
  });
});
