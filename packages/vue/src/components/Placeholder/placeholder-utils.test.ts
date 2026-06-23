/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable vue/one-component-per-file */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import {
  getPlaceholderRenderings,
  getSXAParams,
  getChildComponentProps,
  getComponentForRendering,
} from './placeholder-utils';
import { ComponentRendering } from '@sitecore-content-sdk/content/layout';
import { ComponentMap, VueModule } from '../../sharedTypes';
import { ComponentType, PlaceholderProps } from './models';
import { HIDDEN_RENDERING_NAME } from '@sitecore-content-sdk/content';
import MissingComponent from '../MissingComponent.vue';
import HiddenRendering from '../HiddenRendering.vue';

describe('placeholder-utils', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getPlaceholderRenderings', () => {
    it('should return empty array if rendering does not have placeholders', () => {
      const rendering: ComponentRendering = {
        componentName: 'TestComponent',
        uid: 'test-uid',
      };

      const result = getPlaceholderRenderings(rendering, 'test-placeholder', false);

      expect(result).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledOnce();
      expect(consoleWarnSpy.mock.calls[0][0]).toContain('test-placeholder');
    });

    it('should return renderings from placeholder by name', () => {
      const expectedRenderings = [
        { componentName: 'Component1', uid: 'comp1-uid' },
        { componentName: 'Component2', uid: 'comp2-uid' },
      ];

      const rendering: ComponentRendering = {
        componentName: 'TestComponent',
        uid: 'test-uid',
        placeholders: {
          'test-placeholder': expectedRenderings,
          'other-placeholder': [{ componentName: 'OtherComponent', uid: 'other-uid' }],
        },
      };

      const result = getPlaceholderRenderings(rendering, 'test-placeholder', false);

      expect(result).toEqual(expectedRenderings);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should parse dynamic SXA placeholder names correctly', () => {
      const expectedRenderings = [{ componentName: 'DynamicComponent', uid: 'dynamic-uid' }];

      const rendering: ComponentRendering = {
        componentName: 'TestComponent',
        uid: 'test-uid',
        placeholders: {
          'container-{*}': expectedRenderings,
          'other-placeholder': [{ componentName: 'OtherComponent', uid: 'other-uid' }],
        },
      };

      const result = getPlaceholderRenderings(rendering, 'container-1', false);
      expect(result).toEqual(expectedRenderings);
      expect((rendering.placeholders as any)['container-1']).toEqual(expectedRenderings);
      expect((rendering.placeholders as any)['container-{*}']).toBeUndefined();

      rendering.placeholders = {
        'container-{*}': expectedRenderings,
        'other-placeholder': [{ componentName: 'OtherComponent', uid: 'other-uid' }],
      };

      const editResult = getPlaceholderRenderings(rendering, 'container-1', true);
      expect(editResult).toEqual(expectedRenderings);
      expect((rendering.placeholders as any)['container-{*}']).toEqual(expectedRenderings);
    });
  });

  describe('getSXAParams', () => {
    it('should return GridParameters and Styles when present', () => {
      const rendering: ComponentRendering = {
        componentName: 'TestComponent',
        uid: 'test-uid',
        params: {
          GridParameters: 'col-lg-6',
          Styles: 'custom-class',
          OtherParam: 'other-value',
        },
      };

      expect(getSXAParams(rendering)).toEqual({ styles: 'col-lg-6 custom-class' });
    });

    it('should return only GridParameters when Styles not present', () => {
      const rendering: ComponentRendering = {
        componentName: 'TestComponent',
        uid: 'test-uid',
        params: { GridParameters: 'col-lg-8', OtherParam: 'other-value' },
      };

      expect(getSXAParams(rendering)).toEqual({ styles: 'col-lg-8 ' });
    });

    it('should return only Styles when GridParameters not present', () => {
      const rendering: ComponentRendering = {
        componentName: 'TestComponent',
        uid: 'test-uid',
        params: { Styles: 'custom-styles', OtherParam: 'other-value' },
      };

      expect(getSXAParams(rendering)).toEqual({ styles: ' custom-styles' });
    });

    it('should return empty styles string when no params', () => {
      const rendering: ComponentRendering = {
        componentName: 'TestComponent',
        uid: 'test-uid',
      };

      expect(getSXAParams(rendering)).toEqual({ styles: '' });
    });
  });

  describe('getChildComponentProps', () => {
    const mockPage: PlaceholderProps['page'] = {
      layout: {} as any,
      locale: 'en',
      mode: {
        name: 'normal' as any,
        isNormal: true,
        isPreview: false,
        isEditing: false,
        isDesignLibrary: false,
        designLibrary: { isVariantGeneration: false },
      },
    };

    it('should merge placeholder and rendering fields', () => {
      const placeholderProps: PlaceholderProps = {
        name: 'test-placeholder',
        rendering: { componentName: 'Test', uid: 'test-uid' },
        page: mockPage,
        fields: {
          placeholderField: { value: 'placeholder-value' },
          sharedField: { value: 'placeholder-shared-value' },
        },
      };

      const componentRendering: ComponentRendering = {
        componentName: 'TestComponent',
        uid: 'test-uid',
        fields: {
          renderingField: { value: 'rendering-value' },
          sharedField: { value: 'rendering-shared-value' },
        },
      };

      const result = getChildComponentProps(placeholderProps, componentRendering);

      expect(result.fields).toEqual({
        placeholderField: { value: 'placeholder-value' },
        renderingField: { value: 'rendering-value' },
        sharedField: { value: 'rendering-shared-value' },
      });
      expect(result.rendering).toBe(componentRendering);
    });

    it('should merge placeholder and rendering params', () => {
      const placeholderProps: PlaceholderProps = {
        name: 'test-placeholder',
        rendering: { componentName: 'Test', uid: 'test-uid' },
        page: mockPage,
        params: {
          placeholderParam: 'placeholder-param-value',
          sharedParam: 'placeholder-shared-param',
        },
      };

      const componentRendering: ComponentRendering = {
        componentName: 'TestComponent',
        uid: 'test-uid',
        params: {
          renderingParam: 'rendering-param-value',
          sharedParam: 'rendering-shared-param',
          GridParameters: 'col-lg-6',
          Styles: 'custom-class',
        },
      };

      const result = getChildComponentProps(placeholderProps, componentRendering);

      expect(result.params).toEqual({
        placeholderParam: 'placeholder-param-value',
        renderingParam: 'rendering-param-value',
        sharedParam: 'rendering-shared-param',
        GridParameters: 'col-lg-6',
        Styles: 'custom-class',
        styles: 'col-lg-6 custom-class',
      });
      expect(result.rendering).toBe(componentRendering);
    });

    it('should return minimal child component props object', () => {
      const placeholderProps: PlaceholderProps = {
        name: 'test-placeholder',
        rendering: { componentName: 'Test', uid: 'test-uid' },
        page: mockPage,
        componentMap: new Map(),
        missingComponentComponent: MissingComponent,
        hiddenRenderingComponent: HiddenRendering,
      };

      const componentRendering: ComponentRendering = {
        componentName: 'TestComponent',
        uid: 'test-uid',
        fields: { testField: { value: 'test-value' } },
        params: { testParam: 'test-param' },
      };

      const result = getChildComponentProps(placeholderProps, componentRendering);

      expect(result.rendering).toBe(componentRendering);
      expect(result.fields).toEqual({ testField: { value: 'test-value' } });
      expect(result.params).toEqual({ testParam: 'test-param' });
      expect((result as any).componentMap).toBeUndefined();
      expect((result as any).missingComponentComponent).toBeUndefined();
      expect((result as any).hiddenRenderingComponent).toBeUndefined();
      expect((result as any).name).toBeUndefined();
    });
  });

  describe('getComponentForRendering', () => {
    let componentMap: ComponentMap;

    const TestComponent = defineComponent({
      name: 'TestComponent',
      setup: () => () => h('div', 'Test Component'),
    });

    const CustomMissingComponent = defineComponent({
      name: 'CustomMissingComponent',
      setup: () => () => h('div', 'Custom Missing'),
    });

    const CustomHiddenComponent = defineComponent({
      name: 'CustomHiddenComponent',
      setup: () => () => h('div', 'Custom Hidden'),
    });

    beforeEach(() => {
      componentMap = new Map();
    });

    it('should return MissingComponent when componentMap is empty', () => {
      const rendering: ComponentRendering = { componentName: 'TestComponent', uid: 'test-uid' };

      const result = getComponentForRendering(rendering, 'test-placeholder');

      expect(result.component).toBe(MissingComponent);
      expect(result.isEmpty).toBe(true);
      expect(consoleWarnSpy).toHaveBeenCalledOnce();
    });

    it('should return MissingComponent when componentMap is not provided', () => {
      const rendering: ComponentRendering = { componentName: 'TestComponent', uid: 'test-uid' };

      const result = getComponentForRendering(rendering, 'test-placeholder', undefined);

      expect(result.component).toBe(MissingComponent);
      expect(result.isEmpty).toBe(true);
      expect(consoleWarnSpy).toHaveBeenCalledOnce();
    });

    it('should return default export from componentMap entry when exportName not specified', () => {
      const module: VueModule = { default: TestComponent };
      componentMap.set('TestComponent', module);

      const rendering: ComponentRendering = { componentName: 'TestComponent', uid: 'test-uid' };

      const result = getComponentForRendering(rendering, 'test-placeholder', componentMap);

      expect(result.component).toBe(TestComponent);
      expect(result.isEmpty).toBe(false);
    });

    it('should return Default export when default not available', () => {
      const module: VueModule = { Default: TestComponent };
      componentMap.set('TestComponent', module);

      const rendering: ComponentRendering = { componentName: 'TestComponent', uid: 'test-uid' };

      const result = getComponentForRendering(rendering, 'test-placeholder', componentMap);

      expect(result.component).toBe(TestComponent);
    });

    it('should return component directly when it is not a module', () => {
      componentMap.set('TestComponent', TestComponent);

      const rendering: ComponentRendering = { componentName: 'TestComponent', uid: 'test-uid' };

      const result = getComponentForRendering(rendering, 'test-placeholder', componentMap);

      expect(result.component).toBe(TestComponent);
    });

    it('should return custom export by exportName from componentMap when exportName specified', () => {
      const CustomExport = defineComponent({
        name: 'CustomExport',
        setup: () => () => h('div', 'Custom Export'),
      });

      const module: VueModule = { default: TestComponent, CustomVariant: CustomExport };
      componentMap.set('TestComponent', module);

      const rendering: ComponentRendering = {
        componentName: 'TestComponent',
        uid: 'test-uid',
        params: { FieldNames: 'CustomVariant' },
      };

      const result = getComponentForRendering(rendering, 'test-placeholder', componentMap);

      expect(result.component).toBe(CustomExport);
    });

    it('should mark returned component as client when componentType export is client', () => {
      const module: VueModule & { componentType: ComponentType } = {
        default: TestComponent,
        componentType: 'client',
      };
      componentMap.set('TestComponent', module);

      const rendering: ComponentRendering = { componentName: 'TestComponent', uid: 'test-uid' };

      const result = getComponentForRendering(rendering, 'test-placeholder', componentMap);

      expect(result.component).toBe(TestComponent);
      expect(result.componentType).toBe('client');
    });

    it('should return default MissingComponent when component not found in component map', () => {
      componentMap.set('DummyComponent', { default: TestComponent });

      const rendering: ComponentRendering = {
        componentName: 'NonExistentComponent',
        uid: 'test-uid',
      };

      const result = getComponentForRendering(rendering, 'test-placeholder', componentMap);

      expect(result.component).toBe(MissingComponent);
      expect(result.isEmpty).toBe(true);
    });

    it('should return MissingComponent when component variant is not found', () => {
      const CustomVariant = defineComponent({ setup: () => () => h('div') });
      componentMap.set('DummyComponent', { default: TestComponent, CustomVariant });

      const rendering: ComponentRendering = {
        componentName: 'DummyComponent',
        uid: 'test-uid',
        params: { FieldNames: 'NonExistentVariant' },
      };

      const result = getComponentForRendering(rendering, 'test-placeholder', componentMap);

      expect(result.component).toBe(MissingComponent);
      expect(result.isEmpty).toBe(true);
      expect(consoleErrorSpy).toHaveBeenCalledOnce();
    });

    it('should return custom missing component when specified and component not found', () => {
      componentMap.set('DummyComponent', { default: TestComponent });

      const rendering: ComponentRendering = {
        componentName: 'NonExistentComponent',
        uid: 'test-uid',
      };

      const result = getComponentForRendering(
        rendering,
        'test-placeholder',
        componentMap,
        undefined,
        CustomMissingComponent
      );

      expect(result.component).toBe(CustomMissingComponent);
      expect(result.isEmpty).toBe(true);
    });

    it('should return custom hiddenRenderingComponent when component is hidden', () => {
      const rendering: ComponentRendering = {
        componentName: HIDDEN_RENDERING_NAME,
        uid: 'test-uid',
      };

      const result = getComponentForRendering(
        rendering,
        'test-placeholder',
        componentMap,
        CustomHiddenComponent
      );

      expect(result.component).toBe(CustomHiddenComponent);
      expect(result.isEmpty).toBe(true);
    });

    it('should return default HiddenRendering when component is hidden and no custom component provided', () => {
      const rendering: ComponentRendering = {
        componentName: HIDDEN_RENDERING_NAME,
        uid: 'test-uid',
      };

      const result = getComponentForRendering(rendering, 'test-placeholder', componentMap);

      expect(result.component).toBe(HiddenRendering);
      expect(result.isEmpty).toBe(true);
    });

    it('should handle rendering without componentName', () => {
      const rendering: ComponentRendering = { componentName: '', uid: 'test-uid' };

      const result = getComponentForRendering(rendering, 'test-placeholder', componentMap);

      expect(result.isEmpty).toBe(true);
    });
  });
});
