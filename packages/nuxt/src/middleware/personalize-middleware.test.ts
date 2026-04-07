/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import { createEvent, H3Event } from 'h3';
import { IncomingMessage, ServerResponse } from 'http';
import { GraphQLRequestClient } from '@sitecore-content-sdk/core';
import { SiteResolver } from '@sitecore-content-sdk/content/site';
import { CdpHelper } from '@sitecore-content-sdk/content/personalize';
import { PersonalizeMiddleware, PersonalizeMiddlewareConfig } from './personalize-middleware';
import debug from '../debug';
import { SITE_KEY } from '@sitecore-content-sdk/content/site';

const { CDKPersonalizeStub } = vi.hoisted(() => ({
  CDKPersonalizeStub: vi.fn().mockResolvedValue({ variantId: 'variant-2' }),
}));

vi.mock('@sitecore-content-sdk/personalize', () => ({
  personalize: CDKPersonalizeStub,
}));

const hostname = 'foo.net';
const siteName = 'bar';
const pageId = 'item-id';
const variantIds = ['variant-1', 'variant-2'];
const referrer = 'http://localhost:3000';

const defaultConfig: Omit<PersonalizeMiddlewareConfig, 'clientFactory'> = {
  enabled: true,
  edgeTimeout: 400,
  cdpTimeout: 400,
  scope: '',
  channel: '',
  currency: '',
  contextId: '0000-0000-0000',
  clientContextId: '0000-0000-0000',
  edgeUrl: 'https://foo.bar',
  sites: [],
};

const calledWith = (fn: ReturnType<typeof vi.fn>, ...args: unknown[]) =>
  fn.mock.calls.some((call) => args.every((arg, i) => call[i] === arg));

const createMockEvent = (
  headers: Record<string, string> = {},
  cookies: Record<string, string> = {},
  path: string = '/styleguide'
): H3Event => {
  const req = new IncomingMessage(null as any);
  req.url = path;
  req.headers = {
    host: hostname,
    referer: referrer,
    ...headers,
  };

  if (Object.keys(cookies).length) {
    req.headers.cookie = Object.entries(cookies)
      .map(([k, v]) => `$${k}=$${v}`)
      .join('; ');
  }

  const res = new ServerResponse(req);
  return createEvent(req, res);
};

const createMiddleware = (
  props: {
    [key: string]: unknown;
    config?: Omit<PersonalizeMiddlewareConfig, 'clientFactory'>;
    language?: string;
    siteResolver?: SiteResolver;
    variantId?: string;
    personalizeInfo?: { pageId: string; variantIds: string[] } | null;
    getPersonalizeInfoStub?: ReturnType<typeof vi.fn>;
    personalizeStub?: ReturnType<typeof vi.fn>;
    getClientFactoryStub?: ReturnType<typeof vi.fn>;
    extractGeoDataCb?: ReturnType<typeof vi.fn>;
    defaultHostname?: string;
  } = { config: defaultConfig }
) => {
  const clientFactory = GraphQLRequestClient.createClientFactory({
    apiKey: 'edge-api-key',
    endpoint: 'http://edge-endpoint/api/graph/edge',
  });

  const personalizeConfig = {
    ...defaultConfig,
    ...(props.config ?? {}),
  };

  class MockSiteResolver extends SiteResolver {
    getByName = vi.fn().mockImplementation((name: string) => ({
      name,
      language: props.language ?? '',
      hostName: hostname,
    }));

    getByHost = vi.fn().mockImplementation((hostName: string) => ({
      name: siteName,
      language: props.language ?? '',
      hostName,
    }));
  }

  const siteResolver: SiteResolver = props.siteResolver ?? new MockSiteResolver([]);

  const middleware = new PersonalizeMiddleware({
    ...props,
    ...personalizeConfig,
  });

  middleware['siteResolver'] = siteResolver;

  const initPersonalizeServer = (middleware['initPersonalizeServer'] = vi.fn());

  const getClientFactory = (middleware['getClientFactory'] =
    props.getClientFactoryStub ?? vi.fn().mockReturnValue(clientFactory));

  const personalize = (middleware['personalize'] =
    props.personalizeStub ??
    vi.fn().mockReturnValue(Promise.resolve({ variantId: props.variantId })));

  const getPersonalizeInfo = (middleware['personalizeService'] &&
    (middleware['personalizeService']['getPersonalizeInfo'] =
      props.getPersonalizeInfoStub ??
      vi
        .fn()
        .mockReturnValue(
          Promise.resolve(
            props.personalizeInfo === null
              ? undefined
              : props.personalizeInfo ?? { pageId, variantIds }
          )
        ))) as ReturnType<typeof vi.fn>;

  return {
    middleware,
    getPersonalizeInfo,
    siteResolver,
    initPersonalizeServer,
    personalize,
    getClientFactory,
  };
};

describe('PersonalizeMiddleware', () => {
  let debugSpy: ReturnType<typeof vi.spyOn>;

  const validateDebugLog = (message: string, ...params: unknown[]) => {
    expect(debugSpy.mock.calls.find((log: unknown[]) => log[0] === message)).toEqual([
      message,
      ...params,
    ]);
  };

  const validateEndMessageDebugLog = (message: string, params: unknown) => {
    const logParams = debugSpy.mock.calls.find(
      (log: unknown[]) => log[0] === message
    ) as Array<unknown>;
    expect(logParams?.[2]).toEqual(params);
  };

  beforeEach(() => {
    debugSpy = vi.spyOn(debug, 'personalize').mockImplementation(() => {});
  });

  afterEach(() => {
    debugSpy.mockRestore();
  });

  describe('Extensibility', () => {
    it('should apply custom experience params from getExtraUtmParams, when provided', async () => {
      const customParams = {
        campaign: 'custom_campaign',
        source: 'custom_source',
        medium: 'custom_medium',
        content: 'custom_content',
      };

      const event = createMockEvent();
      const getOverrideExperienceParamsStub = vi.fn().mockReturnValue(customParams);

      const { middleware, getPersonalizeInfo, initPersonalizeServer, personalize } =
        createMiddleware({
          variantId: 'variant-2',
          config: {
            ...defaultConfig,
            getExtraUtmParams: getOverrideExperienceParamsStub,
          },
        });

      await middleware.handle(event);

      validateDebugLog('personalize middleware start: %o', {
        hostname: 'foo.net',
        pathname: '/styleguide',
        language: 'en',
      });

      expect(calledWith(getPersonalizeInfo, '/styleguide', 'en')).toBe(true);
      expect(initPersonalizeServer).toHaveBeenCalledOnce();
      expect(personalize).toHaveBeenCalledOnce();
      expect(getOverrideExperienceParamsStub).toHaveBeenCalledOnce();
      expect(getOverrideExperienceParamsStub).toHaveBeenCalledWith(event);
      expect(personalize).toHaveBeenCalledWith(
        expect.objectContaining({ params: expect.objectContaining({ utm: customParams }) })
      );

      validateEndMessageDebugLog('personalize middleware end in %dms: %o', {
        rewritePath: '/styleguide/_variantId_variant-2',
      });
    });

    it('should use custom personalizeService when provided', async () => {
      const event = createMockEvent();
      const customPersonalizeService = {
        getPersonalizeInfo: vi.fn().mockReturnValue(Promise.resolve({ pageId, variantIds })),
      };

      const { middleware, initPersonalizeServer, personalize } = createMiddleware({
        config: {
          ...defaultConfig,
          personalizeService: customPersonalizeService as any,
        },
        variantId: variantIds[1],
      });

      await middleware.handle(event);

      expect(calledWith(customPersonalizeService.getPersonalizeInfo, '/styleguide', 'en')).toBe(
        true
      );
      expect(initPersonalizeServer).toHaveBeenCalledOnce();
      expect(personalize).toHaveBeenCalledOnce();

      validateDebugLog('personalize middleware start: %o', {
        hostname: 'foo.net',
        pathname: '/styleguide',
        language: 'en',
      });

      validateEndMessageDebugLog('personalize middleware end in %dms: %o', {
        rewritePath: '/styleguide/_variantId_variant-2',
      });
    });
  });

  describe('request skipped', () => {
    describe('preview', () => {
      it('preview cookie is present', async () => {
        const event = createMockEvent({}, { sc_preview: 'true' });
        const { middleware } = createMiddleware();

        vi.spyOn(middleware as any, 'isPreview').mockReturnValue(true);

        await middleware.handle(event);

        validateDebugLog('personalize middleware start: %o', {
          hostname: 'foo.net',
          pathname: '/styleguide',
          language: 'en',
        });
        validateDebugLog('skipped (preview)');
      });
    });

    describe('disabled / skip', () => {
      const test = async (pathname: string, middleware: PersonalizeMiddleware) => {
        const event = createMockEvent({}, {}, pathname);

        await middleware.handle(event);

        const isDisabledGlobally = middleware['config'].enabled === false;
        if (!isDisabledGlobally) {
          validateDebugLog('personalize middleware start: %o', {
            hostname: 'foo.net',
            pathname,
            language: 'en',
          });
        }
        const message = isDisabledGlobally
          ? 'skipped (personalize middleware is disabled globally)'
          : 'skipped (personalize middleware is disabled)';
        validateDebugLog(message);
        debugSpy.mockClear();
      };

      it('default', async () => {
        const { middleware } = createMiddleware();
        await test('/src/image.png', middleware);
        await test('/api/layout/render', middleware);
        await test('/sitecore/render', middleware);
        await test('/_nuxt/webpack', middleware);
      });

      it('should apply both default and custom rules when custom skip function provided', async () => {
        const skip = (event: H3Event) => event.path === '/crazypath/luna';
        const { middleware } = createMiddleware({ config: { ...defaultConfig, skip } });
        await test('/src/image.png', middleware);
        await test('/api/layout/render', middleware);
        await test('/sitecore/render', middleware);
        await test('/_nuxt/webpack', middleware);
        await test('/crazypath/luna', middleware);
      });

      it('should be disabled when "enabled" prop is false', async () => {
        const { middleware } = createMiddleware({ config: { ...defaultConfig, enabled: false } });
        await test('/src/image.png', middleware);
        await test('/api/layout/render', middleware);
        await test('/sitecore/render', middleware);
        await test('/_nuxt/webpack', middleware);
        await test('/crazypath/luna', middleware);
      });
    });

    it('personalize info not found', async () => {
      const event = createMockEvent();
      const { middleware, getPersonalizeInfo } = createMiddleware({ personalizeInfo: null });

      await middleware.handle(event);

      validateDebugLog('personalize middleware start: %o', {
        hostname: 'foo.net',
        pathname: '/styleguide',
        language: 'en',
      });
      expect(calledWith(getPersonalizeInfo, '/styleguide', 'en')).toBe(true);
      validateDebugLog('skipped (personalize info not found)');
    });

    it('no personalization configured', async () => {
      const event = createMockEvent();
      const { middleware, getPersonalizeInfo } = createMiddleware({
        personalizeInfo: { pageId, variantIds: [] },
      });

      await middleware.handle(event);

      validateDebugLog('personalize middleware start: %o', {
        hostname: 'foo.net',
        pathname: '/styleguide',
        language: 'en',
      });
      expect(calledWith(getPersonalizeInfo, '/styleguide', 'en')).toBe(true);
      validateDebugLog('skipped (no personalization configured)');
    });

    it('no variant identified', async () => {
      const event = createMockEvent();
      const { middleware, getPersonalizeInfo, initPersonalizeServer, personalize } =
        createMiddleware({ variantId: undefined });

      await middleware.handle(event);

      validateDebugLog('personalize middleware start: %o', {
        hostname: 'foo.net',
        pathname: '/styleguide',
        language: 'en',
      });
      expect(calledWith(getPersonalizeInfo, '/styleguide', 'en')).toBe(true);
      expect(initPersonalizeServer).toHaveBeenCalled();
      expect(personalize).toHaveBeenCalled();
      validateDebugLog('skipped (no variant(s) identified)');
    });

    it('invalid variant', async () => {
      const invalidVariant = 'invalid-variant';
      const event = createMockEvent();
      const { middleware, getPersonalizeInfo, initPersonalizeServer, personalize } =
        createMiddleware({
          personalizeInfo: { pageId, variantIds },
          variantId: invalidVariant,
        });

      await middleware.handle(event);

      validateDebugLog('personalize middleware start: %o', {
        hostname: 'foo.net',
        pathname: '/styleguide',
        language: 'en',
      });
      expect(calledWith(getPersonalizeInfo, '/styleguide', 'en')).toBe(true);
      expect(initPersonalizeServer).toHaveBeenCalled();
      expect(personalize).toHaveBeenCalled();
      validateDebugLog('invalid variant %s', invalidVariant);
    });

    it('prefetch', async () => {
      const event = createMockEvent({ purpose: 'prefetch' });
      const { middleware } = createMiddleware();

      await middleware.handle(event);

      validateDebugLog('personalize middleware start: %o', {
        hostname: 'foo.net',
        pathname: '/styleguide',
        language: 'en',
      });
      validateDebugLog('skipped (prefetch)');
      expect(event.node.res.getHeader('x-proxy-cache')).toBe('no-cache');
      expect(event.node.res.getHeader('Cache-Control')).toBe('no-store, must-revalidate');
    });
  });

  describe('request passed', () => {
    it('fallback defaultLanguage is used', async () => {
      const language = 'da-DK';
      const event = createMockEvent();

      const { middleware, getPersonalizeInfo, siteResolver, initPersonalizeServer, personalize } =
        createMiddleware({
          language,
          variantId: 'variant-2',
          config: { ...defaultConfig, defaultLanguage: language },
          personalizeInfo: { variantIds, pageId },
        });

      await middleware.handle(event);

      validateDebugLog('personalize middleware start: %o', {
        hostname: 'foo.net',
        pathname: '/styleguide',
        language,
      });
      expect(calledWith(getPersonalizeInfo, '/styleguide', language)).toBe(true);
      expect(initPersonalizeServer).toHaveBeenCalledOnce();
      expect(personalize).toHaveBeenCalledOnce();
      validateEndMessageDebugLog('personalize middleware end in %dms: %o', {
        rewritePath: '/styleguide/_variantId_variant-2',
      });
      expect((siteResolver.getByHost as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe(hostname);
    });

    it('fallback locale is used', async () => {
      const event = createMockEvent();
      const { middleware, getPersonalizeInfo, siteResolver, initPersonalizeServer, personalize } =
        createMiddleware({ variantId: 'variant-2' });

      await middleware.handle(event);

      validateDebugLog('personalize middleware start: %o', {
        hostname: 'foo.net',
        pathname: '/styleguide',
        language: 'en',
      });
      expect(calledWith(getPersonalizeInfo, '/styleguide', 'en')).toBe(true);
      expect(initPersonalizeServer).toHaveBeenCalledOnce();
      expect(personalize).toHaveBeenCalledOnce();
      validateEndMessageDebugLog('personalize middleware end in %dms: %o', {
        rewritePath: '/styleguide/_variantId_variant-2',
      });
      expect((siteResolver.getByHost as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe(hostname);
    });

    it('custom response object is not provided', async () => {
      const event = createMockEvent();
      const { middleware, getPersonalizeInfo, siteResolver, initPersonalizeServer, personalize } =
        createMiddleware({ variantId: 'variant-2' });

      await middleware.handle(event);

      expect(calledWith(getPersonalizeInfo, '/styleguide', 'en')).toBe(true);
      expect(initPersonalizeServer).toHaveBeenCalledOnce();
      expect(personalize).toHaveBeenCalledOnce();
      validateDebugLog('personalize middleware start: %o', {
        hostname: 'foo.net',
        pathname: '/styleguide',
        language: 'en',
      });
      validateEndMessageDebugLog('personalize middleware end in %dms: %o', {
        rewritePath: '/styleguide/_variantId_variant-2',
      });
      expect((siteResolver.getByHost as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe(hostname);
    });

    it('optional experience params are not present', async () => {
      const event = createMockEvent({ referer: '' });
      const { middleware, getPersonalizeInfo, siteResolver, initPersonalizeServer, personalize } =
        createMiddleware({ variantId: 'variant-2' });

      await middleware.handle(event);

      validateDebugLog('personalize middleware start: %o', {
        hostname: 'foo.net',
        pathname: '/styleguide',
        language: 'en',
      });
      expect(calledWith(getPersonalizeInfo, '/styleguide', 'en')).toBe(true);
      expect(initPersonalizeServer).toHaveBeenCalledOnce();
      expect(personalize).toHaveBeenCalledOnce();
      validateEndMessageDebugLog('personalize middleware end in %dms: %o', {
        rewritePath: '/styleguide/_variantId_variant-2',
      });
      expect((siteResolver.getByHost as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe(hostname);
    });

    it('sc_site cookie is provided', async () => {
      const event = createMockEvent({}, { [SITE_KEY]: 'foo' });
      const { middleware, getPersonalizeInfo, initPersonalizeServer, personalize, siteResolver } =
        createMiddleware({ variantId: 'variant-2' });

      vi.spyOn(middleware as any, 'getSite').mockReturnValue({
        name: 'foo',
        language: 'en',
        hostName: hostname,
      });

      await middleware.handle(event);

      validateDebugLog('personalize middleware start: %o', {
        hostname: 'foo.net',
        pathname: '/styleguide',
        language: 'en',
      });
      expect(getPersonalizeInfo).toHaveBeenCalledWith('/styleguide', 'en', 'foo');
      expect(initPersonalizeServer).toHaveBeenCalledOnce();
      expect(personalize).toHaveBeenCalledOnce();
      validateEndMessageDebugLog('personalize middleware end in %dms: %o', {
        rewritePath: '/styleguide/_variantId_variant-2',
      });
      expect((siteResolver.getByHost as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(0);
      expect((siteResolver.getByName as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(0);
    });

    it('x-sc-rewrite header is provided', async () => {
      const event = createMockEvent();
      event.node.res.setHeader('x-sc-rewrite', '/_site_nextjs-app/styleguide/');
      const { middleware, getPersonalizeInfo, initPersonalizeServer, personalize, siteResolver } =
        createMiddleware({ variantId: 'variant-2' });

      await middleware.handle(event);

      validateDebugLog('personalize middleware start: %o', {
        hostname: 'foo.net',
        pathname: '/styleguide',
        language: 'en',
      });
      expect(getPersonalizeInfo).toHaveBeenCalledWith('/styleguide', 'en', siteName);
      expect(initPersonalizeServer).toHaveBeenCalledOnce();
      expect(personalize).toHaveBeenCalledOnce();
      validateEndMessageDebugLog('personalize middleware end in %dms: %o', {
        rewritePath: '/_site_nextjs-app/styleguide/_variantId_variant-2',
      });
      expect((siteResolver.getByHost as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe(hostname);
    });

    it('default fallback hostname is used', async () => {
      const event = createMockEvent({ host: '' });
      const { middleware, getPersonalizeInfo, initPersonalizeServer, personalize, siteResolver } =
        createMiddleware({ variantId: 'variant-2' });

      await middleware.handle(event);

      validateDebugLog('personalize middleware start: %o', {
        hostname: 'localhost',
        pathname: '/styleguide',
        language: 'en',
      });
      expect(getPersonalizeInfo).toHaveBeenCalledWith('/styleguide', 'en', siteName);
      expect(initPersonalizeServer).toHaveBeenCalledOnce();
      expect(personalize).toHaveBeenCalledOnce();
      validateEndMessageDebugLog('personalize middleware end in %dms: %o', {
        rewritePath: '/styleguide/_variantId_variant-2',
      });
      expect((siteResolver.getByHost as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe(
        'localhost'
      );
    });

    it('custom fallback hostname is used', async () => {
      const event = createMockEvent({ host: '' });
      const { middleware, getPersonalizeInfo, initPersonalizeServer, personalize, siteResolver } =
        createMiddleware({ variantId: 'variant-2', defaultHostname: 'foobar' });

      await middleware.handle(event);

      expect(initPersonalizeServer).toHaveBeenCalledOnce();
      expect(personalize).toHaveBeenCalledOnce();
      validateDebugLog('personalize middleware start: %o', {
        hostname: 'foobar',
        pathname: '/styleguide',
        language: 'en',
      });
      expect(getPersonalizeInfo).toHaveBeenCalledWith('/styleguide', 'en', siteName);
      validateEndMessageDebugLog('personalize middleware end in %dms: %o', {
        rewritePath: '/styleguide/_variantId_variant-2',
      });
      expect((siteResolver.getByHost as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe('foobar');
    });

    it('configured scope is used', async () => {
      const scope = 'myscope';
      const event = createMockEvent();
      const personalizeStub = vi.fn().mockReturnValue(Promise.resolve({ variantId: undefined }));
      const { middleware, getPersonalizeInfo, personalize } = createMiddleware({
        config: { ...defaultConfig, scope },
        personalizeInfo: { pageId, variantIds: ['variant1'] },
        personalizeStub,
      });

      await middleware.handle(event);

      expect(getPersonalizeInfo).toHaveBeenCalledWith('/styleguide', 'en', siteName);
      expect(personalize).toHaveBeenCalledWith(
        expect.objectContaining({ friendlyId: CdpHelper.getPageFriendlyId(pageId, 'en', scope) })
      );
    });

    it('configured timeouts are used', async () => {
      const edgeTimeout = 1000;
      const cdpTimeout = 1000;
      const event = createMockEvent();
      const personalizeStub = vi.fn().mockReturnValue(Promise.resolve({ variantId: undefined }));
      const { middleware, personalize } = createMiddleware({
        config: { ...defaultConfig, edgeTimeout, cdpTimeout },
        personalizeInfo: { pageId, variantIds: ['variant1'] },
        personalizeStub,
      });

      await middleware.handle(event);

      expect(middleware['personalizeService']).not.toBeNull();
      if (middleware['personalizeService']) {
        expect(middleware['personalizeService']['config'].timeout).toBe(edgeTimeout);
      }
      expect(personalize).toHaveBeenCalledWith(expect.objectContaining({ timeout: cdpTimeout }));
    });

    it('component testing is executed', async () => {
      const event = createMockEvent();
      const personalizeStub = vi.fn().mockImplementation(({ friendlyId }) => {
        if (friendlyId === CdpHelper.getComponentFriendlyId(pageId, 'component1', 'en')) {
          return Promise.resolve({ variantId: 'component1_default' });
        }
        if (friendlyId === CdpHelper.getComponentFriendlyId(pageId, 'component2', 'en')) {
          return Promise.resolve({ variantId: 'component2_variant1' });
        }
        if (friendlyId === CdpHelper.getComponentFriendlyId(pageId, 'component3', 'en')) {
          return Promise.resolve({ variantId: 'component3_variant3' });
        }
        return Promise.resolve({ variantId: undefined });
      });

      const { middleware, getPersonalizeInfo, initPersonalizeServer } = createMiddleware({
        personalizeInfo: {
          pageId,
          variantIds: [
            'component1_variant1',
            'component2_variant1',
            'component2_variant2',
            'component3_variant1',
            'component3_variant2',
            'component3_variant3',
          ],
        },
        personalizeStub,
      });

      await middleware.handle(event);

      expect(calledWith(getPersonalizeInfo, '/styleguide', 'en')).toBe(true);
      expect(initPersonalizeServer).toHaveBeenCalledOnce();
      expect(personalizeStub).toHaveBeenCalledTimes(3);
      validateDebugLog('personalize middleware start: %o', {
        hostname: 'foo.net',
        pathname: '/styleguide',
        language: 'en',
      });
      validateEndMessageDebugLog('personalize middleware end in %dms: %o', {
        rewritePath:
          '/styleguide/_variantId_component1_default/_variantId_component2_variant1/_variantId_component3_variant3',
      });
    });

    describe('geo data', () => {
      const geo = { country: 'US', region: 'CA', city: 'San Francisco' };
      const personalizeInfo = {
        pageId,
        variantIds: [
          'component1_variant1',
          'component2_variant1',
          'component2_variant2',
          'component3_variant1',
          'component3_variant2',
          'component3_variant3',
        ],
      };

      afterEach(() => {
        CDKPersonalizeStub.mockReset();
        CDKPersonalizeStub.mockResolvedValue({ variantId: 'variant-2' });
      });

      it('should call personalize with geo data', async () => {
        const event = createMockEvent();
        const extractGeoDataCb = vi.fn().mockReturnValue(geo);
        const { middleware, initPersonalizeServer } = createMiddleware({
          personalizeInfo,
          extractGeoDataCb,
        });

        middleware['personalize'] = PersonalizeMiddleware.prototype['personalize'];

        await middleware.handle(event);

        validateDebugLog('personalize middleware start: %o', {
          geo,
          hostname: 'foo.net',
          pathname: '/styleguide',
          language: 'en',
        });

        expect(extractGeoDataCb).toHaveBeenCalledOnce();
        expect(initPersonalizeServer).toHaveBeenCalledOnce();
        expect(CDKPersonalizeStub.mock.calls).toHaveLength(3);
        expect(CDKPersonalizeStub.mock.calls[0][0].geo).toEqual(geo);
        expect(CDKPersonalizeStub.mock.calls[1][0].geo).toEqual(geo);
        expect(CDKPersonalizeStub.mock.calls[2][0].geo).toEqual(geo);
      });

      it('should call personalize with geo data when an async cb is provided', async () => {
        const event = createMockEvent();
        const extractGeoDataCb = vi.fn().mockResolvedValue(geo);
        const { middleware, initPersonalizeServer } = createMiddleware({
          extractGeoDataCb,
          personalizeInfo,
        });

        middleware['personalize'] = PersonalizeMiddleware.prototype['personalize'];

        await middleware.handle(event);

        validateDebugLog('personalize middleware start: %o', {
          geo,
          hostname: 'foo.net',
          pathname: '/styleguide',
          language: 'en',
        });

        expect(extractGeoDataCb).toHaveBeenCalledOnce();
        expect(initPersonalizeServer).toHaveBeenCalledOnce();
        expect(CDKPersonalizeStub.mock.calls).toHaveLength(3);
        expect(CDKPersonalizeStub.mock.calls[0][0].geo).toEqual(geo);
        expect(CDKPersonalizeStub.mock.calls[1][0].geo).toEqual(geo);
        expect(CDKPersonalizeStub.mock.calls[2][0].geo).toEqual(geo);
      });

      it('should call personalize without geo data when not available', async () => {
        const event = createMockEvent();
        const { middleware, initPersonalizeServer } = createMiddleware({ personalizeInfo });

        middleware['personalize'] = PersonalizeMiddleware.prototype['personalize'];

        await middleware.handle(event);

        expect(initPersonalizeServer).toHaveBeenCalledOnce();
        expect(CDKPersonalizeStub.mock.calls).toHaveLength(3);
        expect(CDKPersonalizeStub.mock.calls[0][0]).not.toHaveProperty('geo');
        expect(CDKPersonalizeStub.mock.calls[1][0]).not.toHaveProperty('geo');
        expect(CDKPersonalizeStub.mock.calls[2][0]).not.toHaveProperty('geo');
      });
    });

    describe('getLanguage', () => {
      it('should get language from locale response header if present', async () => {
        const languageInHeader = 'fr-FR';
        const language = 'da-DK';
        const event = createMockEvent();
        event.node.res.setHeader('x-sc-locale', languageInHeader);

        const { middleware, getPersonalizeInfo } = createMiddleware({
          language,
          variantId: 'variant-2',
          config: { ...defaultConfig, defaultLanguage: language },
          personalizeInfo: { variantIds, pageId },
        });

        await middleware.handle(event);

        validateDebugLog('personalize middleware start: %o', {
          hostname: 'foo.net',
          pathname: '/styleguide',
          language: languageInHeader,
        });
        expect(calledWith(getPersonalizeInfo, '/styleguide', languageInHeader)).toBe(true);
      });

      it('should get language from defaultLanguage if locale header is not present', async () => {
        const language = 'da-DK';
        const event = createMockEvent();

        const { middleware, getPersonalizeInfo } = createMiddleware({
          language,
          variantId: 'variant-2',
          config: { ...defaultConfig, defaultLanguage: language },
          personalizeInfo: { variantIds, pageId },
        });

        await middleware.handle(event);

        validateDebugLog('personalize middleware start: %o', {
          hostname: 'foo.net',
          pathname: '/styleguide',
          language,
        });
        expect(calledWith(getPersonalizeInfo, '/styleguide', language)).toBe(true);
      });
    });
  });

  describe('error handling', () => {
    it('should log error when getPersonalizeInfo throws', async () => {
      const event = createMockEvent();
      const error = new Error('Edge fails');
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const getPersonalizeInfoWithError = vi.fn().mockImplementation(() => {
        throw error;
      });

      const { middleware, getPersonalizeInfo, initPersonalizeServer, personalize } =
        createMiddleware({
          getPersonalizeInfoStub: getPersonalizeInfoWithError,
        });

      await middleware.handle(event);

      expect(initPersonalizeServer).not.toHaveBeenCalled();
      expect(personalize).not.toHaveBeenCalled();
      expect(getPersonalizeInfo).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 'Personalize middleware failed:');
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, error);
    });
  });

  describe('configuration - Edge API required', () => {
    it('gracefully disables when Edge config is missing', () => {
      const middleware = new PersonalizeMiddleware({
        enabled: true,
        edgeTimeout: 400,
        cdpTimeout: 400,
        sites: [],
      } as any);

      expect(middleware).not.toBeUndefined();
      expect(middleware['personalizeService']).toBeNull();
    });

    it('skips execution when personalizeService is null', async () => {
      const event = createMockEvent();
      const middleware = new PersonalizeMiddleware({
        enabled: true,
        edgeTimeout: 400,
        cdpTimeout: 400,
        sites: [],
      } as any);

      await middleware.handle(event);

      validateDebugLog('skipped (personalize service not configured - edge config required)');
    });

    it('works normally when Edge config is provided', () => {
      const middleware = new PersonalizeMiddleware({
        enabled: true,
        contextId: 'edge-context-id',
        clientContextId: 'edge-client-id',
        edgeUrl: 'https://edge.url',
        edgeTimeout: 400,
        cdpTimeout: 400,
        sites: [],
      } as any);

      expect(middleware).not.toBeUndefined();
      expect(middleware['personalizeService']).not.toBeNull();
    });
  });
});
