// @iodigital-com/sitecore-content-sdk-vue/src/sharedTypes/component-props.ts
import { defineAsyncComponent, type Component } from 'vue';

/**
 * SXA uses custom default export name
 */
export const DEFAULT_EXPORT_NAME = 'Default';

/**
 * Vue component import with account for custom exports
 * @public
 */
export type VueModule = {
  [key: string]: unknown;
  default?: Component;
  Default?: Component;
};

/**
 * Vue component import for use in the Sitecore component map.
 * @public
 */
export type VueContentSdkComponent = (Component | VueModule) & {
  componentType?: 'server' | 'client' | 'universal';
};

/**
 * The type of the component map.
 * @public
 */
export type ComponentMap<TComponent extends VueContentSdkComponent = VueContentSdkComponent> = Map<
  string,
  TComponent
>;

/**
 * Define an async Vue component for use in the Sitecore component map. Enables Vue's async component loading and allows for more optimized builds by supporting tree-shaking of components that are not used on the server or client.
 * @param {() => Promise<{ default: Component }>} loader - Async loader that resolves to a module with a default component.
 * @param {'server'|'client'|'universal'} [componentType] - Optional component type annotation.
 * @returns A VueContentSdkComponent ready for use in the component map.
 * @public
 * @example
 * // app/components/componentMap.ts
 * const componentMap: ComponentMap = new Map([
 *  ['MyComponent', defineSitecoreComponent(() => import('./MyComponent.vue'), 'client')],
 * ]);
 */
export function defineSitecoreComponent(
  loader: () => Promise<{ default: Component }>,
  componentType: 'server' | 'client' | 'universal'
): VueContentSdkComponent {
  const component = defineAsyncComponent(loader) as VueContentSdkComponent;
  if (componentType) {
    component.componentType = componentType;
  }
  return component;
}
