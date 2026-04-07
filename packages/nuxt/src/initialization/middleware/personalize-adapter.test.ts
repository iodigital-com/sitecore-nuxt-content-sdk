import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createEvent, H3Event } from 'h3';
import { IncomingMessage, ServerResponse } from 'http';

vi.mock('@sitecore-content-sdk/core', () => ({ getCoreContext: vi.fn() }));
vi.mock('@sitecore-content-sdk/analytics-core/internal', () => ({
  COOKIE_NAME_PREFIX: 'sc_',
  getDefaultCookieAttributes: vi.fn(),
  getAnalyticsPlugin: vi.fn(),
}));
vi.mock('@sitecore-content-sdk/personalize/internal', () => ({
  getPersonalizePlugin: vi.fn(),
  fetchProfileIdFromEdgeProxy: vi.fn(),
}));
vi.mock('./analytics-adapter', () => ({ getClientId: vi.fn() }));
vi.mock('h3', async (importOriginal) => {
  const actual = await importOriginal<typeof import('h3')>();
  return {
    ...actual,
    getCookie: vi.fn(),
    setCookie: vi.fn(),
    deleteCookie: vi.fn(),
    getRequestHeader: vi.fn(),
  };
});

import { getCoreContext } from '@sitecore-content-sdk/core';
import {
  getDefaultCookieAttributes,
  getAnalyticsPlugin,
} from '@sitecore-content-sdk/analytics-core/internal';
import {
  getPersonalizePlugin,
  fetchProfileIdFromEdgeProxy,
} from '@sitecore-content-sdk/personalize/internal';
import { getClientId } from './analytics-adapter';
import { getCookie, setCookie, deleteCookie, getRequestHeader } from 'h3';
import { personalizeMiddlewareAdapter } from './personalize-adapter';

describe('personalizeMiddlewareAdapter', () => {
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

  const mockPersonalizePlugin = {
    options: {
      cookies: {
        name: 'sc_gid',
      },
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
    vi.mocked(getPersonalizePlugin).mockReturnValue(mockPersonalizePlugin as any);
    vi.mocked(getDefaultCookieAttributes).mockReturnValue(mockCookieAttributes as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('personalizeMiddlewareAdapter', () => {
    it('should return an adapter with type "middleware"', () => {
      const adapter = personalizeMiddlewareAdapter(createMockEvent());
      expect(adapter.type).toBe('middleware');
    });

    describe('getUserAgent', () => {
      it('should return user agent from request headers', () => {
        vi.mocked(getRequestHeader).mockReturnValue('Mozilla/5.0 TestBrowser');
        const adapter = personalizeMiddlewareAdapter(createMockEvent());

        expect(adapter.getUserAgent()).toBe('Mozilla/5.0 TestBrowser');
        expect(vi.mocked(getRequestHeader)).toHaveBeenCalledWith(expect.anything(), 'user-agent');
      });

      it('should return undefined when user agent header is not present', () => {
        vi.mocked(getRequestHeader).mockReturnValue(undefined);
        const adapter = personalizeMiddlewareAdapter(createMockEvent());

        expect(adapter.getUserAgent()).toBeUndefined();
      });
    });

    describe('getProfileId', () => {
      it('should return profile ID from request cookies', () => {
        vi.mocked(getCookie).mockImplementation((_event, name) => {
          if (name === 'sc_gid') return 'profile-id-123';
          return undefined;
        });
        const adapter = personalizeMiddlewareAdapter(createMockEvent());

        expect(adapter.getProfileId()).toBe('profile-id-123');
        expect(vi.mocked(getCookie)).toHaveBeenCalledWith(expect.anything(), 'sc_gid');
      });

      it('should return null when profile ID cookie does not exist', () => {
        vi.mocked(getCookie).mockReturnValue(undefined);
        const adapter = personalizeMiddlewareAdapter(createMockEvent());

        expect(adapter.getProfileId()).toBeNull();
      });
    });

    describe('setProfileId', () => {
      describe('legacy cookie migration', () => {
        it('should migrate legacy cookie and set new cookie', async () => {
          vi.mocked(getCookie).mockImplementation((_event, name) => {
            if (name === 'sc_test-context-id_personalize') return 'legacy-profile-id';
            return undefined;
          });

          const event = createMockEvent();
          await personalizeMiddlewareAdapter(event).setProfileId();

          expect(vi.mocked(setCookie)).toHaveBeenCalledWith(
            event,
            'sc_gid',
            'legacy-profile-id',
            expect.objectContaining({ sameSite: 'none' })
          );
        });

        it('should delete legacy cookie', async () => {
          vi.mocked(getCookie).mockImplementation((_event, name) => {
            if (name === 'sc_test-context-id_personalize') return 'legacy-profile-id';
            return undefined;
          });

          const event = createMockEvent();
          await personalizeMiddlewareAdapter(event).setProfileId();

          expect(vi.mocked(deleteCookie)).toHaveBeenCalledWith(
            event,
            'sc_test-context-id_personalize'
          );
        });

        it('should not fetch from edge proxy when legacy cookie exists', async () => {
          vi.mocked(getCookie).mockImplementation((_event, name) => {
            if (name === 'sc_test-context-id_personalize') return 'legacy-profile-id';
            return undefined;
          });

          await personalizeMiddlewareAdapter(createMockEvent()).setProfileId();

          expect(vi.mocked(fetchProfileIdFromEdgeProxy)).not.toHaveBeenCalled();
        });
      });

      describe('existing profile ID', () => {
        it('should use existing profile ID and set cookie', async () => {
          vi.mocked(getCookie).mockImplementation((_event, name) => {
            if (name === 'sc_gid') return 'existing-profile-id';
            return undefined;
          });

          const event = createMockEvent();
          await personalizeMiddlewareAdapter(event).setProfileId();

          expect(vi.mocked(fetchProfileIdFromEdgeProxy)).not.toHaveBeenCalled();
          expect(vi.mocked(setCookie)).toHaveBeenCalledWith(
            event,
            'sc_gid',
            'existing-profile-id',
            expect.objectContaining({ sameSite: 'none' })
          );
        });
      });

      describe('proxy values from edge server', () => {
        it('should use profile ID from proxy values when available', async () => {
          mockAnalyticsPlugin.options.visitorIds = {
            clientId: 'client-id',
            profileId: 'proxy-profile-id',
          };
          vi.mocked(getCookie).mockReturnValue(undefined);

          const event = createMockEvent();
          await personalizeMiddlewareAdapter(event).setProfileId();

          expect(vi.mocked(fetchProfileIdFromEdgeProxy)).not.toHaveBeenCalled();
          expect(vi.mocked(setCookie)).toHaveBeenCalledWith(
            event,
            'sc_gid',
            'proxy-profile-id',
            expect.objectContaining({ sameSite: 'none' })
          );
        });

        it('should fallback to edge proxy fetch when proxy values exist but profileId is undefined', async () => {
          mockAnalyticsPlugin.options.visitorIds = { clientId: 'client-id', profileId: undefined };
          vi.mocked(getCookie).mockReturnValue(undefined);
          vi.mocked(getClientId).mockReturnValue('client-id-123');
          vi.mocked(fetchProfileIdFromEdgeProxy).mockResolvedValue('fetched-profile-id' as any);

          const event = createMockEvent();
          await personalizeMiddlewareAdapter(event).setProfileId();

          expect(vi.mocked(fetchProfileIdFromEdgeProxy)).toHaveBeenCalledWith(
            'client-id-123',
            'test-context-id',
            'https://edge.test.com'
          );
          expect(vi.mocked(setCookie)).toHaveBeenCalledWith(
            event,
            'sc_gid',
            'fetched-profile-id',
            expect.objectContaining({ sameSite: 'none' })
          );
        });
      });

      describe('fetch from edge proxy', () => {
        it('should fetch profile ID from edge proxy when client ID exists', async () => {
          vi.mocked(getCookie).mockReturnValue(undefined);
          vi.mocked(getClientId).mockReturnValue('client-id-123');
          vi.mocked(fetchProfileIdFromEdgeProxy).mockResolvedValue('new-profile-id' as any);

          await personalizeMiddlewareAdapter(createMockEvent()).setProfileId();

          expect(vi.mocked(fetchProfileIdFromEdgeProxy)).toHaveBeenCalledWith(
            'client-id-123',
            'test-context-id',
            'https://edge.test.com'
          );
        });

        it('should set profile ID cookie from edge proxy response', async () => {
          vi.mocked(getCookie).mockReturnValue(undefined);
          vi.mocked(getClientId).mockReturnValue('client-id-123');
          vi.mocked(fetchProfileIdFromEdgeProxy).mockResolvedValue('new-profile-id' as any);

          const event = createMockEvent();
          await personalizeMiddlewareAdapter(event).setProfileId();

          expect(vi.mocked(setCookie)).toHaveBeenCalledWith(
            event,
            'sc_gid',
            'new-profile-id',
            expect.objectContaining({ sameSite: 'none' })
          );
        });
      });

      describe('no client ID available', () => {
        it('should return early when no client ID or proxy values exist', async () => {
          vi.mocked(getCookie).mockReturnValue(undefined);
          vi.mocked(getClientId).mockReturnValue(null);

          await personalizeMiddlewareAdapter(createMockEvent()).setProfileId();

          expect(vi.mocked(fetchProfileIdFromEdgeProxy)).not.toHaveBeenCalled();
          expect(vi.mocked(setCookie)).not.toHaveBeenCalled();
        });
      });
    });
  });
});
