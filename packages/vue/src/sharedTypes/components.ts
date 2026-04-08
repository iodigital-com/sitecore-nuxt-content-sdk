// @sitecore-content-sdk/vue/src/sharedTypes/component-props.ts
import { Component } from 'vue';

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
