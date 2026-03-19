// src/sharedTypes/component-props.ts
import { ComponentRendering, LayoutServiceData } from '@sitecore-content-sdk/content/layout';
import { VueContentSdkComponent } from '@sitecore-content-sdk/vue';

/**
 * The interface for the component props error.
 * @public
 */
export type ComponentPropsError = { error: string; componentName: string };

/**
 * Shape of component props storage
 * @public
 */
export type ComponentPropsCollection = {
  [componentUid: string]: unknown | ComponentPropsError;
};

/**
 * Type of side effect function which could be invoked on component level via useComponentServerProps composable.
 * @public
 */
export type ComponentPropsFetchFunction<FetchedProps = unknown> = {
  (rendering: ComponentRendering, layoutData: LayoutServiceData): Promise<FetchedProps>;
};

/**
 * Represents a Nuxt component import for use in the Sitecore component map.
 * @public
 */
export type NuxtContentSdkComponent = VueContentSdkComponent & {
  /**
   * Optional dynamic import for lazy components.
   * @example
   * dynamicModule: () => import('./MyComponent.vue')
   */
  dynamicModule?: () => Promise<VueContentSdkComponent>;
  /**
   * Indicates the type of the component in a Nuxt context.
   * - 'client': The component contains client only api's and will be rendered on the client side.
   * - 'server': The component contains server only api's and will be rendered on the server side.
   * - 'universal': The component is isomorphic and can be rendered on both server and client.
   */
  componentType?: 'client' | 'server' | 'universal';
};
