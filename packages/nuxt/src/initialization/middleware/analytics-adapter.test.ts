import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createEvent, H3Event } from 'h3';
import { IncomingMessage, ServerResponse } from 'http';

vi.mock('@sitecore-content-sdk/core', () => ({ getCoreContext: vi.fn() }));
vi.mock('@sitecore-content-sdk/analytics-core/internal', () => ({
  COOKIE_NAME_PREFIX: 'sc_',
  getDefaultCookieAttributes: vi.fn(),
  fetchClientIdFromEdgeProxy: vi.fn(),
  getAnalyticsPlugin: vi.fn(),
}));
vi.mock('h3', async (importOriginal) => {
  const actual = await importOriginal<typeof import('h3')>();
  return {
    ...actual,
    getCookie: vi.fn(),
    setCookie: vi.fn(),
    deleteCookie: vi.fn(),
    getRequestURL: vi.fn(),
  };
});

import { getCoreContext } from '@sitecore-content-sdk/core';
import {
  getDefaultCookieAttributes,
  fetchClientIdFromEdgeProxy,
  getAnalyticsPlugin,
} from '@sitecore-content-sdk/analytics-core/internal';
import { getCookie, setCookie, deleteCookie, getRequestURL } from 'h3';
import { analyticsMiddlewareAdapter, getClientId } from './analytics-adapter';

describe('analyticsMiddlewareAdapter', () => {
    const mockAnalyticsPlugin = {
    options: {
      cookies: {
        name: 'sc_cid',
        expiryDays: 730,
        domain: '.example.com',
      },
      timeout: 3000,
      visitorIds: undefined as any,
    },
  };

  const mockCoreContext = {
    config: {
      contextId: 'test-context-id',
      edgeUrl: 'https://edge.test.com',
    },
  };

  const mockCookieAttributes = {
    domain: '.example.com',
    maxAge: 63072000,
    path: '/',
    sameSite: 'None',
    secure: true,
  };

  const createMockEvent = (): H3Event => {
    const req = new IncomingMessage(null as any);
    const res = new ServerResponse(req);
    return createEvent(req, res);
  };

  beforeEach(() => {
    mockAnalyticsPlugin.options.visitorIds = undefined;

    vi.mocked(getAnalyticsPlugin).mockReturnValue(mockAnalyticsPlugin as any);
    vi.mocked(getCoreContext).mockReturnValue(mockCoreContext as any);
    vi.mocked(getDefaultCookieAttributes).mockReturnValue(mockCookieAttributes as any);
    vi.mocked(getRequestURL).mockReturnValue(new URL('http://localhost/'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('getClientId', () => {
    it('should return the client ID from request cookies', () => {
      vi.mocked(getCookie).mockReturnValue('client-id-123');
      const event = createMockEvent();

      expect(getClientId(event)).toBe('client-id-123');
      expect(vi.mocked(getCookie)).toHaveBeenCalledWith(event, 'sc_cid');
    });

    it('should return null when cookie does not exist', () => {
      vi.mocked(getCookie).mockReturnValue(undefined);
      const event = createMockEvent();

      expect(getClientId(event)).toBeNull();
    });

    it('should return null when cookie value is empty', () => {
      vi.mocked(getCookie).mockReturnValue('');
      const event = createMockEvent();

      expect(getClientId(event)).toBeNull();
    });
  });

  describe('analyticsMiddlewareAdapter', () => {
    it('should return an adapter with type "middleware"', () => {
      const event = createMockEvent();
      const adapter = analyticsMiddlewareAdapter(event);

      expect(adapter.type).toBe('middleware');
    });

    describe('getClientId', () => {
      it('should return client ID from request cookies', () => {
        vi.mocked(getCookie).mockReturnValue('client-id-456');
        const event = createMockEvent();

        const adapter = analyticsMiddlewareAdapter(event);

        expect(adapter.getClientId()).toBe('client-id-456');
      });
    });

    describe('setClientId', () => {
      describe('legacy cookie migration', () => {
        it('should migrate legacy cookie and set new cookie in response', async () => {
          vi.mocked(getCookie).mockImplementation((_event, name) => {
            if (name === 'sc_test-context-id') return 'legacy-client-id';
            return undefined;
          });

          const event = createMockEvent();
          const adapter = analyticsMiddlewareAdapter(event);
          await adapter.setClientId();

          expect(vi.mocked(setCookie)).toHaveBeenCalledWith(
            event,
            'sc_cid',
            'legacy-client-id',
            expect.objectContaining({ sameSite: 'none' })
          );
        });

        it('should delete legacy cookie', async () => {
          vi.mocked(getCookie).mockImplementation((_event, name) => {
            if (name === 'sc_test-context-id') return 'legacy-client-id';
            return undefined;
          });

          const event = createMockEvent();
          const adapter = analyticsMiddlewareAdapter(event);
          await adapter.setClientId();

          expect(vi.mocked(deleteCookie)).toHaveBeenCalledWith(event, 'sc_test-context-id');
        });

        it('should not fetch from edge proxy when legacy cookie exists', async () => {
          vi.mocked(getCookie).mockImplementation((_event, name) => {
            if (name === 'sc_test-context-id') return 'legacy-client-id';
            return undefined;
          });

          const event = createMockEvent();
          const adapter = analyticsMiddlewareAdapter(event);
          await adapter.setClientId();

          expect(vi.mocked(fetchClientIdFromEdgeProxy)).not.toHaveBeenCalled();
        });
      });

      describe('existing client ID', () => {
        it('should use existing client ID and set cookie in response', async () => {
          vi.mocked(getCookie).mockImplementation((_event, name) => {
            if (name === 'sc_cid') return 'existing-client-id';
            return undefined;
          });

          const event = createMockEvent();
          const adapter = analyticsMiddlewareAdapter(event);
          await adapter.setClientId();

          expect(vi.mocked(fetchClientIdFromEdgeProxy)).not.toHaveBeenCalled();
          expect(vi.mocked(setCookie)).toHaveBeenCalledWith(
            event,
            'sc_cid',
            'existing-client-id',
            expect.objectContaining({ sameSite: 'none' })
          );
        });
      });

      describe('fetch from edge proxy', () => {
        it('should fetch client ID from edge proxy when no cookies exist', async () => {
          vi.mocked(getCookie).mockReturnValue(undefined);
          vi.mocked(fetchClientIdFromEdgeProxy).mockResolvedValue({
            clientId: 'new-client-id',
            profileId: 'profile-id',
          } as any);

          const event = createMockEvent();
          const adapter = analyticsMiddlewareAdapter(event);
          await adapter.setClientId();

          expect(vi.mocked(fetchClientIdFromEdgeProxy)).toHaveBeenCalledWith(
            'https://edge.test.com',
            'test-context-id',
            3000
          );
        });

        it('should store proxy values in plugin settings after fetching', async () => {
          const visitorIds = { clientId: 'new-client-id', profileId: 'profile-id' };
          vi.mocked(getCookie).mockReturnValue(undefined);
          vi.mocked(fetchClientIdFromEdgeProxy).mockResolvedValue(visitorIds as any);

          const event = createMockEvent();
          const adapter = analyticsMiddlewareAdapter(event);
          await adapter.setClientId();

          expect(mockAnalyticsPlugin.options.visitorIds).toEqual(visitorIds);
        });

        it('should set cookie in response with correct attributes', async () => {
          vi.mocked(getCookie).mockReturnValue(undefined);
          vi.mocked(fetchClientIdFromEdgeProxy).mockResolvedValue({
            clientId: 'new-client-id',
          } as any);

          const event = createMockEvent();
          const adapter = analyticsMiddlewareAdapter(event);
          await adapter.setClientId();

          expect(vi.mocked(setCookie)).toHaveBeenCalledWith(
            event,
            'sc_cid',
            'new-client-id',
            expect.objectContaining({ sameSite: 'none' })
          );
        });
      });
    });

    describe('location.getSearchParams', () => {
      it('should return search params from request URL', () => {
        vi.mocked(getRequestURL).mockReturnValue(
          new URL('http://localhost/?param1=value1&param2=value2')
        );

        const event = createMockEvent();
        const adapter = analyticsMiddlewareAdapter(event);

        expect(adapter.location.getSearchParams()).toBe('param1=value1&param2=value2');
      });

      it('should return empty string when no search params', () => {
        vi.mocked(getRequestURL).mockReturnValue(new URL('http://localhost/'));

        const event = createMockEvent();
        const adapter = analyticsMiddlewareAdapter(event);

        expect(adapter.location.getSearchParams()).toBe('');
      });
    });
  });
});
