import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { h } from 'vue';
import { LayoutServicePageState } from '@sitecore-content-sdk/content/layout';
import Form, { mockFormModule } from './Form.vue';
import SitecoreProvider from './SitecoreProvider.vue';

const normalizeHtml = (html: string) =>
  html
    .replace(/\sxmlns="[^"]*"/g, '')
    .replace(/\n\s*/g, '')
    .trim();

describe('Form', () => {
  const ctx = {
    api: {
      edge: {
        contextId: 'server-id',
        clientContextId: 'client-id',
        edgeUrl: 'edge-url',
      },
    },
    page: {
      normal: {
        locale: 'en',
        layout: {
          sitecore: {
            context: { pageEditing: false },
            route: null,
          },
        },
        mode: {
          name: LayoutServicePageState.Normal,
          isNormal: true,
          isPreview: false,
          isEditing: false,
          isDesignLibrary: false,
          designLibrary: { isVariantGeneration: false },
        },
      },
      editing: {
        locale: 'en',
        layout: {
          sitecore: {
            context: { pageEditing: true },
            route: null,
          },
        },
        mode: {
          name: LayoutServicePageState.Edit,
          isEditing: true,
          isNormal: false,
          isPreview: false,
          isDesignLibrary: false,
          designLibrary: { isVariantGeneration: false },
        },
      },
    },
  };

  const rendering = {
    uid: '123',
    params: {
      FormId: '456',
      styles: 'form-class',
      RenderingIdentifier: 'form-id',
    },
  };

  const createWrapper = (page: any, api: any = ctx.api) =>
    mount(SitecoreProvider, {
      props: {
        page,
        api,
        componentMap: {},
        loadImportMap: () => Promise.resolve({}),
      },
      slots: {
        default: () => h(Form, { rendering, params: rendering.params }),
      },
    });

  beforeEach(() => {
    mockFormModule({
      loadForm: vi.fn().mockResolvedValue(''),
      subscribeToFormSubmitEvent: vi.fn(),
      executeScriptElements: vi.fn(),
    });
  });

  it('renders form using clientContextId when both IDs are present', async () => {
    const loadFormSpy = vi.fn((edgeId: string, formId: string, edgeUrl?: string) => {
      expect(edgeId).toBe('client-id');
      expect(formId).toBe('456');
      expect(edgeUrl).toBe('edge-url');
      return Promise.resolve('<form id="test-form"><script>console.log(1);</script></form>');
    });
    const subscribeSpy = vi.fn();
    const execSpy = vi.fn();

    mockFormModule({
      loadForm: loadFormSpy,
      subscribeToFormSubmitEvent: subscribeSpy,
      executeScriptElements: execSpy,
    });

    const wrapper = createWrapper(ctx.page.normal);
    await flushPromises();

    expect(loadFormSpy).toHaveBeenCalledTimes(1);
    expect(subscribeSpy).toHaveBeenCalledTimes(1);
    expect(execSpy).toHaveBeenCalledTimes(1);
    expect(normalizeHtml(wrapper.html())).toContain(
      '<div class="form-class" id="form-id">' +
        '<form id="test-form"><script>console.log(1);</script></form></div>'
    );
  });

  it('does not load form when clientContextId is missing', async () => {
    const apiNoClientId = {
      edge: {
        contextId: 'server-only',
        edgeUrl: 'edge-url',
      },
    };

    const loadFormSpy = vi.fn().mockResolvedValue('<form></form>');

    mockFormModule({
      loadForm: loadFormSpy,
      subscribeToFormSubmitEvent: vi.fn(),
      executeScriptElements: vi.fn(),
    });

    const wrapper = createWrapper(ctx.page.normal, apiNoClientId);
    await flushPromises();

    expect(loadFormSpy).not.toHaveBeenCalled();
    expect(normalizeHtml(wrapper.html())).toContain('<div class="form-class" id="form-id"></div>');
  });

  it('renders form in edit mode (scripts executed, no submit subscription)', async () => {
    const loadFormSpy = vi
      .fn()
      .mockResolvedValue('<form id="test-form"><script>console.log(1);</script></form>');
    const subscribeSpy = vi.fn();
    const execSpy = vi.fn();

    mockFormModule({
      loadForm: loadFormSpy,
      subscribeToFormSubmitEvent: subscribeSpy,
      executeScriptElements: execSpy,
    });

    const wrapper = createWrapper(ctx.page.editing);
    await flushPromises();

    expect(loadFormSpy).toHaveBeenCalledTimes(1);
    expect(subscribeSpy).not.toHaveBeenCalled();
    expect(execSpy).toHaveBeenCalledTimes(1);
    expect(wrapper.html()).toContain('<form id="test-form">');
  });

  it('renders empty div on load failure in normal mode', async () => {
    mockFormModule({
      loadForm: vi.fn().mockRejectedValue(new Error()),
      subscribeToFormSubmitEvent: vi.fn(),
      executeScriptElements: vi.fn(),
    });

    const wrapper = createWrapper(ctx.page.normal);
    await flushPromises();

    expect(normalizeHtml(wrapper.html())).toContain('<div class="form-class" id="form-id"></div>');
  });

  it('renders error component on load failure in edit mode', async () => {
    mockFormModule({
      loadForm: vi.fn().mockRejectedValue(new Error()),
      subscribeToFormSubmitEvent: vi.fn(),
      executeScriptElements: vi.fn(),
    });

    const wrapper = createWrapper(ctx.page.editing);
    await flushPromises();

    expect(normalizeHtml(wrapper.html())).toContain(
      '<div class="sc-content-sdk-placeholder-error">There was a problem loading this section</div>'
    );
  });
});
