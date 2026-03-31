/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
import sinon, { spy } from 'sinon';
import { expect } from 'chai';
import { describe, it, beforeEach, afterEach, vi } from 'vitest';
import { createEvent, H3Event } from 'h3';
import { IncomingMessage, ServerResponse } from 'http';
import { GraphQLRequestClient } from '@sitecore-content-sdk/core';
import { SiteResolver } from '@sitecore-content-sdk/content/site';
import { CdpHelper } from '@sitecore-content-sdk/content/personalize';
import { PersonalizeMiddleware, PersonalizeMiddlewareConfig } from './personalize-middleware';
import debug from '../debug';

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
      .map(([k, v]) => `${k}=${v}`)
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
    getPersonalizeInfoStub?: sinon.SinonStub;
    personalizeStub?: sinon.SinonStub;
    handleCookieStub?: sinon.SinonStub;
    getClientFactoryStub?: sinon.SinonStub;
    extractGeoDataCb?: sinon.SinonStub;
    defaultHostname?: string;
  } = { config: defaultConfig }
) => {
  const sandbox = sinon.createSandbox();

  const clientFactory = GraphQLRequestClient.createClientFactory({
    apiKey: 'edge-api-key',
    endpoint: 'http://edge-endpoint/api/graph/edge',
  });

  const personalizeConfig = {
    ...defaultConfig,
    ...(props.config ?? {}),
  };

  class MockSiteResolver extends SiteResolver {
    getByName = sandbox.stub().callsFake((name: string) => ({
      name,
      language: props.language ?? '',
      hostName: hostname,
    }));

    getByHost = sandbox.stub().callsFake((hostName: string) => ({
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

  const initPersonalizeServer = (middleware['initPersonalizeServer'] = sandbox.stub());

  const getClientFactory = (middleware['getClientFactory'] =
    props.getClientFactoryStub ?? sandbox.stub().returns(clientFactory));

  const personalize = (middleware['personalize'] =
    props.personalizeStub ??
    sandbox.stub().returns(Promise.resolve({ variantId: props.variantId })));

  const getPersonalizeInfo = (middleware['personalizeService'] &&
    (middleware['personalizeService']['getPersonalizeInfo'] =
      props.getPersonalizeInfoStub ??
      sandbox
        .stub()
        .returns(
          Promise.resolve(
            props.personalizeInfo === null
              ? undefined
              : props.personalizeInfo ?? { pageId, variantIds }
          )
        ))) as sinon.SinonStub;

  return {
    middleware,
    getPersonalizeInfo,
    siteResolver,
    initPersonalizeServer,
    personalize,
    getClientFactory,
    sandbox,
  };
};

describe('PersonalizeMiddleware', () => {
  const sandbox = sinon.createSandbox();
  const debugSpy = spy(debug, 'personalize');

  const validateDebugLog = (message: string, ...params: unknown[]) => {
    expect(debugSpy.args.find((log) => log[0] === message)).to.deep.equal([message, ...params]);
  };

  const validateEndMessageDebugLog = (message: string, params: unknown) => {
    const logParams = debugSpy.args.find((log) => log[0] === message) as Array<unknown>;
    expect(logParams?.[2]).to.deep.equal(params);
  };

  beforeEach(() => {
    debugSpy.resetHistory();
  });

  afterEach(() => {
    sandbox.restore();
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
      const getOverrideExperienceParamsStub = sandbox.stub().returns(customParams);

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

      expect(getPersonalizeInfo.calledWith('/styleguide', 'en')).to.be.true;
      expect(initPersonalizeServer.calledOnce).to.be.true;
      expect(personalize.calledOnce).to.be.true;
      expect(getOverrideExperienceParamsStub.calledOnceWith(event)).to.be.true;
      expect(personalize.calledWith(sandbox.match({ params: { utm: customParams } }))).to.be.true;

      validateEndMessageDebugLog('personalize middleware end in %dms: %o', {
        rewritePath: '/styleguide/_variantId_variant-2',
      });
    });

    it('should use custom personalizeService when provided', async () => {
      const event = createMockEvent();
      const customPersonalizeService = {
        getPersonalizeInfo: sandbox.stub().returns(Promise.resolve({ pageId, variantIds })),
      };

      const { middleware, initPersonalizeServer, personalize } = createMiddleware({
        config: {
          ...defaultConfig,
          personalizeService: customPersonalizeService as any,
        },
        variantId: variantIds[1],
      });

      await middleware.handle(event);

      expect(customPersonalizeService.getPersonalizeInfo.calledWith('/styleguide', 'en')).to.be
        .true;
      expect(initPersonalizeServer.calledOnce).to.be.true;
      expect(personalize.calledOnce).to.be.true;

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
        debugSpy.resetHistory();
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
      expect(getPersonalizeInfo.calledWith('/styleguide', 'en')).to.be.true;
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
      expect(getPersonalizeInfo.calledWith('/styleguide', 'en')).to.be.true;
      validateDebugLog('skipped (no personalization configured)');
    });

    it('no variant identified', async () => {
      const event = createMockEvent();
      const { middleware, getPersonalizeInfo, initPersonalizeServer, personalize } =
        createMiddleware({
          variantId: undefined,
        });

      await middleware.handle(event);

      validateDebugLog('personalize middleware start: %o', {
        hostname: 'foo.net',
        pathname: '/styleguide',
        language: 'en',
      });
      expect(getPersonalizeInfo.calledWith('/styleguide', 'en')).to.be.true;
      expect(initPersonalizeServer.called).to.be.true;
      expect(personalize.called).to.be.true;
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
      expect(getPersonalizeInfo.calledWith('/styleguide', 'en')).to.be.true;
      expect(initPersonalizeServer.called).to.be.true;
      expect(personalize.called).to.be.true;
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
      expect(event.node.res.getHeader('x-proxy-cache')).to.equal('no-cache');
      expect(event.node.res.getHeader('Cache-Control')).to.equal('no-store, must-revalidate');
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
      expect(getPersonalizeInfo.calledWith('/styleguide', language)).to.be.true;
      expect(initPersonalizeServer.calledOnce).to.be.true;
      expect(personalize.calledOnce).to.be.true;
      validateEndMessageDebugLog('personalize middleware end in %dms: %o', {
        rewritePath: '/styleguide/_variantId_variant-2',
      });
      expect((siteResolver.getByHost as sinon.SinonStub).calledWith(hostname)).to.be.true;
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
      expect(getPersonalizeInfo.calledWith('/styleguide', 'en')).to.be.true;
      expect(initPersonalizeServer.calledOnce).to.be.true;
      expect(personalize.calledOnce).to.be.true;
      validateEndMessageDebugLog('personalize middleware end in %dms: %o', {
        rewritePath: '/styleguide/_variantId_variant-2',
      });
      expect((siteResolver.getByHost as sinon.SinonStub).calledWith(hostname)).to.be.true;
    });

    it('custom response object is not provided', async () => {
      const event = createMockEvent();
      const { middleware, getPersonalizeInfo, siteResolver, initPersonalizeServer, personalize } =
        createMiddleware({ variantId: 'variant-2' });

      await middleware.handle(event);

      expect(getPersonalizeInfo.calledWith('/styleguide', 'en')).to.be.true;
      expect(initPersonalizeServer.calledOnce).to.be.true;
      expect(personalize.calledOnce).to.be.true;
      validateDebugLog('personalize middleware start: %o', {
        hostname: 'foo.net',
        pathname: '/styleguide',
        language: 'en',
      });
      validateEndMessageDebugLog('personalize middleware end in %dms: %o', {
        rewritePath: '/styleguide/_variantId_variant-2',
      });
      expect((siteResolver.getByHost as sinon.SinonStub).calledWith(hostname)).to.be.true;
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
      expect(getPersonalizeInfo.calledWith('/styleguide', 'en')).to.be.true;
      expect(initPersonalizeServer.calledOnce).to.be.true;
      expect(personalize.calledOnce).to.be.true;
      validateEndMessageDebugLog('personalize middleware end in %dms: %o', {
        rewritePath: '/styleguide/_variantId_variant-2',
      });
      expect((siteResolver.getByHost as sinon.SinonStub).calledWith(hostname)).to.be.true;
    });

    it('sc_site cookie is provided', async () => {
      const event = createMockEvent({}, { sc_site: 'foo' });
      const { middleware, getPersonalizeInfo, initPersonalizeServer, personalize, siteResolver } =
        createMiddleware({ variantId: 'variant-2' });

      await middleware.handle(event);

      validateDebugLog('personalize middleware start: %o', {
        hostname: 'foo.net',
        pathname: '/styleguide',
        language: 'en',
      });
      expect(getPersonalizeInfo.calledWith('/styleguide', 'en', 'foo')).to.be.true;
      expect(initPersonalizeServer.calledOnce).to.be.true;
      expect(personalize.calledOnce).to.be.true;
      validateEndMessageDebugLog('personalize middleware end in %dms: %o', {
        rewritePath: '/styleguide/_variantId_variant-2',
      });
      expect((siteResolver.getByHost as sinon.SinonStub).called).to.be.false;
      expect((siteResolver.getByName as sinon.SinonStub).calledOnceWith('foo')).to.be.true;
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
      expect(getPersonalizeInfo.calledWith('/styleguide', 'en', siteName)).to.be.true;
      expect(initPersonalizeServer.calledOnce).to.be.true;
      expect(personalize.calledOnce).to.be.true;
      validateEndMessageDebugLog('personalize middleware end in %dms: %o', {
        rewritePath: '/_site_nextjs-app/styleguide/_variantId_variant-2',
      });
      expect((siteResolver.getByHost as sinon.SinonStub).calledWith(hostname)).to.be.true;
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
      expect(getPersonalizeInfo.calledWith('/styleguide', 'en', siteName)).to.be.true;
      expect(initPersonalizeServer.calledOnce).to.be.true;
      expect(personalize.calledOnce).to.be.true;
      validateEndMessageDebugLog('personalize middleware end in %dms: %o', {
        rewritePath: '/styleguide/_variantId_variant-2',
      });
      expect((siteResolver.getByHost as sinon.SinonStub).calledWith('localhost')).to.be.true;
    });

    it('custom fallback hostname is used', async () => {
      const event = createMockEvent({ host: '' });
      const { middleware, getPersonalizeInfo, initPersonalizeServer, personalize, siteResolver } =
        createMiddleware({ variantId: 'variant-2', defaultHostname: 'foobar' });

      await middleware.handle(event);

      expect(initPersonalizeServer.calledOnce).to.be.true;
      expect(personalize.calledOnce).to.be.true;
      validateDebugLog('personalize middleware start: %o', {
        hostname: 'foobar',
        pathname: '/styleguide',
        language: 'en',
      });
      expect(getPersonalizeInfo.calledWith('/styleguide', 'en', siteName)).to.be.true;
      validateEndMessageDebugLog('personalize middleware end in %dms: %o', {
        rewritePath: '/styleguide/_variantId_variant-2',
      });
      expect((siteResolver.getByHost as sinon.SinonStub).calledWith('foobar')).to.be.true;
    });

    it('configured scope is used', async () => {
      const scope = 'myscope';
      const event = createMockEvent();
      const personalizeStub = sandbox.stub().returns(Promise.resolve({ variantId: undefined }));
      const { middleware, getPersonalizeInfo, personalize } = createMiddleware({
        config: { ...defaultConfig, scope },
        personalizeInfo: { pageId, variantIds: ['variant1'] },
        personalizeStub,
      });

      await middleware.handle(event);

      expect(getPersonalizeInfo.calledWith('/styleguide', 'en', siteName)).to.be.true;
      expect(
        personalize.calledWith(
          sandbox.match({ friendlyId: CdpHelper.getPageFriendlyId(pageId, 'en', scope) })
        )
      ).to.be.true;
    });

    it('configured timeouts are used', async () => {
      const edgeTimeout = 1000;
      const cdpTimeout = 1000;
      const event = createMockEvent();
      const personalizeStub = sandbox.stub().returns(Promise.resolve({ variantId: undefined }));
      const { middleware, personalize } = createMiddleware({
        config: { ...defaultConfig, edgeTimeout, cdpTimeout },
        personalizeInfo: { pageId, variantIds: ['variant1'] },
        personalizeStub,
      });

      await middleware.handle(event);

      expect(middleware['personalizeService']).to.not.be.null;
      if (middleware['personalizeService']) {
        expect(middleware['personalizeService']['config'].timeout).to.equal(edgeTimeout);
      }
      expect(personalize.calledWith(sandbox.match({ timeout: cdpTimeout }))).to.be.true;
    });

    it('component testing is executed', async () => {
      const event = createMockEvent();
      const personalizeStub = sandbox.stub();
      personalizeStub
        .withArgs(
          sandbox.match({
            friendlyId: CdpHelper.getComponentFriendlyId(pageId, 'component1', 'en'),
            variantIds: ['component1_default', 'component1_variant1'],
          })
        )
        .returns(Promise.resolve({ variantId: 'component1_default' }));
      personalizeStub
        .withArgs(
          sandbox.match({
            friendlyId: CdpHelper.getComponentFriendlyId(pageId, 'component2', 'en'),
            variantIds: ['component2_default', 'component2_variant1', 'component2_variant2'],
          })
        )
        .returns(Promise.resolve({ variantId: 'component2_variant1' }));
      personalizeStub
        .withArgs(
          sandbox.match({
            friendlyId: CdpHelper.getComponentFriendlyId(pageId, 'component3', 'en'),
            variantIds: [
              'component3_default',
              'component3_variant1',
              'component3_variant2',
              'component3_variant3',
            ],
          })
        )
        .returns(Promise.resolve({ variantId: 'component3_variant3' }));

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

      expect(getPersonalizeInfo.calledWith('/styleguide', 'en')).to.be.true;
      expect(initPersonalizeServer.calledOnce).to.be.true;
      expect(personalizeStub.calledThrice).to.be.true;
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
        const extractGeoDataCb = sandbox.stub().returns(geo);
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

        expect(extractGeoDataCb.calledOnce).to.be.true;
        expect(initPersonalizeServer.calledOnce).to.be.true;
        expect(CDKPersonalizeStub.mock.calls).to.have.lengthOf(3);
        expect(CDKPersonalizeStub.mock.calls[0][0].geo).to.deep.equal(geo);
        expect(CDKPersonalizeStub.mock.calls[1][0].geo).to.deep.equal(geo);
        expect(CDKPersonalizeStub.mock.calls[2][0].geo).to.deep.equal(geo);
      });

      it('should call personalize with geo data when an async cb is provided', async () => {
        const event = createMockEvent();
        const extractGeoDataCb = sandbox.stub().resolves(geo);
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

        expect(extractGeoDataCb.calledOnce).to.be.true;
        expect(initPersonalizeServer.calledOnce).to.be.true;
        expect(CDKPersonalizeStub.mock.calls).to.have.lengthOf(3);
        expect(CDKPersonalizeStub.mock.calls[0][0].geo).to.deep.equal(geo);
        expect(CDKPersonalizeStub.mock.calls[1][0].geo).to.deep.equal(geo);
        expect(CDKPersonalizeStub.mock.calls[2][0].geo).to.deep.equal(geo);
      });

      it('should call personalize without geo data when not available', async () => {
        const event = createMockEvent();
        const { middleware, initPersonalizeServer } = createMiddleware({ personalizeInfo });

        middleware['personalize'] = PersonalizeMiddleware.prototype['personalize'];

        await middleware.handle(event);

        expect(initPersonalizeServer.calledOnce).to.be.true;
        expect(CDKPersonalizeStub.mock.calls).to.have.lengthOf(3);
        expect(CDKPersonalizeStub.mock.calls[0][0]).to.not.have.property('geo');
        expect(CDKPersonalizeStub.mock.calls[1][0]).to.not.have.property('geo');
        expect(CDKPersonalizeStub.mock.calls[2][0]).to.not.have.property('geo');
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
        expect(getPersonalizeInfo.calledWith('/styleguide', languageInHeader)).to.be.true;
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
        expect(getPersonalizeInfo.calledWith('/styleguide', language)).to.be.true;
      });
    });
  });

  describe('error handling', () => {
    it('should log error when getPersonalizeInfo throws', async () => {
      const event = createMockEvent();
      const error = new Error('Edge fails');
      const consoleLogStub = sandbox.stub(console, 'log');
      const getPersonalizeInfoWithError = sandbox.stub().throws(error);

      const { middleware, getPersonalizeInfo, initPersonalizeServer, personalize } =
        createMiddleware({
          getPersonalizeInfoStub: getPersonalizeInfoWithError,
        });

      await middleware.handle(event);

      expect(initPersonalizeServer.called).to.be.false;
      expect(personalize.called).to.be.false;
      expect(getPersonalizeInfo.called).to.be.true;
      expect(consoleLogStub.getCall(0).calledWith('Personalize middleware failed:')).to.be.true;
      expect(consoleLogStub.getCall(1).calledWith(error)).to.be.true;
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

      expect(middleware).to.not.be.undefined;
      expect(middleware['personalizeService']).to.be.null;
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

      expect(middleware).to.not.be.undefined;
      expect(middleware['personalizeService']).to.not.be.null;
    });
  });
});
