/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import { createEvent, H3Event } from 'h3';
import { IncomingMessage, ServerResponse } from 'http';
import { BOT_DETECTION_COOKIE } from '@sitecore-content-sdk/analytics-core/internal';
import { BotTrackingMiddleware, BotTrackingMiddlewareConfig } from './bot-tracking-middleware';
import debug from '../debug';

const { initContentSdkStub, isBotStub, botPageViewStub, eventsPluginStub, analyticsPluginStub } =
  vi.hoisted(() => ({
    initContentSdkStub: vi.fn().mockResolvedValue(undefined),
    isBotStub: vi.fn(),
    botPageViewStub: vi.fn().mockResolvedValue(undefined),
    eventsPluginStub: vi.fn().mockReturnValue({}),
    analyticsPluginStub: vi.fn().mockReturnValue({}),
  }));

// Partial mocks: keep the real exports (debugModule etc.) and only replace
// the functions this middleware actually calls.
vi.mock('@sitecore-content-sdk/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sitecore-content-sdk/core')>();
  return { ...actual, initContentSdk: initContentSdkStub };
});

vi.mock('@sitecore-content-sdk/analytics-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sitecore-content-sdk/analytics-core')>();
  return { ...actual, analyticsPlugin: analyticsPluginStub };
});

vi.mock('@sitecore-content-sdk/events', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sitecore-content-sdk/events')>();
  return { ...actual, eventsPlugin: eventsPluginStub, botPageView: botPageViewStub };
});

vi.mock('@sitecore-content-sdk/analytics-core/internal', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@sitecore-content-sdk/analytics-core/internal')
  >();
  return { ...actual, isBot: isBotStub };
});

const hostname = 'foo.net';
const siteName = 'test-site';
const userAgent = 'Googlebot';

const defaultConfig = {
  enabled: true,
  contextId: 'ctx-id',
  clientContextId: 'client-ctx',
  edgeUrl: 'https://edge.example',
  sites: [],
} as unknown as BotTrackingMiddlewareConfig;

/**
 * Builds a real H3 event backed by Node's IncomingMessage/ServerResponse so the
 * h3 helpers (getRequestHeader, getRequestURL, setCookie) run their real logic.
 * @param {Record<string, string>} headers - Request headers, merged with a default host
 * @param {Record<string, string>} cookies - Cookie name/value pairs, serialized into the cookie header
 * @param {string} path - Request pathname, defaults to `/styleguide`
 * @returns {H3Event} A real H3 event
 * @example
 * const event = createMockEvent({ 'user-agent': 'Googlebot' });
 */
const createMockEvent = (
  headers: Record<string, string> = {},
  cookies: Record<string, string> = {},
  path: string = '/styleguide'
): H3Event => {
  const req = new IncomingMessage(null as any);
  req.url = path;
  req.headers = {
    host: hostname,
    ...headers,
  };

  if (Object.keys(cookies).length) {
    req.headers.cookie = Object.entries(cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  const res = new ServerResponse(req);
  return createEvent(req, res);
};

/**
 * Creates a middleware instance with the MiddlewareBase methods that depend on
 * external state stubbed, so each test only exercises the bot tracking logic.
 * @param {Record<string, unknown>} config - Config overrides merged with the defaults
 * @returns The middleware instance with base methods spied
 */
const createMiddleware = (config: Record<string, unknown> = {}) => {
  const middleware = new BotTrackingMiddleware({
    ...defaultConfig,
    ...config,
  } as BotTrackingMiddlewareConfig);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  vi.spyOn(middleware as any, 'disabled').mockReturnValue(false);
  vi.spyOn(middleware as any, 'isPreview').mockReturnValue(false);
  vi.spyOn(middleware as any, 'isPrefetch').mockReturnValue(false);
  vi.spyOn(middleware as any, 'getSite').mockReturnValue({ name: siteName });
  vi.spyOn(middleware as any, 'getLanguage').mockReturnValue('en');
  vi.spyOn(middleware as any, 'getHostHeader').mockReturnValue(hostname);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return middleware;
};

/**
 * Reads the serialized set-cookie header written by the real h3 setCookie call.
 * @param {H3Event} event - The H3 event
 * @returns {string} The set-cookie header value, or an empty string when not set
 */
const getSetCookie = (event: H3Event): string => {
  const header = event.node.res.getHeader('set-cookie');
  if (Array.isArray(header)) return header.join('; ');
  return (header as string) || '';
};

describe('BotTrackingMiddleware', () => {
  let debugSpy: ReturnType<typeof vi.spyOn>;

  const validateDebugLog = (message: string, ...params: unknown[]) => {
    expect(debugSpy.mock.calls.find((log: unknown[]) => log[0] === message)).toEqual([
      message,
      ...params,
    ]);
  };

  beforeEach(() => {
    isBotStub.mockReset();
    botPageViewStub.mockReset().mockResolvedValue(undefined);
    initContentSdkStub.mockReset().mockResolvedValue(undefined);
    eventsPluginStub.mockClear();
    analyticsPluginStub.mockClear();
    debugSpy = vi.spyOn(debug, 'common').mockImplementation(() => {});
  });

  afterEach(() => {
    debugSpy.mockRestore();
  });

  describe('request skipped', () => {
    it('skips when the middleware is disabled', async () => {
      isBotStub.mockReturnValue(true);
      const event = createMockEvent({ 'user-agent': userAgent });
      const middleware = createMiddleware();
      vi.spyOn(middleware as any, 'disabled').mockReturnValue(true);

      await middleware.handle(event);

      validateDebugLog('bot tracking middleware skipped (disabled)');
      expect(isBotStub).not.toHaveBeenCalled();
      expect(initContentSdkStub).not.toHaveBeenCalled();
      expect(botPageViewStub).not.toHaveBeenCalled();
      expect(getSetCookie(event)).toBe('');
    });

    it('skips when the request is a preview', async () => {
      isBotStub.mockReturnValue(true);
      const event = createMockEvent({ 'user-agent': userAgent });
      const middleware = createMiddleware();
      vi.spyOn(middleware as any, 'isPreview').mockReturnValue(true);

      await middleware.handle(event);

      validateDebugLog('bot tracking middleware skipped (preview)');
      expect(isBotStub).not.toHaveBeenCalled();
      expect(initContentSdkStub).not.toHaveBeenCalled();
      expect(botPageViewStub).not.toHaveBeenCalled();
      expect(getSetCookie(event)).toBe('');
    });

    it('skips in local environment when NODE_ENV is development', async () => {
      isBotStub.mockReturnValue(true);
      const env = process.env as Record<string, string | undefined>;
      const originalNodeEnv = env.NODE_ENV;
      env.NODE_ENV = 'development';

      try {
        const event = createMockEvent({ 'user-agent': userAgent });
        const middleware = createMiddleware();

        await middleware.handle(event);

        validateDebugLog('bot tracking middleware skipped (local environment)');
        expect(isBotStub).not.toHaveBeenCalled();
        expect(initContentSdkStub).not.toHaveBeenCalled();
        expect(botPageViewStub).not.toHaveBeenCalled();
      } finally {
        env.NODE_ENV = originalNodeEnv;
      }
    });

    describe('host is loopback', () => {
      ['localhost', '127.0.0.1', '::1', '[::1]'].forEach((host) => {
        it(`skips in local environment when host is ${host}`, async () => {
          isBotStub.mockReturnValue(true);
          // Keep a parseable host on the event for getRequestURL; the loopback
          // value is only needed by the local-environment check via getHostHeader.
          const event = createMockEvent({ 'user-agent': userAgent });
          const middleware = createMiddleware();
          vi.spyOn(middleware as any, 'getHostHeader').mockReturnValue(host);

          await middleware.handle(event);

          validateDebugLog('bot tracking middleware skipped (local environment)');
          expect(isBotStub).not.toHaveBeenCalled();
          expect(initContentSdkStub).not.toHaveBeenCalled();
          expect(botPageViewStub).not.toHaveBeenCalled();
        });
      });
    });

    it('skips when the user-agent header is missing or empty', async () => {
      isBotStub.mockReturnValue(true);

      for (const headers of [{}, { 'user-agent': '' }] as const) {
        const event = createMockEvent(headers);
        const middleware = createMiddleware();

        await middleware.handle(event);

        validateDebugLog('bot tracking middleware skipped (no user-agent)');
        expect(isBotStub).not.toHaveBeenCalled();
        expect(initContentSdkStub).not.toHaveBeenCalled();
        expect(botPageViewStub).not.toHaveBeenCalled();
        expect(getSetCookie(event)).toBe('');

        isBotStub.mockClear();
        initContentSdkStub.mockClear();
        botPageViewStub.mockClear();
        debugSpy.mockClear();
      }
    });

    it('skips when the request is not a bot', async () => {
      isBotStub.mockReturnValue(false);
      const event = createMockEvent({ 'user-agent': 'Mozilla/5.0' });
      const middleware = createMiddleware();

      await middleware.handle(event);

      expect(isBotStub).toHaveBeenCalledWith('Mozilla/5.0');
      validateDebugLog('bot tracking middleware skipped (not a bot)');
      expect(initContentSdkStub).not.toHaveBeenCalled();
      expect(botPageViewStub).not.toHaveBeenCalled();
      expect(getSetCookie(event)).toBe('');
    });

    it('skips when the request is a prefetch', async () => {
      isBotStub.mockReturnValue(true);
      const event = createMockEvent({ 'user-agent': userAgent });
      const middleware = createMiddleware();
      vi.spyOn(middleware as any, 'isPrefetch').mockReturnValue(true);

      await middleware.handle(event);

      validateDebugLog('bot tracking middleware skipped (prefetch)');
      expect(initContentSdkStub).not.toHaveBeenCalled();
      expect(botPageViewStub).not.toHaveBeenCalled();
    });
  });

  describe('request passed', () => {
    it('runs in local environment when SITECORE_ENABLE_BOT_TRACKING is true', async () => {
      isBotStub.mockReturnValue(true);
      const env = process.env as Record<string, string | undefined>;
      const originalBotTracking = env.SITECORE_ENABLE_BOT_TRACKING;
      const originalNodeEnv = env.NODE_ENV;
      env.SITECORE_ENABLE_BOT_TRACKING = 'true';
      env.NODE_ENV = 'development';

      try {
        const event = createMockEvent({ 'user-agent': userAgent });
        const middleware = createMiddleware();

        await middleware.handle(event);

        const cookie = getSetCookie(event);
        expect(cookie).toContain(`${BOT_DETECTION_COOKIE}=1`);
        expect(cookie).toContain('Path=/');
        expect(cookie).toContain('Secure');
        expect(cookie).toMatch(/SameSite=Lax/i);

        expect(initContentSdkStub).toHaveBeenCalledOnce();
        expect(initContentSdkStub.mock.calls[0][0]).toMatchObject({
          config: {
            contextId: defaultConfig.contextId,
            edgeUrl: defaultConfig.edgeUrl,
            siteName,
          },
        });
        expect(botPageViewStub).toHaveBeenCalledOnce();
        expect(botPageViewStub.mock.calls[0][0]).toMatchObject({
          page: '/styleguide',
          language: 'en',
          userAgent,
        });
      } finally {
        env.SITECORE_ENABLE_BOT_TRACKING = originalBotTracking;
        env.NODE_ENV = originalNodeEnv;
      }
    });

    it('sets the bot cookie and runs botPageView for a bot request', async () => {
      isBotStub.mockReturnValue(true);
      const event = createMockEvent({ 'user-agent': userAgent });
      const middleware = createMiddleware();

      await middleware.handle(event);

      const cookie = getSetCookie(event);
      expect(cookie).toContain(`${BOT_DETECTION_COOKIE}=1`);
      expect(cookie).toContain('Path=/');
      expect(cookie).toContain('Secure');
      expect(cookie).toMatch(/SameSite=Lax/i);

      expect(initContentSdkStub).toHaveBeenCalledOnce();
      expect(initContentSdkStub.mock.calls[0][0]).toMatchObject({
        config: {
          contextId: defaultConfig.contextId,
          edgeUrl: defaultConfig.edgeUrl,
          siteName,
        },
      });
      expect(botPageViewStub).toHaveBeenCalledOnce();
      expect(botPageViewStub.mock.calls[0][0]).toMatchObject({
        page: '/styleguide',
        language: 'en',
        userAgent,
      });
    });
  });

  describe('error handling', () => {
    it('logs and swallows the error when botPageView rejects', async () => {
      isBotStub.mockReturnValue(true);
      const error = new Error('edge failure');
      botPageViewStub.mockRejectedValue(error);

      const event = createMockEvent({ 'user-agent': userAgent });
      const middleware = createMiddleware();

      await expect(middleware.handle(event)).resolves.toBeUndefined();

      const errLog = debugSpy.mock.calls.find(
        (log: unknown[]) => log[0] === 'bot tracking middleware error: %o'
      );
      expect(errLog?.[1]).toBe(error);
    });
  });
});
