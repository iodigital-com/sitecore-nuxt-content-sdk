import sinon from 'sinon';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createEvent } from 'h3';
import { IncomingMessage, ServerResponse } from 'http';
import { SitecoreClient } from '@sitecore-content-sdk/content/client';
import { SiteInfo } from '@sitecore-content-sdk/content/site';
import { SiteResolver } from '@sitecore-content-sdk/content/site';
import { createRobotsRoute } from './robots-route';
// @ts-ignore - nitro/cache uses ESM-only exports (.mjs) incompatible with CommonJS moduleResolution.
// Resolved via vitest.config.ts alias at test runtime.
import { defineCachedFunction } from 'nitro/cache';

vi.mock('nitro/cache', () => ({ defineCachedFunction: vi.fn() }));
vi.mock('@sitecore-content-sdk/content/site', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sitecore-content-sdk/content/site')>();
  return { ...actual, SiteResolver: vi.fn() };
});

const createMockEvent = (headers: Record<string, string> = {}) => {
  const req = new IncomingMessage(null as any);
  req.headers = headers;
  const res = new ServerResponse(req);
  return createEvent(req, res);
};

describe('createRobotsRoute', () => {
  const sandbox = sinon.createSandbox();
  let sitecoreClientStub: sinon.SinonStubbedInstance<SitecoreClient>;
  let route: any;
  let siteResolverStub: { getByHost: sinon.SinonStub; getByName: sinon.SinonStub };

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

    siteResolverStub.getByHost.callsFake((hostName: string) =>
      sites.find((site) => site.hostName === hostName)
    );

    vi.mocked(defineCachedFunction).mockImplementation(
      (fn: (...args: unknown[]) => Promise<unknown>) => fn
    );
    vi.mocked(SiteResolver).mockReturnValue(siteResolverStub as any);

    route = createRobotsRoute({ client: sitecoreClientStub, sites });
  });

  afterEach(() => {
    sandbox.restore();
    vi.clearAllMocks();
  });

  it('should set the content type header to text/plain', async () => {
    const event = createMockEvent({ host: 'example.com' });
    sitecoreClientStub.getRobots.resolves('User-agent: *\nDisallow: /');

    await route.handle(event);

    expect(event.node.res.getHeader('Content-Type')).toBe('text/plain');
  });

  it('should call getRobots with the correct siteName', async () => {
    const event = createMockEvent({ host: 'example.com' });
    sitecoreClientStub.getRobots.resolves('User-agent: *\nDisallow: /');

    await route.handle(event);

    sinon.assert.calledWith(sitecoreClientStub.getRobots, 'test-site');
  });

  it('should return 200 with robots content', async () => {
    const event = createMockEvent({ host: 'example.com' });
    sitecoreClientStub.getRobots.resolves('User-agent: *\nDisallow: /');

    await route.handle(event);

    expect(event.node.res.statusCode).toBe(200);
  });

  it('should return 404 if getRobots returns null', async () => {
    const event = createMockEvent({ host: 'example.com' });
    sitecoreClientStub.getRobots.resolves(undefined);

    await route.handle(event);

    expect(event.node.res.statusCode).toBe(404);
  });

  it('should return 500 if getRobots throws an error', async () => {
    const event = createMockEvent({ host: 'example.com' });
    sitecoreClientStub.getRobots.rejects(new Error('Unexpected failure'));

    await route.handle(event);

    expect(event.node.res.statusCode).toBe(500);
  });

  it('should use "localhost" as fallback when host header is missing', async () => {
    const event = createMockEvent({});
    sitecoreClientStub.getRobots.resolves('User-agent: *\nDisallow: /');

    await route.handle(event);

    sinon.assert.calledWith(sitecoreClientStub.getRobots, 'test-site-two');
  });

  it('should use x-forwarded-host header when present', async () => {
    const event = createMockEvent({
      'x-forwarded-host': 'middleware.forwarded.com',
      host: 'localhost:3000',
    });

    siteResolverStub.getByHost.returns(mockSiteInfo);
    sitecoreClientStub.getRobots.resolves('User-agent: *\nDisallow: /');

    await route.handle(event);

    sinon.assert.calledWith(siteResolverStub.getByHost, 'middleware.forwarded.com');
  });

  it('should cache the response for default revalidate time', async () => {
    expect(vi.mocked(defineCachedFunction)).toHaveBeenCalledOnce();
    expect(vi.mocked(defineCachedFunction).mock.calls[0][1].maxAge).toBe(60);
  });

  it('should cache the response for custom revalidate time', async () => {
    vi.mocked(defineCachedFunction).mockClear();
    route = createRobotsRoute({
      client: sitecoreClientStub,
      sites,
      revalidate: 120,
    });

    expect(vi.mocked(defineCachedFunction)).toHaveBeenCalledOnce();
    expect(vi.mocked(defineCachedFunction).mock.calls[0][1].maxAge).toBe(120);
  });
});
