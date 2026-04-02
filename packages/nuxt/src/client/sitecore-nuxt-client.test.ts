/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
import sinon from 'sinon';
import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'vitest';
import { SitecoreNuxtClient } from './sitecore-nuxt-client';
import { DefaultRetryStrategy } from '@sitecore-content-sdk/core';
import * as siteTools from '@sitecore-content-sdk/content/site';
import { SITE_PREFIX } from '@sitecore-content-sdk/content/site';
import { VARIANT_PREFIX } from '@sitecore-content-sdk/content/personalize';
import { layoutData, componentsWithExperiencesArray } from '../test-data/personalizeData';

describe('SitecoreNuxtClient', () => {
  const sandbox = sinon.createSandbox();

  const defaultInitOptions = {
    api: {
      edge: {
        contextId: 'test-context-id',
        clientContextId: 'client-context-id',
        edgeUrl: 'https://edge.example.com',
      },
      local: {
        apiHost: 'http://local.example.com',
        apiKey: 'test-api-key',
        path: '/api/graph/test',
      },
    },
    editingSecret: '********-****',
    retries: { count: 3, retryStrategy: sinon.createStubInstance(DefaultRetryStrategy) },
    defaultSite: 'default-site',
    defaultLanguage: 'en',
    layout: { formatLayoutQuery: sandbox.stub() },
    dictionary: { caching: { enabled: true, timeout: 60000 } },
  };

  let sitecoreClient: SitecoreNuxtClient;
  let layoutServiceStub: { fetchLayoutData: sinon.SinonStub };

  beforeEach(() => {
    layoutServiceStub = { fetchLayoutData: sandbox.stub() };

    sitecoreClient = new SitecoreNuxtClient(defaultInitOptions as any);
    sitecoreClient['layoutService'] = layoutServiceStub as any;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getPage', () => {
    it('should personalize page layout when variants present in path', async () => {
      const path = `${VARIANT_PREFIX}variant1/${VARIANT_PREFIX}mountain_bike_audience/test/path`;
      const locale = 'en-US';
      const testLayoutData = structuredClone(layoutData);

      layoutServiceStub.fetchLayoutData.resolves(testLayoutData);

      const result = await sitecoreClient.getPage(path, { locale });

      expect(result?.layout.sitecore.route?.placeholders).to.deep.equal({
        'content-sdk-main': [...componentsWithExperiencesArray],
      });
    });

    it('should use personalize details passed in page options over variants present in path', async () => {
      const path = `${VARIANT_PREFIX}variant1/${VARIANT_PREFIX}sand_bike_audience/test/path`;
      const locale = 'en-US';
      const testLayoutData = structuredClone(layoutData);

      layoutServiceStub.fetchLayoutData.resolves(testLayoutData);

      const result = await sitecoreClient.getPage(path, {
        locale,
        personalize: { variantId: 'variant2', componentVariantIds: ['mountain_bike_audience'] },
      });

      expect(result?.layout.sitecore.route?.placeholders).to.deep.equal({
        'content-sdk-main': [...componentsWithExperiencesArray],
      });
    });

    it('should pass site from path to base getPage method', async () => {
      const path = `${SITE_PREFIX}mysite/test/path`;
      const locale = 'en-US';
      const testLayoutData = structuredClone(layoutData);

      sandbox.stub(sitecoreClient, 'parsePath').returns('/test/path');
      layoutServiceStub.fetchLayoutData.resolves(testLayoutData);

      await sitecoreClient.getPage(path, { locale });

      expect(
        layoutServiceStub.fetchLayoutData.calledWithMatch('/test/path', {
          locale,
          site: 'mysite',
        })
      ).to.be.true;
    });

    it('should use site passed in page options over site parsed from path', async () => {
      const path = `${SITE_PREFIX}mysite/test/path`;
      const locale = 'en-US';
      const testLayoutData = structuredClone(layoutData);

      sandbox.stub(sitecoreClient, 'parsePath').returns('/test/path');
      layoutServiceStub.fetchLayoutData.resolves(testLayoutData);

      await sitecoreClient.getPage(path, { locale, site: 'other-site' });

      expect(
        layoutServiceStub.fetchLayoutData.calledWithMatch('/test/path', {
          locale,
          site: 'other-site',
        })
      ).to.be.true;
    });
  });

  describe('getSiteNameFromPath', () => {
    it('should get site name correctly with string path', () => {
      const path = '/some/path';
      sandbox.stub(siteTools, 'getSiteRewriteData').returns({ siteName: 'default-site' });

      const result = sitecoreClient.getSiteNameFromPath(path);

      expect(result).to.equal('default-site');
    });

    it('should get site name correctly with array path', () => {
      const path = [`${SITE_PREFIX}other-site`, '/some', 'path'];

      const result = sitecoreClient.getSiteNameFromPath(path);

      expect(result).to.equal('other-site');
    });

    it('should get default site name when site not found', () => {
      const path = ['wrong-path', '/some', 'path'];

      const result = sitecoreClient.getSiteNameFromPath(path);

      expect(result).to.equal('default-site');
    });
  });

  describe('parsePath', () => {
    it('should return string path when accepting string[] path', () => {
      const path = ['/some', 'path'];

      const result = sitecoreClient.parsePath(path);

      expect(result).to.equal('/some/path');
    });

    it('should strip site and variant prefixes from path', () => {
      const path = `/${SITE_PREFIX}site1/${VARIANT_PREFIX}variant1/some/path`;

      const result = sitecoreClient.parsePath(path);

      expect(result).to.equal('/some/path');
    });
  });
});
