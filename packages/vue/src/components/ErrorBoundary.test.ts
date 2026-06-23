/* eslint-disable vue/one-component-per-file */
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, defineAsyncComponent, h, nextTick } from 'vue';
import { LayoutServicePageState } from '@sitecore-content-sdk/content/layout';
import ErrorBoundary from './ErrorBoundary.vue';
import SitecoreProvider from './SitecoreProvider.vue';

const createErrorComponent = (message: string) =>
  defineComponent({
    mounted() {
      throw new Error(message);
    },
    template: '<div></div>',
  });

const normalPage = {
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
};

const makePage = (overrides: Partial<(typeof normalPage)['mode']>) => ({
  ...normalPage,
  mode: { ...normalPage.mode, ...overrides },
});

const mountWithProvider = (page: any, boundaryProps: any = {}, slotComponent: any) =>
  mount(SitecoreProvider, {
    props: {
      page,
      api: {},
      componentMap: {},
      loadImportMap: () => Promise.resolve({}),
    },
    global: {
      config: {
        errorHandler: () => {},
      },
    },
    slots: {
      default: () =>
        h(ErrorBoundary, boundaryProps, {
          default: () => h(slotComponent),
        }),
    },
  });

describe('ErrorBoundary', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('when in page editing or preview mode', () => {
    it('should render custom error component when provided and error is thrown in preview mode', async () => {
      const CustomErrorComponent = defineComponent({
        template: '<div>This is a custom error component!</div>',
      });

      const wrapper = mountWithProvider(
        makePage({ isPreview: true, isNormal: false }),
        {
          rendering: { componentName: 'Test component Name' },
          errorComponent: CustomErrorComponent,
        },
        createErrorComponent('an error occured')
      );
      await nextTick();

      expect(wrapper.html()).toContain('This is a custom error component!');
    });

    it('should render error message and component name when error is thrown in edit mode', async () => {
      const errorMessage = 'an error occured';
      const componentName = 'Test component Name';

      const wrapper = mountWithProvider(
        makePage({ isEditing: true, isNormal: false }),
        { rendering: { componentName } },
        createErrorComponent(errorMessage)
      );
      await nextTick();

      expect(wrapper.html()).toContain('sc-content-sdk-placeholder-error');
      expect(wrapper.html()).toContain('A rendering error occurred in component');
      expect(wrapper.html()).toContain(`<em>${componentName}</em>`);
      expect(wrapper.html()).toContain(`<em>${errorMessage}</em>`);
    });

    it('should render error message and component name when error is thrown in preview mode', async () => {
      const errorMessage = 'an error occured';
      const componentName = 'Test component Name';

      const wrapper = mountWithProvider(
        makePage({ isPreview: true, isNormal: false }),
        { rendering: { componentName } },
        createErrorComponent(errorMessage)
      );
      await nextTick();

      expect(wrapper.html()).toContain('sc-content-sdk-placeholder-error');
      expect(wrapper.html()).toContain('A rendering error occurred in component');
      expect(wrapper.html()).toContain(`<em>${componentName}</em>`);
      expect(wrapper.html()).toContain(`<em>${errorMessage}</em>`);
    });
  });

  describe('when in development mode', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should render custom error component when provided and error is thrown', async () => {
      const CustomErrorComponent = defineComponent({
        template: '<div>This is a custom error component!</div>',
      });

      const wrapper = mountWithProvider(
        normalPage,
        { errorComponent: CustomErrorComponent },
        createErrorComponent('an error occured')
      );
      await nextTick();

      expect(wrapper.html()).toContain('This is a custom error component!');
    });

    it('should render error message and component name in edit mode', async () => {
      const errorMessage = 'an error occured';
      const componentName = 'Test component Name';

      const wrapper = mountWithProvider(
        makePage({ isEditing: true, isNormal: false }),
        { rendering: { componentName } },
        createErrorComponent(errorMessage)
      );
      await nextTick();

      expect(wrapper.html()).toContain('sc-content-sdk-placeholder-error');
      expect(wrapper.html()).toContain('A rendering error occurred in component');
      expect(wrapper.html()).toContain(`<em>${componentName}</em>`);
      expect(wrapper.html()).toContain(`<em>${errorMessage}</em>`);
    });

    it('should render error message and component name in normal mode', async () => {
      const errorMessage = 'an error occured';
      const componentName = 'Test component Name';

      const wrapper = mountWithProvider(
        makePage({ isNormal: true }),
        { rendering: { componentName } },
        createErrorComponent(errorMessage)
      );
      await nextTick();

      expect(wrapper.html()).toContain('sc-content-sdk-placeholder-error');
      expect(wrapper.html()).toContain('A rendering error occurred in component');
      expect(wrapper.html()).toContain(`<em>${componentName}</em>`);
      expect(wrapper.html()).toContain(`<em>${errorMessage}</em>`);
    });
  });

  describe('when not in page editing and not in development mode', () => {
    it('should render loading message when disableSuspense is false', () => {
      const AsyncComponent = defineAsyncComponent(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ template: '<div>Loaded</div>' } as any), 500)
          )
      );

      const wrapper = mount(SitecoreProvider, {
        props: {
          page: normalPage,
          api: {},
          componentMap: {},
          loadImportMap: () => Promise.resolve({}),
        },
        slots: {
          default: () =>
            h(
              ErrorBoundary,
              { disableSuspense: false },
              {
                default: () => h(AsyncComponent),
              }
            ),
        },
      });

      expect(wrapper.text()).toBe('Loading component...');
    });

    it('should render custom loading message when disableSuspense is false', () => {
      const AsyncComponent = defineAsyncComponent(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ template: '<div>Loaded</div>' } as any), 500)
          )
      );

      const wrapper = mount(SitecoreProvider, {
        props: {
          page: normalPage,
          api: {},
          componentMap: {},
          loadImportMap: () => Promise.resolve({}),
        },
        slots: {
          default: () =>
            h(
              ErrorBoundary,
              { disableSuspense: false, componentLoadingMessage: 'I am customly loading...' },
              { default: () => h(AsyncComponent) }
            ),
        },
      });

      expect(wrapper.text()).toBe('I am customly loading...');
    });

    it('should not use Suspense when disableSuspense is true by default', () => {
      const RegularComponent = defineComponent({
        template: '<div>Regular component</div>',
      });

      const wrapper = mountWithProvider(normalPage, {}, RegularComponent);

      expect(wrapper.text()).toBe('Regular component');
    });

    it('should render custom error component when provided and error is thrown', async () => {
      const CustomErrorComponent = defineComponent({
        template: '<div>This is a custom error component!</div>',
      });

      const wrapper = mountWithProvider(
        normalPage,
        { errorComponent: CustomErrorComponent },
        createErrorComponent('an error occured')
      );
      await nextTick();

      expect(wrapper.html()).toContain('This is a custom error component!');
    });

    it('should render default error message when error is thrown and no custom component is provided', async () => {
      const wrapper = mountWithProvider(normalPage, {}, createErrorComponent('an error occured'));
      await nextTick();

      expect(wrapper.html()).toContain('sc-content-sdk-placeholder-error');
      expect(wrapper.html()).toContain('There was a problem loading this section.');
      expect(wrapper.findAll('em')).toHaveLength(0);
      expect(wrapper.html()).not.toContain('an error occured');
    });
  });
});
