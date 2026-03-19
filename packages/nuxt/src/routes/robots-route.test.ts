import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import { createEvent } from 'h3';
import { IncomingMessage, ServerResponse } from 'http';
import { RobotsRoute } from './robots-route';
import { SitecoreClient } from '@sitecore-content-sdk/content/client';
import { SiteInfo } from '@sitecore-content-sdk/content/site';

chai.use(sinonChai);

const createMockEvent = (headers: Record<string, string> = {}) => {
  const req = new IncomingMessage(null as any);
  req.headers = headers;
  const res = new ServerResponse(req);
  return createEvent(req, res);
};

describe('RobotsRoute', () => {
  const sandbox = sinon.createSandbox();
  let sitecoreClientStub: sinon.SinonStubbedInstance<SitecoreClient>;
  let route: RobotsRoute;
  let defineCachedFunctionStub: sinon.SinonStub;
  let RobotsRouteModule: any;
  let siteResolverStub = {
    getByHost: sandbox.stub(),
    getByName: sandbox.stub(),
  };

  const mockSiteInfo: SiteInfo = {
    name: 'test-site',
    hostName: 'example.com',
    language: 'en',
  };

  const sites = [mockSiteInfo, { name: 'test-site-two', hostName: 'localhost', language: 'da' }];

  beforeEach(() => {
    sitecoreClientStub = sandbox.createStubInstance(SitecoreClient);
    siteResolverStub = {
      getByHost: sandbox.stub(),
      getByName: sandbox.stub(),
    };

    defineCachedFunctionStub = sandbox.stub().callsFake((fn) => fn);
    RobotsRouteModule = proxyquire('./robots-route', {
      'nitro/cache': { defineCachedFunction: defineCachedFunctionStub },
    });

    route = new RobotsRouteModule.RobotsRoute(sitecoreClientStub, sites);
    (route as any).siteResolver = siteResolverStub;
    siteResolverStub.getByHost.callsFake((hostName: string) =>
      sites.find((site) => site.hostName === hostName)
    );
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should set the content type header to text/plain', async () => {
    const event = createMockEvent({ host: 'example.com' });
    sitecoreClientStub.getRobots.resolves('User-agent: *\nDisallow: /');

    await route.handle(event);

    expect(event.node.res.getHeader('Content-Type')).to.equal('text/plain');
  });

  it('should call getRobots with the correct siteName', async () => {
    const event = createMockEvent({ host: 'example.com' });
    sitecoreClientStub.getRobots.resolves('User-agent: *\nDisallow: /');

    await route.handle(event);

    expect(sitecoreClientStub.getRobots).to.have.been.calledWith('test-site');
  });

  it('should return 200 with robots content', async () => {
    const event = createMockEvent({ host: 'example.com' });
    sitecoreClientStub.getRobots.resolves('User-agent: *\nDisallow: /');

    await route.handle(event);

    expect(event.node.res.statusCode).to.equal(200);
  });

  it('should return 404 if getRobots returns null', async () => {
    const event = createMockEvent({ host: 'example.com' });
    sitecoreClientStub.getRobots.resolves(undefined);

    await route.handle(event);

    expect(event.node.res.statusCode).to.equal(404);
  });

  it('should return 500 if getRobots throws an error', async () => {
    const event = createMockEvent({ host: 'example.com' });
    sitecoreClientStub.getRobots.rejects(new Error('Unexpected failure'));

    await route.handle(event);

    expect(event.node.res.statusCode).to.equal(500);
  });

  it('should use "localhost" as fallback when host header is missing', async () => {
    const event = createMockEvent({});
    sitecoreClientStub.getRobots.resolves('User-agent: *\nDisallow: /');

    await route.handle(event);

    expect(sitecoreClientStub.getRobots).to.have.been.calledWith('test-site-two');
  });

  it('should use x-forwarded-host header when present', async () => {
    const event = createMockEvent({
      'x-forwarded-host': 'proxy.forwarded.com',
      host: 'localhost:3000',
    });

    siteResolverStub.getByHost.returns(mockSiteInfo);
    sitecoreClientStub.getRobots.resolves('User-agent: *\nDisallow: /');

    await route.handle(event);

    expect(siteResolverStub.getByHost).to.have.been.calledWith('proxy.forwarded.com');
  });

  it('should cache the response for default revalidate time', async () => {
    expect(defineCachedFunctionStub.callCount).to.equal(1);
    expect(defineCachedFunctionStub.args[0][1].maxAge).to.equal(60);
  });

  it('should cache the response for custom revalidate time', async () => {
    defineCachedFunctionStub.resetHistory();
    route = new RobotsRouteModule.RobotsRoute(sitecoreClientStub, sites, 120);

    expect(defineCachedFunctionStub.callCount).to.equal(1);
    expect(defineCachedFunctionStub.args[0][1].maxAge).to.equal(120);
  });
});
