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
import AppPlaceholder from './AppPlaceholder.vue';

vi.mock('@sitecore-feaas/clientside', () => ({}));

vi.mock('../FEaaS/FEaaSWrapper.vue', () => ({
  default: defineComponent({
    name: 'FEaaSWrapper',
    setup: () => () =>
      h('div', { class: 'feaas-wrapper' }, [h('p', { class: 'feaas-component' }, 'Foo')]),
  }),
}));

vi.mock('../FEaaS/feaas-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../FEaaS/feaas-utils')>();
  return {
    ...actual,
    fetchFEaaSComponentServerProps: vi.fn().mockResolvedValue({
      template: '',
      fetchedData: {},
      revisionFallback: 'published',
    }),
  };
});

describe('App Placeholder logic', () => {
  const getPage = (): Page => ({
    locale: 'en',
    layout: {
      sitecore: {
        context: {},
        route: null,
      },
    },
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
  });

  const DownloadCallout = defineComponent({
    name: 'DownloadCallout',
    inheritAttrs: false,
    props: {
      fields: Object,
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
    setup: () => () => h('div', { class: 'jumbotron-mock' }),
  });

  const componentMap = new Map();
  componentMap.set('DownloadCallout', DownloadCallout);
  componentMap.set('Jumbotron', Jumbotron);

  const Home = defineComponent({
    name: 'Home',
    inheritAttrs: false,
    props: {
      rendering: Object,
      fields: Object,
      params: Object,
      page: Object,
      componentMap: Object,
    },
    setup(props) {
      return () =>
        h('div', { class: 'home-mock' }, [
          h(AppPlaceholder, {
            name: 'page-header',
            rendering: props.rendering as ComponentRendering,
            componentMap,
            page: getPage(),
            fields: props.fields,
          }),
          h(AppPlaceholder, {
            name: 'page-content',
            rendering: props.rendering as ComponentRendering,
            componentMap,
            page: getPage(),
            fields: props.fields,
          }),
        ]);
    },
  });

  componentMap.set('Home', Home);

  describe('<AppPlaceholder />', () => {
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

          const wrapper = mount(AppPlaceholder, {
            props: {
              name: 'page-content',
              rendering: component!,
              componentMap,
              page,
            },
          });

          expect(wrapper.element.querySelectorAll('.download-callout-mock').length).toBe(1);
        });

        it('should render nested placeholders', () => {
          const page = getPage();
          page.layout = dataSet.data;
          const component = dataSet.data.sitecore.route as RouteData;

          const wrapper = mount(AppPlaceholder, {
            props: { name: 'main', rendering: component, componentMap, page },
          });

          expect(wrapper.element.querySelectorAll('.download-callout-mock').length).toBe(1);
        });

        it('should render components based on the renderEach function', () => {
          const page = getPage();
          page.layout = dataSet.data;
          const component = dataSet.data.sitecore.route as RouteData;

          const wrapper = mount(AppPlaceholder, {
            props: {
              name: 'main',
              rendering: component,
              componentMap,
              page,
              renderEach: (comp: any) => h('div', { class: 'wrapper' }, [comp]),
            },
          });

          expect(wrapper.element.querySelectorAll('.wrapper').length).toBe(1);
        });

        it('should render components based on the render function', () => {
          const page = getPage();
          page.layout = dataSet.data;
          const component = dataSet.data.sitecore.route as RouteData;

          const wrapper = mount(AppPlaceholder, {
            props: {
              name: 'main',
              rendering: component,
              componentMap,
              page,
              render: (comps: any[]) => [h('div', { class: 'wrapper' }, comps)],
            },
          });

          expect(wrapper.element.querySelectorAll('.wrapper').length).toBe(1);
        });

        it('should render empty placeholder', () => {
          const page = getPage();
          page.layout = dataSet.data;
          const component = dataSet.data.sitecore.route as RouteData;

          const wrapper = mount(AppPlaceholder, {
            props: {
              name: 'mainEmpty',
              rendering: component,
              componentMap,
              page,
              render: () => [],
            },
          });

          expect(wrapper.element.innerHTML).toBe('');
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

        const wrapper = mount(AppPlaceholder, {
          props: {
            name: 'main',
            rendering: myComponent,
            componentMap,
            page,
            renderEmpty: (comps: any[]) => [h('div', { class: 'wrapper' }, comps)],
          },
        });

        expect(wrapper.element.querySelectorAll('.wrapper').length).toBe(1);
        expect(wrapper.element.querySelectorAll('.download-callout-mock').length).toBe(0);
        expect(wrapper.element.querySelectorAll('.home-mock').length).toBe(0);
        expect(wrapper.element.querySelectorAll('.jumbotron-mock').length).toBe(0);
      });

      it('should pass properties to nested components', () => {
        const page = getPage();
        page.layout = dataSet.data;
        const component = dataSet.data.sitecore.route as any;
        const expectedMessage = (component.placeholders.main as any[]).find((c) => c.componentName)
          .fields.message;

        const wrapper = mount(AppPlaceholder, {
          props: { name: 'main', rendering: component, componentMap, page },
        });

        expect(
          wrapper.element
            .querySelector('.download-callout-mock')
            ?.innerHTML.includes(expectedMessage.value)
        ).toBe(true);
      });

      it('should apply modifyComponentProps to the final props', () => {
        const page = getPage();
        page.layout = dataSet.data;
        const component = dataSet.data.sitecore.route?.placeholders.main[0] as any;

        const modifyComponentProps = (props: any) => {
          if (props.rendering?.componentName === 'DownloadCallout') {
            return { ...props, extraDiv: true };
          }
          return props;
        };

        const wrapper = mount(AppPlaceholder, {
          props: {
            name: 'page-content',
            rendering: component,
            componentMap,
            page,
            modifyComponentProps,
          },
        });

        expect(wrapper.element.querySelectorAll('div.extra').length).toBe(1);
      });
    });
  });

  describe('AppPlaceholder SXA rendering variants', () => {
    const sxaComponentMap = new Map();
    sxaComponentMap.set('RichText', SxaRichText);

    it('should render', () => {
      const page = getPage();
      page.layout = sxaRenderingVariantData;
      const component = sxaRenderingVariantData.sitecore.route as RouteData;

      const wrapper = mount(AppPlaceholder, {
        props: { name: 'main', rendering: component, componentMap: sxaComponentMap, page },
      });

      expect(wrapper.element.querySelectorAll('.rendering-variant').length).toBe(1);
      expect(wrapper.element.querySelector('.rendering-variant')?.getAttribute('class')).toBe(
        'rendering-variant col-9|col-sm-10|col-md-12|col-lg-6|col-xl-7|col-xxl-8 test-css-class-x'
      );
      expect(wrapper.element.querySelectorAll('.title').length).toBe(1);
      expect(wrapper.element.querySelector('.title')?.textContent).toBe(
        'Rich Text Rendering Variant'
      );
    });

    it('should render with container-{*} type dynamic placeholder', () => {
      const page = getPage();
      page.layout = sxaRenderingCommonContainerName;
      const component = sxaRenderingCommonContainerName.sitecore.route as RouteData;

      const wrapper = mount(AppPlaceholder, {
        props: { name: 'container-1', rendering: component, componentMap: sxaComponentMap, page },
      });

      expect(wrapper.element.querySelectorAll('.rendering-variant').length).toBe(1);
      expect(wrapper.element.querySelector('.title')?.textContent).toBe(
        'Rich Text Rendering Variant'
      );
    });

    it('should not render without container-{*} type dynamic placeholder', () => {
      const page = getPage();
      page.layout = sxaRenderingWithoutContainerName;
      const component = sxaRenderingWithoutContainerName.sitecore.route as RouteData;

      const wrapper = mount(AppPlaceholder, {
        props: { name: 'richText', rendering: component, componentMap: sxaComponentMap, page },
      });

      expect(wrapper.element.querySelectorAll('.rendering-variant').length).toBe(0);
    });

    it('should render with dynamic-1-{*} type dynamic placeholder', () => {
      const page = getPage();
      page.layout = sxaRenderingDoubleDigitContainerName;
      const component = sxaRenderingDoubleDigitContainerName.sitecore.route as RouteData;

      const wrapper = mount(AppPlaceholder, {
        props: {
          name: 'dynamic-1-{*}',
          rendering: component,
          componentMap: sxaComponentMap,
          page,
        },
      });

      expect(wrapper.element.querySelectorAll('.rendering-variant').length).toBe(1);
    });

    it('should render another rendering variant', () => {
      const page = getPage();
      page.layout = sxaRenderingVariantData;
      const component = sxaRenderingVariantData.sitecore.route as RouteData;

      const wrapper = mount(AppPlaceholder, {
        props: {
          name: 'main-second',
          rendering: component,
          componentMap: sxaComponentMap,
          page,
        },
      });

      expect(wrapper.element.querySelectorAll('.rendering-variant').length).toBe(1);
      expect(wrapper.element.querySelector('.rendering-variant')?.getAttribute('class')).toBe(
        'rendering-variant col-9|col-sm-10|col-md-12|col-lg-6|col-xl-7|col-xxl-8 test-css-class-y'
      );
    });

    it('should render column splitter rendering variant', () => {
      const page = getPage();
      page.layout = sxaRenderingColumnSplitterVariant;
      const component = sxaRenderingColumnSplitterVariant.sitecore.route as RouteData;

      const wrapper = mount(AppPlaceholder, {
        props: {
          name: 'column-1-{*}',
          rendering: component,
          componentMap: sxaComponentMap,
          page,
        },
      });

      expect(wrapper.element.querySelectorAll('.rendering-variant').length).toBe(1);
    });
  });

  it('should render null for unknown placeholder', () => {
    const page = getPage();
    const route = {
      placeholders: { main: [{ componentName: 'Home' }] },
    } as unknown as RouteData;

    page.layout = { sitecore: { context: {}, route } };

    const wrapper = mount(AppPlaceholder, {
      props: { name: 'unknown', rendering: route, componentMap, page },
    });

    expect(wrapper.element.innerHTML).toBe('');
  });

  it('should render MissingComponent for unknown rendering', () => {
    const page = getPage();
    const route: any = { placeholders: { main: [{ componentName: 'Unknown' }] } };
    page.layout = { sitecore: { context: {}, route } };

    const CustomMissingComponent = defineComponent({
      name: 'CustomMissingComponent',
      setup: () => () => h('div', { class: 'missing-component' }),
    });

    const wrapper = mount(AppPlaceholder, {
      props: {
        name: 'main',
        rendering: route,
        componentMap,
        page,
        missingComponentComponent: CustomMissingComponent,
      },
    });

    expect(wrapper.element.querySelectorAll('.missing-component').length).toBe(1);
  });

  it('should render nothing for rendering without a name', () => {
    const page = getPage();
    const localComponentMap = new Map();
    localComponentMap.set(
      'Home',
      defineComponent({ setup: () => () => h('div', { class: 'home-mock' }) })
    );

    const route: any = {
      placeholders: { main: [{ componentName: 'Home' }, { componentName: null }] },
    };
    page.layout = { sitecore: { context: {}, route } };

    const wrapper = mount(AppPlaceholder, {
      props: { name: 'main', rendering: route, componentMap: localComponentMap, page },
    });

    expect(wrapper.element.querySelectorAll('.home-mock').length).toBe(1);
  });

  it('should render HiddenRendering when rendering is hidden', () => {
    const page = getPage();
    const route: any = {
      placeholders: { main: [{ componentName: 'Hidden Rendering' }] },
    };
    page.layout = { sitecore: { context: {}, route } };

    const wrapper = mount(AppPlaceholder, {
      props: { name: 'main', rendering: route, componentMap, page },
    });

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
      props: { rendering: Object },
      setup: (props) => () =>
        h('div', { class: 'hidden-rendering' }, [h('p', props.rendering?.componentName)]),
    });

    const wrapper = mount(AppPlaceholder, {
      props: {
        name: 'main',
        rendering: route,
        componentMap,
        page,
        hiddenRenderingComponent: CustomHiddenRendering,
      },
    });

    expect(wrapper.element.querySelectorAll('.hidden-rendering').length).toBe(1);
    expect(wrapper.element.querySelector('.hidden-rendering p')?.textContent).toBe(
      'Hidden Rendering'
    );
  });

  describe('AppPlaceholder PlaceholderMetadata', () => {
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
            h(AppPlaceholder, {
              name: 'logo',
              rendering: layoutData.sitecore.route.placeholders.main[0],
              componentMap: metadataComponentMap,
              page,
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

    const normalizeHtml = (html: string) =>
      html.replace(/ xmlns="[^"]*"/g, '').replace(/\n\s*/g, '');

    beforeEach(() => {
      page = getPage();
      page.layout = layoutData;
      page.mode = mode;
    });

    it('should render <PlaceholderMetadata> with nested placeholder components', () => {
      const wrapper = mount(AppPlaceholder, {
        props: {
          name: 'main',
          rendering: layoutData.sitecore.route,
          componentMap: metadataComponentMap,
          page,
        },
      });

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

      const wrapper = mount(AppPlaceholder, {
        props: {
          name: 'main',
          rendering: layoutDataWithEmptyPlaceholder.sitecore.route,
          componentMap: metadataComponentMap,
          page,
        },
      });

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

      const wrapper = mount(AppPlaceholder, {
        props: {
          name: 'main',
          rendering: layoutDataWithUnknownComponent.sitecore.route,
          componentMap: metadataComponentMap,
          page,
        },
      });

      expect(normalizeHtml(wrapper.html())).toContain(
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="main_00000000-0000-0000-0000-000000000000"></code>'
      );
      expect(normalizeHtml(wrapper.html())).toContain(
        '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="open" id="123"></code>'
      );
      expect(wrapper.element.querySelectorAll('.scpm').length).toBe(4);
    });

    it('should render dynamic placeholder', () => {
      const phKey = 'container-1';
      const ld = layoutDataForNestedDynamicPlaceholder('container-{*}');
      page.layout = ld;

      const wrapper = mount(AppPlaceholder, {
        props: {
          name: phKey,
          rendering: ld.sitecore.route,
          componentMap: metadataComponentMap,
          page,
        },
      });

      expect(normalizeHtml(wrapper.html())).toContain(
        'id="container-{*}_00000000-0000-0000-0000-000000000000"'
      );
      expect(wrapper.element.querySelectorAll('.scpm').length).toBe(8);
    });

    it('should render double digit dynamic placeholder', () => {
      const phKey = 'container-1-2';
      const ld = layoutDataForNestedDynamicPlaceholder('container-1-{*}');
      page.layout = ld;

      const wrapper = mount(AppPlaceholder, {
        props: {
          name: phKey,
          rendering: ld.sitecore.route,
          componentMap: metadataComponentMap,
          page,
        },
      });

      expect(normalizeHtml(wrapper.html())).toContain(
        'id="container-1-{*}_00000000-0000-0000-0000-000000000000"'
      );
      expect(wrapper.element.querySelectorAll('.scpm').length).toBe(8);
    });

    it('should use renderEach for each child in the placeholder when page editing is enabled', () => {
      const editPage = getPage();
      editPage.mode.isEditing = true;

      const childComponents = new Map();
      childComponents.set('Child', defineComponent({ setup: () => () => h('span', 'Child') }));

      const route: any = {
        name: 'Render Each Test',
        placeholders: {
          main: [{ componentName: 'Child' }, { componentName: 'Child' }],
        },
      };

      editPage.layout = { sitecore: { context: {}, route } };

      const wrapper = mount(AppPlaceholder, {
        props: {
          name: 'main',
          rendering: route,
          componentMap: childComponents,
          page: editPage,
          render: (children: any[]) => [h('div', { class: 'parentWrapper' }, children)],
          renderEach: (child: any) => h('div', { class: 'wrapper' }, [child]),
        },
      });

      expect(wrapper.element.querySelectorAll('.parentWrapper').length).toBe(1);
      expect(wrapper.element.querySelectorAll('.wrapper').length).toBe(2);
    });
  });
});
