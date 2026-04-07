/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-expressions */
import sinon from 'sinon';
import { expect } from 'chai';
import { describe, it, beforeEach, afterEach, vi, expect as vitestExpect } from 'vitest';
import type { Page } from '@sitecore-content-sdk/content/client';
import { LayoutServicePageState } from '@sitecore-content-sdk/content/layout';
import { useSitecorePage } from './useSitecorePages';

const mockPage: Page = {
  layout: {
    sitecore: {
      context: { pageEditing: false, language: 'en' },
      route: { name: 'home', placeholders: {}, itemId: 'item-id' },
    },
  },
  locale: 'en',
  siteName: 'my-site',
  mode: {
    name: LayoutServicePageState.Normal,
    isNormal: true,
    isPreview: false,
    isEditing: false,
    isDesignLibrary: false,
    designLibrary: { isVariantGeneration: false },
  },
};

const getPageStub = sinon.stub().resolves(mockPage);
const getPreviewStub = sinon.stub().resolves(mockPage);
const getDesignLibraryDataStub = sinon.stub().resolves(mockPage);
const getHeadLinksStub = sinon.stub().returns([]);

vi.mock('./useSitecoreClient', () => ({
  useSitecoreClient: () => ({
    getPage: getPageStub,
    getPreview: getPreviewStub,
    getDesignLibraryData: getDesignLibraryDataStub,
    getHeadLinks: getHeadLinksStub,
  }),
}));

const { mockUseRoute, mockUseAsyncData, mockUseHead } = vi.hoisted(() => ({
  mockUseRoute: vi.fn(),
  mockUseAsyncData: vi.fn(),
  mockUseHead: vi.fn(),
}));

vi.mock('nuxt/app', () => ({
  useRoute: mockUseRoute,
  useAsyncData: mockUseAsyncData,
  useHead: mockUseHead,
}));

describe('useSitecorePage', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    getPageStub.resolves(mockPage);
    getPreviewStub.resolves(mockPage);
    getDesignLibraryDataStub.resolves(mockPage);
    getHeadLinksStub.returns([]);
    mockUseHead.mockReturnValue(undefined);
    mockUseAsyncData.mockImplementation((_key: string, fetcher: () => Promise<Page | null>) =>
      fetcher().then((data) => ({
        data: { value: data },
        error: { value: undefined },
        status: { value: 'success' },
      }))
    );
  });

  afterEach(() => {
    sandbox.restore();
    getPageStub.resetHistory();
    getPreviewStub.resetHistory();
    getDesignLibraryDataStub.resetHistory();
    getHeadLinksStub.resetHistory();
    mockUseAsyncData.mockReset();
    mockUseHead.mockReset();
  });

  describe('normal page', () => {
    it('calls getPage with path from slug array', async () => {
      mockUseRoute.mockReturnValue({
        params: { slug: ['producten', 'stoel', 'rood'] },
        query: {},
      });

      const { page } = await useSitecorePage();

      expect(getPageStub.calledWith(['producten', 'stoel', 'rood'])).to.be.true;
      expect(page.value).to.deep.equal(mockPage);
    });

    it('calls getPage with empty array when slug is empty', async () => {
      mockUseRoute.mockReturnValue({
        params: { slug: [] },
        query: {},
      });

      await useSitecorePage();

      expect(getPageStub.calledWith([])).to.be.true;
    });

    it('calls getPage with single string slug wrapped in array', async () => {
      mockUseRoute.mockReturnValue({
        params: { slug: 'about' },
        query: {},
      });

      await useSitecorePage();

      expect(getPageStub.calledWith(['about'])).to.be.true;
    });
  });

  describe('preview mode', () => {
    it('calls getPreview when sc_itemid is present in query', async () => {
      mockUseRoute.mockReturnValue({
        params: { slug: ['home'] },
        query: {
          sc_itemid: 'item-id',
          sc_lang: 'en',
          sc_site: 'my-site',
          mode: 'edit',
        },
      });

      await useSitecorePage();

      expect(getPreviewStub.calledOnce).to.be.true;
      expect(getPageStub.called).to.be.false;
    });
  });

  describe('design library mode', () => {
    it('calls getDesignLibraryData when design library query params are present', async () => {
      mockUseRoute.mockReturnValue({
        params: { slug: ['home'] },
        query: {
          sc_itemid: 'item-id',
          sc_lang: 'en',
          sc_site: 'my-site',
          mode: 'library',
          sc_uid: 'component-uid',
          sc_renderingId: 'rendering-id',
        },
      });

      await useSitecorePage();

      expect(getDesignLibraryDataStub.calledOnce).to.be.true;
      expect(getPageStub.called).to.be.false;
      expect(getPreviewStub.called).to.be.false;
    });
  });

  describe('head links', () => {
    it('calls useHead with head links when page is returned', async () => {
      const headLinks = [{ rel: 'stylesheet', href: 'https://example.com/style.css' }];
      getHeadLinksStub.returns(headLinks);

      mockUseRoute.mockReturnValue({
        params: { slug: ['home'] },
        query: {},
      });

      await useSitecorePage();

      vitestExpect(mockUseHead).toHaveBeenCalledOnce();
      vitestExpect(mockUseHead).toHaveBeenCalledWith({
        link: [{ rel: 'stylesheet', href: 'https://example.com/style.css' }],
      });
    });

    it('does not call useHead when page is null', async () => {
      getPageStub.resolves(null);

      mockUseRoute.mockReturnValue({
        params: { slug: ['not-found'] },
        query: {},
      });

      await useSitecorePage();

      vitestExpect(mockUseHead).not.toHaveBeenCalled();
    });
  });

  describe('return value', () => {
    it('returns page, error and status', async () => {
      mockUseRoute.mockReturnValue({
        params: { slug: ['home'] },
        query: {},
      });

      const result = await useSitecorePage();

      expect(result).to.have.property('page');
      expect(result).to.have.property('error');
      expect(result).to.have.property('status');
    });
  });
});
