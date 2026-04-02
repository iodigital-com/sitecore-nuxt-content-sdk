/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-expressions */
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { Page } from '@sitecore-content-sdk/content/client';
import { LayoutServicePageState } from '../index';
import type { LayoutServiceData } from '../index';
import SitecoreProvider from '../components/SitecoreProvider.vue';
import { useSitecoreContext } from './useSitecoreContext';

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

describe('useSitecoreContext', () => {
  it('returns the page from context', () => {
    let capturedPage: Page | undefined;

    const TestComponent = defineComponent({
      setup() {
        const { page } = useSitecoreContext();
        capturedPage = page.value;
        return {};
      },
      template: `<div />`,
    });

    mount(SitecoreProvider, {
      props: {
        api: apiStub,
        componentMap: components,
        page: mockPage,
        loadImportMap,
      },
      slots: {
        default: TestComponent,
      },
    });

    expect(capturedPage).to.deep.equal(mockPage);
  });

  it('does not expose setPage when updatable is not set', () => {
    const TestComponent = defineComponent({
      setup() {
        const context = useSitecoreContext();
        expect(context.setPage).to.be.undefined;
        return {};
      },
      template: `<div />`,
    });

    mount(SitecoreProvider, {
      props: {
        api: apiStub,
        componentMap: components,
        page: mockPage,
        loadImportMap,
      },
      slots: {
        default: TestComponent,
      },
    });
  });

  it('exposes setPage when updatable is true', () => {
    const TestComponent = defineComponent({
      setup() {
        const context = useSitecoreContext({ updatable: true });
        expect(context.setPage).to.be.a('function');
        return {};
      },
      template: `<div />`,
    });

    mount(SitecoreProvider, {
      props: {
        api: apiStub,
        componentMap: components,
        page: mockPage,
        loadImportMap,
      },
      slots: {
        default: TestComponent,
      },
    });
  });

  it('throws when used outside of SitecoreProvider', () => {
    const TestComponent = defineComponent({
      setup() {
        useSitecoreContext();
        return {};
      },
      template: `<div />`,
    });

    expect(() => mount(TestComponent)).to.throw(
      'useSitecoreContext must be used within a SitecoreProvider'
    );
  });
});
