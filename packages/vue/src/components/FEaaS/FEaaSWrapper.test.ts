import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { h, Suspense } from 'vue';
import FEaaSWrapper from './FEaaSWrapper.vue';
import SitecoreProvider from '../SitecoreProvider.vue';
import { composeComponentEndpoint } from './feaas-utils';
import type { FEaaSComponentParams, FEaaSComponentProps } from './models';
import { LayoutServicePageState } from '@sitecore-content-sdk/content/layout';

vi.mock('./feaas-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./feaas-utils')>();
  return {
    ...actual,
    fetchFEaaSComponentServerProps: vi.fn().mockResolvedValue({
      template: '',
      fetchedData: {},
      revisionFallback: 'published',
    }),
  };
});

vi.mock('@sitecore-feaas/clientside', () => ({}));

const { fetchFEaaSComponentServerProps } = await import('./feaas-utils');

const requiredParams: FEaaSComponentParams = {
  LibraryId: 'library123',
  ComponentId: 'component123',
  ComponentVersion: 'version123',
  ComponentRevision: 'staged',
  ComponentHostName: 'host123',
};

const makePage = (isNormal = true) => ({
  locale: 'en',
  layout: { sitecore: { context: {}, route: null } },
  mode: {
    name: LayoutServicePageState.Normal,
    isNormal,
    isPreview: false,
    isEditing: !isNormal,
    isDesignLibrary: false,
    designLibrary: { isVariantGeneration: false },
  },
});

const mountWrapper = async (props: Partial<FEaaSComponentProps> = {}, isNormal = true) => {
  const wrapper = mount(SitecoreProvider, {
    props: {
      page: makePage(isNormal),
      api: {},
      componentMap: {},
      loadImportMap: () => Promise.resolve({}),
    },
    slots: {
      default: () =>
        h(Suspense, null, {
          default: () => h(FEaaSWrapper, props as FEaaSComponentProps),
          fallback: () => h('div', 'loading'),
        }),
    },
  });

  await flushPromises();
  return wrapper;
};

describe('<FEaaSWrapper />', () => {
  beforeEach(() => {
    vi.mocked(fetchFEaaSComponentServerProps).mockResolvedValue({
      template: '',
      fetchedData: {},
      revisionFallback: 'published',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('composeComponentEndpoint', () => {
    it('should return endpoint with https when hostname from params is missing it', () => {
      const endpoint = composeComponentEndpoint(requiredParams, 'staged');
      expect(endpoint.startsWith('https://')).toBe(true);
    });

    it('should use fallback when revision is not passed via params', () => {
      const params = { ...requiredParams, ComponentRevision: undefined };
      const endpoint = composeComponentEndpoint(params, 'published');
      expect(endpoint.endsWith('/published')).toBe(true);
    });
  });

  it('should not render feaas-component with props and params missing', async () => {
    const wrapper = await mountWrapper({});
    expect(wrapper.html()).not.toContain('<feaas-component');
  });

  it('should not render feaas-component with only one param present', async () => {
    const wrapper = await mountWrapper({ params: { ComponentHostName: 'host123' } });
    expect(wrapper.html()).not.toContain('<feaas-component');
  });

  it('should render feaas-component when required params are provided', async () => {
    const wrapper = await mountWrapper({ params: requiredParams });
    expect(wrapper.html()).toContain('<feaas-component');
    expect(wrapper.html()).toContain('library="library123"');
    expect(wrapper.html()).toContain('component="component123"');
    expect(wrapper.html()).toContain('version="version123"');
    expect(wrapper.html()).toContain('cdn="host123"');
  });

  it('should render feaas-component when template is provided directly', async () => {
    const template = '<div>test output</div>';
    const wrapper = await mountWrapper({ template });
    expect(wrapper.html()).toContain('<feaas-component');
  });

  it('should use revision from params over revisionFallback', async () => {
    const wrapper = await mountWrapper({
      params: { ...requiredParams, ComponentRevision: 'published' },
      revisionFallback: 'staged',
    });
    expect(wrapper.html()).toContain('revision="published"');
  });

  describe('server props fetching', () => {
    it('should call fetchFEaaSComponentServerProps with params and isNormal', async () => {
      await mountWrapper({ params: requiredParams }, true);
      expect(fetchFEaaSComponentServerProps).toHaveBeenCalledWith(requiredParams, true);
    });

    it('should pass isNormal=false in editing mode', async () => {
      await mountWrapper({ params: requiredParams }, false);
      expect(fetchFEaaSComponentServerProps).toHaveBeenCalledWith(requiredParams, false);
    });

    it('should use template from server props', async () => {
      vi.mocked(fetchFEaaSComponentServerProps).mockResolvedValue({
        template: '<div>server template</div>',
        fetchedData: {},
        revisionFallback: 'published',
      });
      const wrapper = await mountWrapper({ template: undefined });
      expect(wrapper.html()).toContain('<feaas-component');
    });

    it('should use props template over server props template', async () => {
      vi.mocked(fetchFEaaSComponentServerProps).mockResolvedValue({
        template: '<div>server template</div>',
        fetchedData: {},
        revisionFallback: 'published',
      });
      const wrapper = await mountWrapper({ template: '<div>override template</div>' });
      expect(wrapper.html()).toContain('<feaas-component');
    });

    it('should handle empty params gracefully', async () => {
      await mountWrapper({ rendering: { uid: 'test', componentName: 'FEaaSWrapper' } });
      expect(fetchFEaaSComponentServerProps).toHaveBeenCalledWith({}, true);
    });

    it('should use revisionFallback from server props', async () => {
      vi.mocked(fetchFEaaSComponentServerProps).mockResolvedValue({
        template: '',
        fetchedData: {},
        revisionFallback: 'staged',
      });
      const wrapper = await mountWrapper({
        params: { ...requiredParams, ComponentRevision: undefined },
      });
      expect(wrapper.html()).toContain('revision="staged"');
    });
  });

  describe('data', () => {
    it('should combine fetchedData with datasource fields', async () => {
      vi.mocked(fetchFEaaSComponentServerProps).mockResolvedValue({
        template: '<h1 data-path="xm.sampleText"></h1>',
        fetchedData: { remote: { value: 'from-server' } },
        revisionFallback: 'published',
      });

      const wrapper = await mountWrapper({
        params: requiredParams,
        fields: { sampleText: { value: 'from-fields' } },
        fetchedData: { custom: { value: 'from-props' } },
      });

      const html = wrapper.html();
      const dataMatch = html.match(/data="([^"]*)"/);
      const data = JSON.parse(dataMatch?.[1].replace(/&quot;/g, '"') ?? '{}');

      expect(data._).toBeDefined();
      expect(data.custom).toBeDefined();
      expect(data.remote).toBeDefined();
    });
  });
});
