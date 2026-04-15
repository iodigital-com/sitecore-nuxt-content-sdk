/* eslint-disable jsdoc/require-jsdoc */
import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { Page, PageMode } from '@sitecore-content-sdk/content/client';
import {
  LayoutServiceData,
  EDITING_COMPONENT_PLACEHOLDER,
} from '@sitecore-content-sdk/content/layout';
import DesignLibrary from './DesignLibrary.vue';
import { getTestLayoutData } from '../../test-data/component-editing-data';
import { default as RichText } from '../RichText.vue';
import { default as Text } from '../Text.vue';
import { default as Placeholder } from '../Placeholder/Placeholder.vue';
import { default as SitecoreProvider } from '../SitecoreProvider.vue';
import {
  DesignLibraryStatus,
  getDesignLibraryStatusEvent,
  DesignLibraryMode,
} from '@sitecore-content-sdk/content/editing';
import {
  DesignLibraryPreviewError,
  getDesignLibraryErrorEvent,
} from '@sitecore-content-sdk/content/codegen';
import * as codegen from '@sitecore-content-sdk/content/codegen';
import * as editing from '@sitecore-content-sdk/content/editing';

vi.mock('@sitecore-content-sdk/content/codegen', async (importOriginal) => {
  const actual = await importOriginal<typeof codegen>();
  return { ...actual };
});

vi.mock('@sitecore-content-sdk/content/editing', async (importOriginal) => {
  const actual = await importOriginal<typeof editing>();
  return { ...actual };
});

const normalizeHtml = (html: string) =>
  html
    .replace(/ xmlns="[^"]*"/g, '')
    .replace(/\n\s*/g, '')
    .replace(/<!--[\s\S]*?-->/g, '');

describe('<DesignLibrary />', () => {
  let postMessageSpy: ReturnType<typeof vi.spyOn>;

  const components = new Map<string, any>();

  const api = {
    edge: {
      contextId: 'test-context-id',
      clientContextId: 'test-client-context-id',
      edgeUrl: 'https://test-edge-url.com',
    },
    local: { apiKey: 'test-api-key', apiHost: 'https://test-api-host.com', path: '/test-path' },
  };

  const modeLibrary: PageMode = {
    name: DesignLibraryMode.Normal,
    isDesignLibrary: true,
    designLibrary: { isVariantGeneration: false },
    isNormal: false,
    isPreview: false,
    isEditing: false,
  };

  const modeLibraryMetadata: PageMode = {
    name: DesignLibraryMode.Metadata,
    isDesignLibrary: true,
    designLibrary: { isVariantGeneration: false },
    isNormal: false,
    isPreview: false,
    isEditing: true,
  };

  const modeLibrary_Gen: PageMode = {
    name: DesignLibraryMode.Normal,
    isDesignLibrary: true,
    designLibrary: { isVariantGeneration: true },
    isNormal: false,
    isPreview: false,
    isEditing: false,
  };

  const modeLibraryMetadata_Gen: PageMode = {
    name: DesignLibraryMode.Metadata,
    isDesignLibrary: true,
    designLibrary: { isVariantGeneration: true },
    isNormal: false,
    isPreview: false,
    isEditing: true,
  };

  const getPage = (layout?: LayoutServiceData, pageMode: PageMode = modeLibrary): Page => ({
    locale: 'en',
    layout: layout || { sitecore: { context: {}, route: null } },
    mode: pageMode,
  });

  const ContentBlock = defineComponent({
    name: 'ContentBlock',
    inheritAttrs: false,
    props: { fields: Object, rendering: Object },
    setup(props) {
      return () =>
        h('div', { class: 'test' }, [
          h(RichText, { field: (props.fields as any)?.content }),
          h(Placeholder, { name: 'inner', rendering: props.rendering as any }),
        ]);
    },
  });

  const InnerBlock = defineComponent({
    name: 'InnerBlock',
    inheritAttrs: false,
    props: { fields: Object },
    setup(props) {
      return () => h('div', { class: 'inner' }, [h(Text, { field: (props.fields as any)?.text })]);
    },
  });

  components.set('ContentBlock', ContentBlock);
  components.set('InnerBlock', InnerBlock);

  const defaultImportMap = () =>
    Promise.resolve({
      default: [{ module: 'vue', exports: [{ name: 'default', value: {} }] }],
    });

  const RENDER_ID = 'test-content';
  const PLACEHOLDER_GUID = '00000000-0000-0000-0000-000000000000';

  const joinHtml = (parts: string[]) => parts.join('');

  const expectedInitialMarkup = (guid = PLACEHOLDER_GUID, id = RENDER_ID) =>
    joinHtml([
      '<main><div id="editing-component">',
      `<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="editing-componentmode-placeholder_${guid}"></code>`,
      `<code type="text/sitecore" chrometype="rendering" class="scpm" kind="open" id="${id}"></code>`,
      '<div class="test"><div>',
      '<p>This is a live set of examples of how to use Content SDK</p>',
      '</div><div class="sc-jss-empty-placeholder">',
      '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id=""></code>',
      '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close"></code>',
      '</div></div>',
      '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="close"></code>',
      '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close"></code>',
      '</div></main>',
    ]);

  const postedEventsJson = () => postMessageSpy.mock.calls.map((c) => JSON.stringify(c[0]));

  const expectStatus = (
    status: DesignLibraryStatus,
    id: string,
    opts: { strict?: boolean } = {}
  ) => {
    const target = JSON.stringify(getDesignLibraryStatusEvent(status, id));
    const events = postedEventsJson();
    if (opts.strict) {
      expect(events).toContain(target);
    } else {
      expect(events.some((e) => e.includes(target))).toBe(true);
    }
  };

  async function sendUpdate(details: { uid: string; fields?: any; params?: any }) {
    const ev = new MessageEvent('message', {
      origin: window.location.origin,
      data: { name: 'component:update', details },
    });
    window.dispatchEvent(ev);
    await flushPromises();
  }

  let unsubscribeSpy: ReturnType<typeof vi.fn> = vi.fn();
  let addComponentPreviewHandlerSpy: ReturnType<typeof vi.fn>;
  let callbackEvent: any = null;

  beforeAll(() => {
    vi.useFakeTimers();
    (window as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 0);
    postMessageSpy = vi.spyOn(window, 'postMessage');
  });

  afterAll(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    unsubscribeSpy = vi.fn();
    postMessageSpy.mockClear();
  });

  const mountDesignLibrary = (page: Page, extra: Record<string, any> = {}) =>
    mount(SitecoreProvider, {
      props: { componentMap: components, api, page, loadImportMap: undefined as any, ...extra },
      slots: { default: h(DesignLibrary) },
    });

  it('should render null if not in design library mode', () => {
    const page = getPage(getTestLayoutData().layoutData, {
      name: DesignLibraryMode.Normal,
      isDesignLibrary: false,
      designLibrary: { isVariantGeneration: false },
      isNormal: false,
      isPreview: false,
      isEditing: false,
    });

    const wrapper = mountDesignLibrary(page);
    expect(normalizeHtml(wrapper.html())).toBe('');
  });

  describe('mode=library and isVariantGeneration=false', () => {
    let page: Page;

    beforeEach(() => {
      page = {
        locale: 'en',
        layout: getTestLayoutData().layoutData,
        mode: modeLibrary,
      };
    });

    it('renders real component', () => {
      const wrapper = mountDesignLibrary(getPage(getTestLayoutData().layoutData, modeLibrary));

      expect(normalizeHtml(wrapper.html())).toContain(
        joinHtml([
          '<main><div id="editing-component">',
          '<div class="test"><div>',
          '<p>This is a live set of examples of how to use Content SDK</p>',
          '</div></div></div></main>',
        ])
      );
    });

    it('renders real component and sends READY + initial RENDERED', async () => {
      const wrapper = mountDesignLibrary(
        getPage(getTestLayoutData().layoutData, modeLibraryMetadata)
      );

      expect(normalizeHtml(wrapper.html())).toContain(expectedInitialMarkup());

      expectStatus(DesignLibraryStatus.READY, RENDER_ID, { strict: true });

      await vi.runAllTimersAsync();
      await flushPromises();
      await nextTick();

      expectStatus(DesignLibraryStatus.RENDERED, RENDER_ID);
    });

    it('should render component with placeholders', () => {
      page.layout = getTestLayoutData(true).layoutData;

      const wrapper = mountDesignLibrary(page);

      expect(normalizeHtml(wrapper.html())).toContain(
        joinHtml([
          '<main><div id="editing-component">',
          '<div class="test"><div>',
          '<p>This is a live set of examples of how to use Content SDK</p>',
          '</div>',
          '<div class="inner">',
          'Its an inner component',
          '</div></div></div>',
          '</main>',
        ])
      );
    });

    it('should update root component', async () => {
      const wrapper = mountDesignLibrary(page);

      expect(normalizeHtml(wrapper.html())).toContain(
        joinHtml([
          '<main><div id="editing-component">',
          '<div class="test"><div>',
          '<p>This is a live set of examples of how to use Content SDK</p>',
          '</div></div></div></main>',
        ])
      );

      await sendUpdate({ uid: RENDER_ID, fields: { content: { value: 'new content!' } } });

      expect(normalizeHtml(wrapper.html())).toContain(
        joinHtml([
          '<main><div id="editing-component">',
          '<div class="test"><div>',
          'new content!',
          '</div></div></div></main>',
        ])
      );
    });

    it('should update nested component', async () => {
      page.layout = getTestLayoutData(true).layoutData;

      const wrapper = mountDesignLibrary(page);

      expect(normalizeHtml(wrapper.html())).toContain(
        joinHtml(['<div class="inner">', 'Its an inner component', '</div>'])
      );

      await sendUpdate({ uid: 'test-inner', fields: { text: { value: 'new inner content!' } } });

      expect(normalizeHtml(wrapper.html())).toContain(
        joinHtml(['<div class="inner">', 'new inner content!', '</div>'])
      );
    });
  });

  describe('mode=library-metadata and isVariantGeneration=false', () => {
    it('renders real component and sends READY + initial RENDERED', async () => {
      const wrapper = mountDesignLibrary(
        getPage(getTestLayoutData().layoutData, modeLibraryMetadata)
      );

      expect(normalizeHtml(wrapper.html())).toContain(expectedInitialMarkup());

      expectStatus(DesignLibraryStatus.READY, RENDER_ID, { strict: true });

      await vi.runAllTimersAsync();
      await flushPromises();
      await nextTick();

      expectStatus(DesignLibraryStatus.RENDERED, RENDER_ID);
    });
  });

  describe('mode=library&generation=variant and isVariantGeneration=true', () => {
    beforeEach(() => {
      addComponentPreviewHandlerSpy = vi.fn().mockImplementation((_importMap, cb) => {
        callbackEvent = cb;
        return unsubscribeSpy;
      });

      vi.spyOn(codegen, 'addComponentPreviewHandler').mockImplementation(
        addComponentPreviewHandlerSpy
      );
    });

    it('fires component:ready on mount', () => {
      mountDesignLibrary(getPage(getTestLayoutData().layoutData, modeLibrary_Gen), {
        loadImportMap: defaultImportMap,
      });

      const expectedReady = getDesignLibraryStatusEvent(DesignLibraryStatus.READY, RENDER_ID);
      expect(
        postMessageSpy.mock.calls.some(
          (c) => JSON.stringify(c[0]) === JSON.stringify(expectedReady)
        )
      ).toBe(true);

      const readyCount = postMessageSpy.mock.calls.filter((c) => {
        const evt = c[0] as any;
        return evt?.name === expectedReady.name && evt?.message?.uid === expectedReady.message.uid;
      }).length;
      expect(readyCount).toBe(1);
    });

    it('fires component:rendered only after generated component is received', async () => {
      mountDesignLibrary(getPage(getTestLayoutData().layoutData, modeLibrary_Gen), {
        loadImportMap: defaultImportMap,
      });

      const expectedRendered = getDesignLibraryStatusEvent(DesignLibraryStatus.RENDERED, RENDER_ID);
      expect(
        postMessageSpy.mock.calls.some(
          (c) => JSON.stringify(c[0]) === JSON.stringify(expectedRendered)
        )
      ).toBe(false);

      await flushPromises();
      expect(addComponentPreviewHandlerSpy).toHaveBeenCalled();

      const TestComponent = defineComponent({
        inheritAttrs: false,
        setup: () => () => h('div', 'Generated!'),
      });
      callbackEvent(null, TestComponent);

      await flushPromises();

      expect(
        postMessageSpy.mock.calls.some(
          (c) => JSON.stringify(c[0]) === JSON.stringify(expectedRendered)
        )
      ).toBe(true);
    });

    it('renders real component first, then switches to generated component', async () => {
      const wrapper = mountDesignLibrary(getPage(getTestLayoutData().layoutData, modeLibrary_Gen), {
        loadImportMap: defaultImportMap,
      });

      expect(normalizeHtml(wrapper.html())).toContain(
        joinHtml([
          '<main><div id="editing-component">',
          '<div class="test"><div>',
          '<p>This is a live set of examples of how to use Content SDK</p>',
          '</div></div></div></main>',
        ])
      );

      await flushPromises();
      expect(addComponentPreviewHandlerSpy).toHaveBeenCalled();

      const TestComponent = defineComponent({
        inheritAttrs: false,
        setup: () => () => h('div', 'Generated!'),
      });
      callbackEvent(null, TestComponent);

      await flushPromises();

      expect(normalizeHtml(wrapper.html())).toContain('<div>Generated!</div>');
    });

    it('updates via component:update after switch', async () => {
      const Gen = defineComponent({
        inheritAttrs: false,
        props: { fields: Object },
        setup: (props) => () => h('div', { class: 'gen' }, (props.fields as any)?.content?.value),
      });

      mountDesignLibrary(getPage(getTestLayoutData().layoutData, modeLibrary_Gen), {
        loadImportMap: defaultImportMap,
      });

      await flushPromises();
      callbackEvent(null, Gen);

      await sendUpdate({ uid: RENDER_ID, fields: { content: { value: 'updated!' } } });
      await flushPromises();

      expect(
        postMessageSpy.mock.calls.some((c) =>
          JSON.stringify(c[0]).includes(
            JSON.stringify(getDesignLibraryStatusEvent(DesignLibraryStatus.RENDERED, RENDER_ID))
          )
        )
      ).toBe(true);
    });

    it('sends error event when no import map is provided', async () => {
      mountDesignLibrary(getPage(getTestLayoutData().layoutData, modeLibrary_Gen));

      await flushPromises();

      expect(
        postMessageSpy.mock.calls.some(
          (c) =>
            JSON.stringify(c[0]) ===
            JSON.stringify(
              getDesignLibraryErrorEvent(
                RENDER_ID,
                'No loadImportMap provided',
                DesignLibraryPreviewError.ImportMapMissing
              )
            )
        )
      ).toBe(true);
    });
  });

  describe('mode=library-metadata&generation=variant and isVariantGeneration=true', () => {
    beforeEach(() => {
      addComponentPreviewHandlerSpy = vi.fn().mockImplementation((_importMap, cb) => {
        callbackEvent = cb;
        return unsubscribeSpy;
      });

      vi.spyOn(codegen, 'addComponentPreviewHandler').mockImplementation(
        addComponentPreviewHandlerSpy
      );
    });

    it('renders real component first, then switches to generated component', async () => {
      const wrapper = mountDesignLibrary(
        getPage(getTestLayoutData().layoutData, modeLibraryMetadata_Gen),
        { loadImportMap: defaultImportMap }
      );

      expect(normalizeHtml(wrapper.html())).toContain(expectedInitialMarkup());

      await flushPromises();
      expect(addComponentPreviewHandlerSpy).toHaveBeenCalled();

      expectStatus(DesignLibraryStatus.READY, RENDER_ID, { strict: true });

      const GenComponent = defineComponent({
        setup: () => () =>
          h(
            'code',
            { type: 'text/sitecore', chrometype: 'rendering', class: 'scpm', kind: 'close' },
            [h('div', 'Gen-Metadata')]
          ),
      });
      callbackEvent(null, GenComponent);

      await flushPromises();

      expect(normalizeHtml(wrapper.html())).toContain('<div>Gen-Metadata</div>');

      expectStatus(DesignLibraryStatus.RENDERED, RENDER_ID);
    });
  });

  describe('error handling', () => {
    it('should render error message when rendering UID is missing', () => {
      const layoutData = getTestLayoutData().layoutData;

      const renderingWithoutUid = {
        ...layoutData.sitecore.route,
        placeholders: {
          [EDITING_COMPONENT_PLACEHOLDER]: [
            {
              ...layoutData.sitecore.route.placeholders?.[EDITING_COMPONENT_PLACEHOLDER]?.[0],
              uid: undefined,
            },
          ],
        },
      };

      const page = {
        locale: 'en',
        layout: { ...layoutData, sitecore: { ...layoutData.sitecore, route: renderingWithoutUid } },
        mode: modeLibraryMetadata,
      };

      const wrapper = mountDesignLibrary(page);
      expect(wrapper.html()).toContain('Rendering UID is missing in the rendering data');
    });
  });
});
