/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import {
  ComponentRendering,
  LayoutServicePageState,
  RouteData,
} from '@sitecore-content-sdk/content/layout';
import {
  convertedDevData as normalModeDevData,
  convertedLayoutServiceData as normalModeLsData,
  sxaRenderingColumnSplitterVariant,
  sxaRenderingVariantDataWithCommonContainerName as sxaRenderingCommonContainerName,
  sxaRenderingVariantData,
  sxaRenderingVariantDoubleDigitDynamicPlaceholder as sxaRenderingDoubleDigitContainerName,
  sxaRenderingVariantDataWithoutCommonContainerName as sxaRenderingWithoutContainerName,
} from '../../test-data/normal-mode-data';
import * as metadataData from '../../test-data/metadata-data';
import * as SxaRichText from '../../test-data/sxa-rich-text';
import { Page, PageMode } from '@sitecore-content-sdk/content/client';
import Placeholder from './Placeholder.vue';
import SitecoreProvider from '../SitecoreProvider.vue';

const getPage = (): Page => ({
  locale: 'en',
  layout: { sitecore: { context: {}, route: null } },
  mode: {
    name: LayoutServicePageState.Normal,
    isNormal: true,
    isPreview: false,
    isEditing: false,
    isDesignLibrary: false,
    designLibrary: { isVariantGeneration: false },
  },
});

const DownloadCallout = defineComponent({
  name: 'DownloadCallout',
  inheritAttrs: false,
  props: {
    fields: Object as any,
    params: Object as any,
    rendering: Object as any,
    extraDiv: Boolean,
  },
  setup(props) {
    return () =>
      h('div', { class: 'download-callout-mock' }, [
        props.fields?.message ? props.fields.message.value : '',
        props.extraDiv ? h('div', { class: 'extra' }, 'extra!') : null,
      ]);
  },
});

const Jumbotron = defineComponent({
  name: 'Jumbotron',
  inheritAttrs: false,
  setup: () => () => h('div', { class: 'jumbotron-mock' }),
});

const Home = defineComponent({
  name: 'Home',
  inheritAttrs: false,
  props: { rendering: Object as any, fields: Object as any },
  setup(props) {
    return () =>
      h('div', { class: 'home-mock' }, [
        h(Placeholder, { name: 'page-header', rendering: props.rendering }),
        h(Placeholder, { name: 'page-content', rendering: props.rendering, fields: props.fields }),
      ]);
  },
});

const componentMap = new Map();
componentMap.set('Home', Home);
componentMap.set('DownloadCallout', DownloadCallout);
componentMap.set('Jumbotron', Jumbotron);

const mountWithProvider = (
  page: Page,
  placeholderProps: Record<string, any>,
  customComponentMap = componentMap
) =>
  mount(SitecoreProvider, {
    props: {
      api: {} as any,
      page,
      componentMap: customComponentMap,
      loadImportMap: () => Promise.resolve({ default: [] }),
    },
    slots: {
      default: defineComponent({
        setup: () => () => h(Placeholder, placeholderProps as any),
      }),
    },
  });

const normalizeHtml = (html: string) => html.replace(/ xmlns="[^"]*"/g, '').replace(/\n\s*/g, '');

describe('Placeholder', () => {
  const testData = [
    { label: 'Dev data', data: normalModeDevData },
    { label: 'LayoutService data - Editing off', data: normalModeLsData },
  ];

  testData.forEach((dataSet) => {
    describe(`with ${dataSet.label}`, () => {
      it('should render a placeholder with given key', () => {
        const page = getPage();
        page.layout = dataSet.data;
        const component = (
          dataSet.data.sitecore.route!.placeholders.main as (ComponentRendering | RouteData)[]
        ).find((c) => (c as ComponentRendering).componentName);

        const wrapper = mountWithProvider(page, {
          name: 'page-content',
          rendering: component,
        });

        expect(wrapper.element.querySelectorAll('.download-callout-mock').length).toBe(1);
      });

      it('should render nested placeholders', () => {
        const page = getPage();
        page.layout = dataSet.data;
        const component = dataSet.data.sitecore.route as RouteData;

        const wrapper = mountWithProvider(page, { name: 'main', rendering: component });

        expect(wrapper.element.querySelectorAll('.download-callout-mock').length).toBe(1);
      });

      it('should render components based on the renderEach function', () => {
        const page = getPage();
        page.layout = dataSet.data;
        const component = dataSet.data.sitecore.route as RouteData;

        const wrapper = mountWithProvider(page, {
          name: 'main',
          rendering: component,
          renderEach: (comp: any) => h('div', { class: 'wrapper' }, [comp]),
        });

        expect(wrapper.element.querySelectorAll('.wrapper').length).toBe(1);
      });

      it('should render components based on the render function', () => {
        const page = getPage();
        page.layout = dataSet.data;
        const component = dataSet.data.sitecore.route as RouteData;

        const wrapper = mountWithProvider(page, {
          name: 'main',
          rendering: component,
          render: (comps: any[]) => [h('div', { class: 'wrapper' }, comps)],
        });

        expect(wrapper.element.querySelectorAll('.wrapper').length).toBe(1);
      });

      it('should render empty placeholder', () => {
        const page = getPage();
        page.layout = dataSet.data;
        const component = dataSet.data.sitecore.route as RouteData;

        const wrapper = mountWithProvider(page, {
          name: 'mainEmpty',
          rendering: component,
          render: () => [],
        });

        expect(wrapper.element.innerHTML).toBe('');
      });

      it('should use renderEach for each child when page editing is enabled', () => {
        const page = getPage();
        page.mode.isEditing = true;

        const childComponents = new Map();
        childComponents.set('Child', defineComponent({ setup: () => () => h('span', 'Child') }));

        const route: any = {
          name: 'Render Each Test',
          placeholders: {
            main: [{ componentName: 'Child' }, { componentName: 'Child' }],
          },
        };
        page.layout = { sitecore: { context: {}, route } };

        const wrapper = mountWithProvider(
          page,
          {
            name: 'main',
            rendering: route,
            render: (children: any[]) => [h('div', { class: 'parentWrapper' }, children)],
            renderEach: (child: any) => h('div', { class: 'wrapper' }, [child]),
          },
          childComponents
        );

        expect(wrapper.element.querySelectorAll('.parentWrapper').length).toBe(1);
        expect(wrapper.element.querySelectorAll('.wrapper').length).toBe(2);
      });
    });

    it('should render output based on the renderEmpty function when no renderings', () => {
      const page = getPage();
      page.layout = dataSet.data;
      const component = dataSet.data.sitecore.route as RouteData;
      const renderings = component.placeholders.main.filter(
        (c) => !(c as ComponentRendering).componentName
      );
      const myComponent = {
        ...component,
        placeholders: { ...component.placeholders, main: [...renderings] },
      };

      const wrapper = mountWithProvider(page, {
        name: 'main',
        rendering: myComponent,
        renderEmpty: (comps: any[]) => [h('div', { class: 'wrapper' }, comps)],
      });

      expect(wrapper.element.querySelectorAll('.wrapper').length).toBe(1);
      expect(wrapper.element.querySelectorAll('.download-callout-mock').length).toBe(0);
    });

    it('should pass properties to nested components', () => {
      const page = getPage();
      page.layout = dataSet.data;
      const component = dataSet.data.sitecore.route as any;
      const expectedMessage = (component.placeholders.main as any[]).find((c) => c.componentName)
        .fields.message;

      const wrapper = mountWithProvider(page, { name: 'main', rendering: component });

      expect(
        wrapper.element
          .querySelector('.download-callout-mock')
          ?.innerHTML.includes(expectedMessage.value)
      ).toBe(true);
    });

    it('should pass passThroughComponentProps to rendered components', () => {
      const page = getPage();
      const testRendering: RouteData = {
        placeholders: {
          'test-placeholder': [
            {
              componentName: 'DownloadCallout',
              uid: 'download-uid',
              fields: { message: { value: 'Test message' } },
            },
          ],
        },
        name: 'Test Rendering',
      };
      page.layout = { sitecore: { context: {}, route: testRendering } };

      const wrapper = mountWithProvider(page, {
        name: 'test-placeholder',
        rendering: testRendering,
        passThroughComponentProps: { extraDiv: true },
      });

      expect(wrapper.element.querySelector('.download-callout-mock')).not.toBeNull();
      expect(wrapper.element.querySelectorAll('div.extra').length).toBe(1);
    });
  });

  describe('SXA rendering variants', () => {
    const sxaComponentMap = new Map();
    sxaComponentMap.set('RichText', SxaRichText);

    it('should render', () => {
      const page = getPage();
      page.layout = sxaRenderingVariantData;
      const component = sxaRenderingVariantData.sitecore.route as RouteData;

      const wrapper = mountWithProvider(
        page,
        { name: 'main', rendering: component },
        sxaComponentMap
      );

      expect(wrapper.element.querySelectorAll('.rendering-variant').length).toBe(1);
      expect(wrapper.element.querySelector('.rendering-variant')?.getAttribute('class')).toBe(
        'rendering-variant col-9|col-sm-10|col-md-12|col-lg-6|col-xl-7|col-xxl-8 test-css-class-x'
      );
      expect(wrapper.element.querySelector('.title')?.textContent).toBe(
        'Rich Text Rendering Variant'
      );
      expect(wrapper.element.querySelector('.text')?.textContent).toBe('Test RichText');
    });

    it('should render with container-{*} type dynamic placeholder', () => {
      const page = getPage();
      page.layout = sxaRenderingCommonContainerName;
      const component = sxaRenderingCommonContainerName.sitecore.route as RouteData;

      const wrapper = mountWithProvider(
        page,
        { name: 'container-1', rendering: component },
        sxaComponentMap
      );

      expect(wrapper.element.querySelectorAll('.rendering-variant').length).toBe(1);
      expect(wrapper.element.querySelector('.title')?.textContent).toBe(
        'Rich Text Rendering Variant'
      );
    });

    it('should not render without container-{*} type dynamic placeholder', () => {
      const page = getPage();
      page.layout = sxaRenderingWithoutContainerName;
      const component = sxaRenderingWithoutContainerName.sitecore.route as RouteData;

      const wrapper = mountWithProvider(
        page,
        { name: 'richText', rendering: component },
        sxaComponentMap
      );

      expect(wrapper.element.querySelectorAll('.rendering-variant').length).toBe(0);
    });

    it('should render with dynamic-1-{*} type dynamic placeholder', () => {
      const page = getPage();
      page.layout = sxaRenderingDoubleDigitContainerName;
      const component = sxaRenderingDoubleDigitContainerName.sitecore.route as RouteData;

      const wrapper = mountWithProvider(
        page,
        { name: 'dynamic-1-{*}', rendering: component },
        sxaComponentMap
      );

      expect(wrapper.element.querySelectorAll('.rendering-variant').length).toBe(1);
    });

    it('should render another rendering variant', () => {
      const page = getPage();
      page.layout = sxaRenderingVariantData;
      const component = sxaRenderingVariantData.sitecore.route as RouteData;

      const wrapper = mountWithProvider(
        page,
        { name: 'main-second', rendering: component },
        sxaComponentMap
      );

      expect(wrapper.element.querySelector('.rendering-variant')?.getAttribute('class')).toBe(
        'rendering-variant col-9|col-sm-10|col-md-12|col-lg-6|col-xl-7|col-xxl-8 test-css-class-y'
      );
      expect(wrapper.element.querySelectorAll('.default').length).toBe(1);
    });

    it('should render column splitter rendering variant', () => {
      const page = getPage();
      page.layout = sxaRenderingColumnSplitterVariant;
      const component = sxaRenderingColumnSplitterVariant.sitecore.route as RouteData;

      const wrapper = mountWithProvider(
        page,
        { name: 'column-1-{*}', rendering: component },
        sxaComponentMap
      );

      expect(wrapper.element.querySelectorAll('.rendering-variant').length).toBe(1);
    });
  });

  it('should render null for unknown placeholder', () => {
    const page = getPage();
    const route = {
      placeholders: { main: [{ componentName: 'Home' }] },
    } as unknown as RouteData;
    page.layout = { sitecore: { context: {}, route } };

    const wrapper = mountWithProvider(page, { name: 'unknown', rendering: route });

    expect(wrapper.element.innerHTML).toBe('');
  });

  it('should render MissingComponent for unknown rendering', () => {
    const page = getPage();
    const route: any = { placeholders: { main: [{ componentName: 'Unknown' }] } };
    page.layout = { sitecore: { context: {}, route } };

    const CustomMissingComponent = defineComponent({
      name: 'CustomMissingComponent',
      inheritAttrs: false,
      setup: () => () => h('div', { class: 'missing-component' }),
    });

    const wrapper = mountWithProvider(page, {
      name: 'main',
      rendering: route,
      missingComponentComponent: CustomMissingComponent,
    });

    expect(wrapper.element.querySelectorAll('.missing-component').length).toBe(1);
  });

  it('should render nothing for rendering without a name', () => {
    const page = getPage();
    const localComponentMap = new Map();
    localComponentMap.set(
      'Home',
      defineComponent({
        inheritAttrs: false,
        setup: () => () => h('div', { class: 'home-mock' }),
      })
    );

    const route: any = {
      placeholders: { main: [{ componentName: 'Home' }, { componentName: null }] },
    };
    page.layout = { sitecore: { context: {}, route } };

    const wrapper = mountWithProvider(page, { name: 'main', rendering: route }, localComponentMap);

    expect(wrapper.element.querySelectorAll('.home-mock').length).toBe(1);
  });

  it('should render HiddenRendering when rendering is hidden', () => {
    const page = getPage();
    const route: any = {
      placeholders: { main: [{ componentName: 'Hidden Rendering' }] },
    };
    page.layout = { sitecore: { context: {}, route } };

    const wrapper = mountWithProvider(page, { name: 'main', rendering: route });

    expect(wrapper.text()).toContain('The component is hidden');
  });

  it('should render custom HiddenRendering when rendering is hidden', () => {
    const page = getPage();
    const route: any = {
      placeholders: { main: [{ componentName: 'Hidden Rendering' }] },
    };
    page.layout = { sitecore: { context: {}, route } };

    const CustomHiddenRendering = defineComponent({
      name: 'CustomHiddenRendering',
      inheritAttrs: false,
      props: { rendering: Object as any },
      setup: (props) => () =>
        h('div', { class: 'hidden-rendering' }, [h('p', props.rendering?.componentName)]),
    });

    const wrapper = mountWithProvider(page, {
      name: 'main',
      rendering: route,
      hiddenRenderingComponent: CustomHiddenRendering,
    });

    expect(wrapper.element.querySelectorAll('.hidden-rendering').length).toBe(1);
    expect(wrapper.element.querySelector('.hidden-rendering p')?.textContent).toBe(
      'Hidden Rendering'
    );
  });

  describe('PlaceholderMetadata', () => {
    const {
      layoutData,
      layoutDataForNestedDynamicPlaceholder,
      layoutDataWithEmptyPlaceholder,
      layoutDataWithUnknownComponent,
    } = metadataData;

    const mode: PageMode = {
      name: LayoutServicePageState.Edit,
      isEditing: true,
      isNormal: false,
      isPreview: false,
      isDesignLibrary: false,
      designLibrary: { isVariantGeneration: false },
    };

    let page: Page;

    const metadataComponentMap = new Map();

    metadataComponentMap.set(
      'Header',
      defineComponent({
        name: 'Header',
        inheritAttrs: false,
        setup: () => () =>
          h('div', { class: 'header-wrapper' }, [
            h(Placeholder, {
              name: 'logo',
              rendering: layoutData.sitecore.route.placeholders.main[0],
            }),
          ]),
      })
    );

    metadataComponentMap.set(
      'Logo',
      defineComponent({
        name: 'Logo',
        inheritAttrs: false,
        setup: () => () => h('div', { class: 'Logo-mock' }),
      })
    );

    beforeEach(() => {
      page = getPage();
      page.layout = layoutData;
      page.mode = mode;
    });

    it('should render <PlaceholderMetadata> with nested placeholder components', () => {
      const wrapper = mountWithProvider(
        page,
        { name: 'main', rendering: layoutData.sitecore.route },
        metadataComponentMap
      );

      expect(normalizeHtml(wrapper.html())).toBe(
        [
          '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="main_00000000-0000-0000-0000-000000000000"></code>',
          '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="open" id="nested123"></code>',
          '<div class="header-wrapper">',
          '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="logo_nested123"></code>',
          '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="open" id="deep123"></code>',
          '<div class="Logo-mock"></div>',
          '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="close"></code>',
          '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close"></code>',
          '</div>',
          '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="close"></code>',
          '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close"></code>',
        ].join('')
      );

      expect(wrapper.element.querySelectorAll('.scpm').length).toBe(8);
    });

    it('should render code blocks even if placeholder is empty', () => {
      page.layout = layoutDataWithEmptyPlaceholder;

      const wrapper = mountWithProvider(
        page,
        { name: 'main', rendering: layoutDataWithEmptyPlaceholder.sitecore.route },
        metadataComponentMap
      );

      expect(normalizeHtml(wrapper.html())).toBe(
        [
          '<div class="sc-jss-empty-placeholder">',
          '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="main_00000000-0000-0000-0000-000000000000"></code>',
          '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close"></code>',
          '</div>',
        ].join('')
      );
    });

    it('should render missing component with code blocks if component is not registered', () => {
      page.layout = layoutDataWithUnknownComponent;

      const wrapper = mountWithProvider(
        page,
        { name: 'main', rendering: layoutDataWithUnknownComponent.sitecore.route },
        metadataComponentMap
      );

      expect(normalizeHtml(wrapper.html())).toContain(
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="main_00000000-0000-0000-0000-000000000000"></code>'
      );
      expect(normalizeHtml(wrapper.html())).toContain(
        '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="open" id="123"></code>'
      );
      expect(wrapper.element.querySelectorAll('.scpm').length).toBe(4);
    });

    it('should render dynamic placeholder', () => {
      const ld = layoutDataForNestedDynamicPlaceholder('container-{*}');
      page.layout = ld;

      const wrapper = mountWithProvider(
        page,
        { name: 'container-1', rendering: ld.sitecore.route },
        metadataComponentMap
      );

      expect(normalizeHtml(wrapper.html())).toContain(
        'id="container-{*}_00000000-0000-0000-0000-000000000000"'
      );
      expect(wrapper.element.querySelectorAll('.scpm').length).toBe(8);
    });

    it('should render double digit dynamic placeholder', () => {
      const ld = layoutDataForNestedDynamicPlaceholder('container-1-{*}');
      page.layout = ld;

      const wrapper = mountWithProvider(
        page,
        { name: 'container-1-2', rendering: ld.sitecore.route },
        metadataComponentMap
      );

      expect(normalizeHtml(wrapper.html())).toContain(
        'id="container-1-{*}_00000000-0000-0000-0000-000000000000"'
      );
      expect(wrapper.element.querySelectorAll('.scpm').length).toBe(8);
    });
  });
});
