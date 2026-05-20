import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockEvent } from 'h3';
import type { SiteInfo } from '@sitecore-content-sdk/content/site';
import { constants } from '@sitecore-content-sdk/core';
import { createSitemapRoute } from './sitemap-route';

const { ERROR_MESSAGES } = constants;

const { SiteResolverMock } = vi.hoisted(() => ({
  SiteResolverMock: vi.fn(),
}));

vi.mock('@sitecore-content-sdk/content/site', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sitecore-content-sdk/content/site')>();
  return { ...actual, SiteResolver: SiteResolverMock };
});

const createMockEvent = (headers: Record<string, string> = {}, path: string = '/') => {
  return mockEvent(`http://localhost${path}`, { headers });
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

    SiteResolverMock.mockImplementation(function (this: any) {
      this.getByHost = siteResolverStub.getByHost;
      this.getByName = siteResolverStub.getByName;
    });

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

      const body = await route.handle(event);

      expect(getSiteMapMock).toHaveBeenCalledOnce();
      expect(getSiteMapMock.mock.calls[0][0]).toMatchObject({
        reqHost: 'example.com',
        reqProtocol: 'https',
        id: '',
        siteName: 'test-site',
      });
      expect(event.res.headers.get('Content-Type')).toBe('text/xml;charset=utf-8');
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

      const body = await route.handle(event);

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

      await route.handle(event);

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

      await route.handle(event);

      expect(getSiteMapMock).toHaveBeenCalledWith(
        expect.objectContaining({ reqHost: 'example.com', siteName: 'test-site' })
      );
    });

    it('should use empty string when both x-forwarded-host and host headers are missing', async () => {
      getSiteMapMock.mockResolvedValue('<sitemapindex>...</sitemapindex>');

      const event = createMockEvent({ 'x-forwarded-proto': 'https' }, '/sitemap.xml');

      await route.handle(event);

      expect(getSiteMapMock.mock.calls[0][0]).toMatchObject({
        reqHost: '',
        reqProtocol: 'https',
      });
    });

    it('should return 404 when REDIRECT_404 error is thrown', async () => {
      getSiteMapMock.mockRejectedValue(new Error('REDIRECT_404'));

      const event = createMockEvent(
        { host: 'example.com', 'x-forwarded-proto': 'https' },
        '/sitemap.xml'
      );

      const body = await route.handle(event);

      expect(event.res.status).toBe(404);
      expect(body).toBe('Not Found');
    });

    it('should return 500 when any other error occurs', async () => {
      getSiteMapMock.mockRejectedValue(new Error('Unexpected error'));

      const event = createMockEvent(
        { host: 'example.com', 'x-forwarded-proto': 'https' },
        '/sitemap.xml'
      );

      const body = await route.handle(event);

      expect(event.res.status).toBe(500);
      expect(body).toBe(`Internal Server Error.  ${ERROR_MESSAGES.CONTACT_SUPPORT}`);
    });
  });
});
