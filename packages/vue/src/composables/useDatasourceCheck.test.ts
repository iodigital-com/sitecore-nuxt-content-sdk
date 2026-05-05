/* eslint-disable react-hooks/rules-of-hooks */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, toRef } from 'vue';
import { LayoutServicePageState } from '@sitecore-content-sdk/content/layout';
import type { ComponentRendering } from '@sitecore-content-sdk/content/layout';
import { useDatasourceCheck } from './useDatasourceCheck';

vi.mock('./useSitecoreContext');
import { useSitecoreContext } from './useSitecoreContext';

const makePage = (isEditing = false, isDesignLibrary = false) => ({
  locale: 'en',
  layout: { sitecore: { context: {}, route: null } },
  mode: {
    name: LayoutServicePageState.Normal,
    isNormal: !isEditing,
    isPreview: false,
    isEditing,
    isDesignLibrary,
    designLibrary: { isVariantGeneration: false },
  },
});

const mountWithComposable = (
  rendering: Partial<ComponentRendering>,
  options?: { editingErrorComponent?: any },
  isEditing = false,
  isDesignLibrary = false
) => {
  vi.mocked(useSitecoreContext).mockReturnValue({
    page: { value: makePage(isEditing, isDesignLibrary) } as any,
    sitecoreContext: { value: {} } as any,
  });

  return mount(
    defineComponent({
      setup() {
        const { renderState, errorComponent } = useDatasourceCheck(
          toRef({ rendering } as any, 'rendering'),
          options
        );
        return () => {
          if (renderState.value === 'null') return null;
          if (renderState.value === 'error') return h(errorComponent.value);
          return h('div', [h('h2', rendering.componentName), h('p', rendering.dataSource)]);
        };
      },
    })
  );
};

describe('useDatasourceCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null if datasource missing in normal mode', () => {
    const wrapper = mountWithComposable({ componentName: 'TestComponent', dataSource: '' });
    expect(wrapper.html()).toBe('');
  });

  it('should return null if rendering missing in normal mode', () => {
    const wrapper = mountWithComposable({});
    expect(wrapper.html()).toBe('');
  });

  it('should return default error component if datasource missing in editing mode', () => {
    const wrapper = mountWithComposable(
      { componentName: 'TestComponent', dataSource: '' },
      undefined,
      true
    );
    expect(wrapper.html()).toContain('sc-jss-editing-error');
  });

  it('should return custom error component if specified', () => {
    const CustomEditingError = defineComponent({
      setup: () => () => h('div', 'Better than yours'),
    });

    const wrapper = mountWithComposable(
      { componentName: 'TestComponent', dataSource: '' },
      { editingErrorComponent: CustomEditingError },
      true
    );
    expect(wrapper.html()).toContain('Better than yours');
  });

  it('should return component if rendered in DesignLibrary', () => {
    const wrapper = mountWithComposable(
      { componentName: 'TestComponent', dataSource: '' },
      undefined,
      false,
      true
    );
    expect(wrapper.html()).toContain('TestComponent');
  });

  it('should return component if datasource present in normal mode', () => {
    const wrapper = mountWithComposable({
      componentName: 'TestComponent',
      dataSource: '{CACDB205-2386-4271-9F05-AE20AAC2A39E}',
    });
    expect(wrapper.html()).toContain('TestComponent');
    expect(wrapper.html()).toContain('{CACDB205-2386-4271-9F05-AE20AAC2A39E}');
  });

  it('should return component if datasource present in editing mode', () => {
    const wrapper = mountWithComposable(
      {
        componentName: 'TestComponent',
        dataSource: '{CACDB205-2386-4271-9F05-AE20AAC2A39E}',
      },
      undefined,
      true
    );
    expect(wrapper.html()).toContain('TestComponent');
    expect(wrapper.html()).toContain('{CACDB205-2386-4271-9F05-AE20AAC2A39E}');
  });
});
