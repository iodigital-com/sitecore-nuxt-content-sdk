import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createEvent } from 'h3';
import { IncomingMessage, ServerResponse } from 'http';
import type { SiteInfo } from '@sitecore-content-sdk/content/site';
import { constants } from '@sitecore-content-sdk/core';
import { createSitemapRoute } from './sitemap-route';

const { ERROR_MESSAGES } = constants;

const { defineCachedFunctionMock, SiteResolverMock } = vi.hoisted(() => ({
  defineCachedFunctionMock: vi.fn(),
  SiteResolverMock: vi.fn(),
}));

vi.mock('nitro/cache', () => ({ defineCachedFunction: defineCachedFunctionMock }));
vi.mock('@sitecore-content-sdk/content/site', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sitecore-content-sdk/content/site')>();
  return { ...actual, SiteResolver: SiteResolverMock };
});

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
  let getSiteMapMock: ReturnType<typeof vi.fn>;
  let sitecoreClientStub: any;
  let siteResolverStub: {
    getByHost: ReturnType<typeof vi.fn>;
    getByName: ReturnType<typeof vi.fn>;
  };
  let route: any;

  const sites: SiteInfo[] = [
    { name: 'test-site', hostName: 'example.com', language: 'en' },
    { name: 'test-site-two', hostName: '*', language: 'da' },
  ];

  beforeEach(() => {
    getSiteMapMock = vi.fn();
    sitecoreClientStub = { getSiteMap: getSiteMapMock };

    siteResolverStub = {
      getByHost: vi.fn(
        (hostName: string) => sites.find((site) => site.hostName === hostName) || sites[1]
      ),
      getByName: vi.fn(),
    };

    defineCachedFunctionMock.mockImplementation(
      (fn: (...args: unknown[]) => Promise<unknown>) => fn
    );

    SiteResolverMock.mockReturnValue(siteResolverStub);

    route = createSitemapRoute({ client: sitecoreClientStub, sites });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('handle', () => {
    it('should process sitemap request without id parameter', async () => {
      const xmlContent = '<sitemapindex>...</sitemapindex>';
      getSiteMapMock.mockResolvedValue(xmlContent);

      const event = createMockEvent(
        { host: 'example.com', 'x-forwarded-proto': 'https' },
        '/sitemap.xml'
      );
      const bodyPromise = readBody(event);

      await route.handle(event);
      const body = await bodyPromise;

      expect(getSiteMapMock).toHaveBeenCalledOnce();
      expect(getSiteMapMock.mock.calls[0][0]).toMatchObject({
        reqHost: 'example.com',
        reqProtocol: 'https',
        id: '',
        siteName: 'test-site',
      });
      expect(event.node.res.getHeader('Content-Type')).toBe('text/xml;charset=utf-8');
      expect(body).toBe(xmlContent);
    });

    it('should handle sitemap request with specific id parameter', async () => {
      const sitemapId = '1';
      const xmlContent = '<urlset>...</urlset>';
      getSiteMapMock.mockResolvedValue(xmlContent);

      const event = createMockEvent(
        { host: 'example.com', 'x-forwarded-proto': 'https' },
        `/sitemap-${sitemapId}.xml`
      );
      const bodyPromise = readBody(event);

      await route.handle(event);
      const body = await bodyPromise;

      expect(getSiteMapMock.mock.calls[0][0]).toMatchObject({
        reqHost: 'example.com',
        reqProtocol: 'https',
        id: sitemapId,
        siteName: 'test-site',
      });
      expect(body).toBe(xmlContent);
    });

    it('should default to https protocol when x-forwarded-proto header is missing', async () => {
      getSiteMapMock.mockResolvedValue('<sitemapindex>...</sitemapindex>');

      const event = createMockEvent({ host: 'example.com' }, '/sitemap.xml');
      const bodyPromise = readBody(event);

      await route.handle(event);
      await bodyPromise;

      expect(getSiteMapMock.mock.calls[0][0]).toMatchObject({
        reqHost: 'example.com',
        reqProtocol: 'https',
        siteName: 'test-site',
      });
    });

    it('should use x-forwarded-host header when present', async () => {
      getSiteMapMock.mockResolvedValue('<sitemapindex>...</sitemapindex>');

      const event = createMockEvent(
        { 'x-forwarded-host': 'example.com', host: 'localhost:3000' },
        '/sitemap.xml'
      );
      const bodyPromise = readBody(event);

      await route.handle(event);
      await bodyPromise;

      expect(getSiteMapMock).toHaveBeenCalledWith(
        expect.objectContaining({ reqHost: 'example.com', siteName: 'test-site' })
      );
    });

    it('should use empty string when both x-forwarded-host and host headers are missing', async () => {
      getSiteMapMock.mockResolvedValue('<sitemapindex>...</sitemapindex>');

      const event = createMockEvent({ 'x-forwarded-proto': 'https' }, '/sitemap.xml');
      const bodyPromise = readBody(event);

      await route.handle(event);
      await bodyPromise;

      expect(getSiteMapMock.mock.calls[0][0]).toMatchObject({
        reqHost: '',
        reqProtocol: 'https',
      });
    });

    it('should cache the response for default revalidate time', async () => {
      expect(defineCachedFunctionMock).toHaveBeenCalledOnce();
      expect(defineCachedFunctionMock.mock.calls[0][1].maxAge).toBe(60);
    });

    it('should cache the response for custom revalidate time', async () => {
      defineCachedFunctionMock.mockClear();

      route = createSitemapRoute({ client: sitecoreClientStub, sites, revalidate: 10 });

      expect(defineCachedFunctionMock).toHaveBeenCalledOnce();
      expect(defineCachedFunctionMock.mock.calls[0][1].maxAge).toBe(10);
    });

    it('should return 404 when REDIRECT_404 error is thrown', async () => {
      getSiteMapMock.mockRejectedValue(new Error('REDIRECT_404'));

      const event = createMockEvent(
        { host: 'example.com', 'x-forwarded-proto': 'https' },
        '/sitemap.xml'
      );
      const bodyPromise = readBody(event);

      await route.handle(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).toBe(404);
      expect(body).toBe('Not Found');
    });

    it('should return 500 when any other error occurs', async () => {
      getSiteMapMock.mockRejectedValue(new Error('Unexpected error'));

      const event = createMockEvent(
        { host: 'example.com', 'x-forwarded-proto': 'https' },
        '/sitemap.xml'
      );
      const bodyPromise = readBody(event);

      await route.handle(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).toBe(500);
      expect(body).toBe(`Internal Server Error.  ${ERROR_MESSAGES.CONTACT_SUPPORT}`);
    });
  });
});
