import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockEvent } from 'h3';
import type { SiteInfo } from '@sitecore-content-sdk/content/site';
import { createRobotsRoute } from './robots-route';

const { SiteResolverMock } = vi.hoisted(() => ({
  SiteResolverMock: vi.fn(),
}));

vi.mock('@sitecore-content-sdk/content/site', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sitecore-content-sdk/content/site')>();
  return { ...actual, SiteResolver: SiteResolverMock };
});

const createMockEvent = (headers: Record<string, string> = {}) => {
  return mockEvent('http://localhost/', { headers });
};

describe('createRobotsRoute', () => {
  let getRobotsMock: ReturnType<typeof vi.fn>;
  let sitecoreClientStub: any;
  let siteResolverStub: {
    getByHost: ReturnType<typeof vi.fn>;
    getByName: ReturnType<typeof vi.fn>;
  };
  let route: any;

  const mockSiteInfo: SiteInfo = {
    name: 'test-site',
    hostName: 'example.com',
    language: 'en',
  };

  const sites = [mockSiteInfo, { name: 'test-site-two', hostName: 'localhost', language: 'da' }];

  beforeEach(() => {
    getRobotsMock = vi.fn();
    sitecoreClientStub = { getRobots: getRobotsMock };

    siteResolverStub = {
      getByHost: vi.fn((hostName: string) => sites.find((site) => site.hostName === hostName)),
      getByName: vi.fn(),
    };

    SiteResolverMock.mockImplementation(function (this: any) {
      this.getByHost = siteResolverStub.getByHost;
      this.getByName = siteResolverStub.getByName;
    });

    route = createRobotsRoute({ client: sitecoreClientStub, sites });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should set the content type header to text/plain', async () => {
    const event = createMockEvent({ host: 'example.com' });
    getRobotsMock.mockResolvedValue('User-agent: *\nDisallow: /');

    await route.handle(event);

    expect(event.res.headers.get('Content-Type')).toBe('text/plain');
  });

  it('should call getRobots with the correct siteName', async () => {
    const event = createMockEvent({ host: 'example.com' });
    getRobotsMock.mockResolvedValue('User-agent: *\nDisallow: /');

    await route.handle(event);

    expect(getRobotsMock).toHaveBeenCalledWith('test-site');
  });

  it('should return 200 with robots content', async () => {
    const event = createMockEvent({ host: 'example.com' });
    getRobotsMock.mockResolvedValue('User-agent: *\nDisallow: /');

    await route.handle(event);

    expect(event.res.status ?? 200).toBe(200);
  });

  it('should return 404 if getRobots returns null', async () => {
    const event = createMockEvent({ host: 'example.com' });
    getRobotsMock.mockResolvedValue(undefined);

    await route.handle(event);

    expect(event.res.status).toBe(404);
  });

  it('should return 500 if getRobots throws an error', async () => {
    const event = createMockEvent({ host: 'example.com' });
    getRobotsMock.mockRejectedValue(new Error('Unexpected failure'));

    await route.handle(event);

    expect(event.res.status).toBe(500);
  });

  it('should use "localhost" as fallback when host header is missing', async () => {
    const event = createMockEvent({});
    getRobotsMock.mockResolvedValue('User-agent: *\nDisallow: /');

    await route.handle(event);

    expect(getRobotsMock).toHaveBeenCalledWith('test-site-two');
  });

  it('should use x-forwarded-host header when present', async () => {
    const event = createMockEvent({
      'x-forwarded-host': 'middleware.forwarded.com',
      host: 'localhost:3000',
    });

    siteResolverStub.getByHost.mockReturnValue(mockSiteInfo);
    getRobotsMock.mockResolvedValue('User-agent: *\nDisallow: /');

    await route.handle(event);

    expect(siteResolverStub.getByHost).toHaveBeenCalledWith('middleware.forwarded.com');
  });
});
