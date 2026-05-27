// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import type { ComponentRendering } from '@sitecore-content-sdk/content/layout';

let capturedOnServerComponentUpdate: ((rendering: ComponentRendering) => Promise<void>) | undefined;

vi.mock('@sitecore-content-sdk/vue', () => ({
  DesignLibrary: defineComponent({
    name: 'DesignLibrary',
    props: {
      onServerComponentUpdate: Function,
    },
    setup(props) {
      capturedOnServerComponentUpdate = props.onServerComponentUpdate as any;
      return () => h('div', { class: 'design-library-mock' });
    },
  }),
}));

vi.mock('nuxt/app', () => ({
  refreshNuxtData: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../composables/useDesignLibraryActions', () => ({
  useDesignLibraryActions: vi.fn(),
}));

import { useDesignLibraryActions } from '../composables/useDesignLibraryActions';
import DesignLibraryNuxt from './DesignLibraryNuxt';

describe('<DesignLibraryNuxt />', () => {
  const updateComponent = vi.fn().mockResolvedValue(undefined);
  const previewComponent = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    capturedOnServerComponentUpdate = undefined;
    vi.mocked(useDesignLibraryActions).mockReturnValue({ updateComponent, previewComponent });
  });

  it('should render DesignLibrary', () => {
    const wrapper = mount(DesignLibraryNuxt);
    expect(wrapper.find('.design-library-mock').exists()).toBe(true);
  });

  it('should pass onServerComponentUpdate to DesignLibrary', () => {
    mount(DesignLibraryNuxt);
    expect(capturedOnServerComponentUpdate).toBeDefined();
  });

  it('should call updateComponent when onServerComponentUpdate is triggered with valid uid', async () => {
    mount(DesignLibraryNuxt);

    const rendering: ComponentRendering = { uid: 'test-uid', componentName: 'TestComponent' };
    await capturedOnServerComponentUpdate!(rendering);

    expect(updateComponent).toHaveBeenCalledWith({ uid: 'test-uid', rendering });
  });

  it('should not call updateComponent when rendering has no uid', async () => {
    mount(DesignLibraryNuxt);

    const rendering = { componentName: 'TestComponent' } as ComponentRendering;
    await capturedOnServerComponentUpdate!(rendering);

    expect(updateComponent).not.toHaveBeenCalled();
  });
});
