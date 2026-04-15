import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { DesignLibraryPreviewError } from '@sitecore-content-sdk/content/codegen';
import DesignLibraryErrorBoundary from './DesignLibraryErrorBoundary.vue';

const { sendErrorEventMock } = vi.hoisted(() => ({
  sendErrorEventMock: vi.fn(),
}));

vi.mock('@sitecore-content-sdk/content/codegen', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sitecore-content-sdk/content/codegen')>();
  return { ...actual, sendErrorEvent: sendErrorEventMock };
});

// Throws in render, not setup — onErrorCaptured vangt render errors op
const ThrowError = defineComponent({
  props: {
    shouldThrow: { type: Boolean, default: true },
  },
  render() {
    if (this.shouldThrow) {
      throw new Error('Test error');
    }
    return h('div', 'Success');
  },
});

const mountWithErrorHandler = (component: any, options: any) => {
  return mount(component, {
    ...options,
    global: {
      config: {
        errorHandler: () => {},
      },
    },
  });
};

describe('DesignLibraryErrorBoundary', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('normal rendering', () => {
    it('should render children when no error occurs', () => {
      const wrapper = mount(DesignLibraryErrorBoundary, {
        props: { uid: 'test-uid' },
        slots: { default: '<div data-testid="child">Child Content</div>' },
      });

      expect(wrapper.html()).toContain('data-testid="child"');
      expect(wrapper.text()).toContain('Child Content');
      expect(sendErrorEventMock).not.toHaveBeenCalled();
    });
  });

  it('should catch errors, send error event and display error message', async () => {
    const wrapper = mountWithErrorHandler(DesignLibraryErrorBoundary, {
      props: { uid: 'test-uid' },
      slots: { default: () => h(ThrowError) },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Error during component rendering');
    expect(sendErrorEventMock).toHaveBeenCalledOnce();
    expect(sendErrorEventMock).toHaveBeenCalledWith(
      'test-uid',
      expect.any(Error),
      DesignLibraryPreviewError.Render
    );
    expect(sendErrorEventMock.mock.calls[0][1].message).toBe('Test error');
  });

  describe('renderKey handling', () => {
    it('should reset error state when renderKey changes', async () => {
      const wrapper = mountWithErrorHandler(DesignLibraryErrorBoundary, {
        props: { uid: 'test-uid', renderKey: 1 },
        slots: { default: () => h(ThrowError) },
      });

      await flushPromises();
      expect(wrapper.text()).toContain('Error during component rendering');

      await wrapper.setProps({ renderKey: 2 });
      await flushPromises();

      const wrapper2 = mount(DesignLibraryErrorBoundary, {
        props: { uid: 'test-uid', renderKey: 2 },
        slots: { default: () => h(ThrowError, { shouldThrow: false }) },
      });

      expect(wrapper2.text()).toContain('Success');
    });

    it('should work without renderKey prop', () => {
      const wrapper = mount(DesignLibraryErrorBoundary, {
        props: { uid: 'test-uid' },
        slots: { default: '<div>No RenderKey</div>' },
      });

      expect(wrapper.text()).toContain('No RenderKey');
    });

    it('should handle renderKey from undefined to defined', async () => {
      const wrapper = mountWithErrorHandler(DesignLibraryErrorBoundary, {
        props: { uid: 'test-uid' },
        slots: { default: () => h(ThrowError) },
      });

      await flushPromises();
      expect(wrapper.text()).toContain('Error during component rendering');

      await wrapper.setProps({ renderKey: 1 });
      await flushPromises();

      const wrapper2 = mount(DesignLibraryErrorBoundary, {
        props: { uid: 'test-uid', renderKey: 1 },
        slots: { default: () => h(ThrowError, { shouldThrow: false }) },
      });

      expect(wrapper2.text()).toContain('Success');
    });

    it('should increment renderKey to reset error multiple times', async () => {
      const wrapper = mountWithErrorHandler(DesignLibraryErrorBoundary, {
        props: { uid: 'test-uid', renderKey: 1 },
        slots: { default: () => h(ThrowError) },
      });

      await flushPromises();
      expect(wrapper.text()).toContain('Error during component rendering');

      const wrapper2 = mount(DesignLibraryErrorBoundary, {
        props: { uid: 'test-uid', renderKey: 2 },
        slots: { default: () => h(ThrowError, { shouldThrow: false }) },
      });
      expect(wrapper2.text()).toContain('Success');

      const wrapper3 = mountWithErrorHandler(DesignLibraryErrorBoundary, {
        props: { uid: 'test-uid', renderKey: 2 },
        slots: { default: () => h(ThrowError) },
      });
      await flushPromises();
      expect(wrapper3.text()).toContain('Error during component rendering');

      const wrapper4 = mount(DesignLibraryErrorBoundary, {
        props: { uid: 'test-uid', renderKey: 3 },
        slots: { default: () => h(ThrowError, { shouldThrow: false }) },
      });
      expect(wrapper4.text()).toContain('Success');
    });
  });
});
