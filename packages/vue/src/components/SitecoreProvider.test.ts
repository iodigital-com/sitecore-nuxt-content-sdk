/* eslint-disable no-unused-vars */
/* eslint-disable vue/one-component-per-file */
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { Page } from '@sitecore-content-sdk/content/client';
import { LayoutServicePageState } from '../index';
import type { LayoutServiceData } from '../index';
import SitecoreProvider from './SitecoreProvider.vue';
import { useSitecoreContext } from '../composables/useSitecoreContext';

const mockLayoutData: LayoutServiceData = {
  sitecore: {
    context: {
      pageEditing: false,
      site: { name: 'ContentSdkTestWeb' },
      language: 'en',
    },
    route: {
      name: 'styleguide',
      placeholders: { 'ContentSdkTestWeb-main': [] },
      itemId: 'testitemid',
    },
  },
};

const mockPage: Page = {
  layout: mockLayoutData,
  locale: 'en',
  mode: {
    name: LayoutServicePageState.Normal,
    isNormal: true,
    isPreview: false,
    isEditing: false,
    isDesignLibrary: false,
    designLibrary: {
      isVariantGeneration: false,
    },
  },
};

const apiStub = {} as any;
const components = new Map();
const loadImportMap = () => Promise.resolve({ default: [] });

const NestedComponent = defineComponent({
  setup() {
    const { page } = useSitecoreContext();
    return { page };
  },
  template: `<span>Page mode is {{ page.mode.name }}</span>`,
});

describe('SitecoreProvider', () => {
  it('renders the component with the context', () => {
    const wrapper = mount(SitecoreProvider, {
      props: {
        api: apiStub,
        componentMap: components,
        page: mockPage,
        loadImportMap,
      },
      slots: {
        default: NestedComponent,
      },
    });

    expect(wrapper.text()).to.include('Page mode is normal');
  });

  it('updates state when new page is received via props', async () => {
    let capturedPage: Page | undefined;

    const CapturingComponent = defineComponent({
      setup() {
        const { page } = useSitecoreContext();
        capturedPage = page.value;
        return { page };
      },
      template: `<span>{{ page.locale }}</span>`,
    });

    const wrapper = mount(SitecoreProvider, {
      props: {
        api: apiStub,
        componentMap: components,
        page: mockPage,
        loadImportMap,
      },
      slots: {
        default: CapturingComponent,
      },
    });

    expect(wrapper.text()).to.include('en');

    const newMockPage: Page = { ...mockPage, locale: 'gr' };

    await wrapper.setProps({ page: newMockPage });

    expect(wrapper.text()).to.include('gr');
  });
});
