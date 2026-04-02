import type { DefineComponent } from 'vue';
import type { Page } from '@sitecore-content-sdk/content/client';
import type { SitecoreConfig } from '@sitecore-content-sdk/content/config';
import type { ComponentMap } from '../sharedTypes';
import type { ImportMapImport } from './DesignLibrary/models';

export interface SitecoreProviderProps {
  api: SitecoreConfig['api'];
  page: Page;
  componentMap: ComponentMap;
  loadImportMap: () => Promise<ImportMapImport>;
}

/**
 * Provides the Sitecore page context to all child components via Vue's provide/inject mechanism.
 * Wrap your application or page with this component to make `useSitecoreContext` available
 * throughout the component tree.
 * @example
 * ```vue
 * <template>
 *   <SitecoreProvider :api="api" :page="page" :componentMap="componentMap" :loadImportMap="loadImportMap">
 *     <NuxtPage />
 *   </SitecoreProvider>
 * </template>
 * ```
 * @public
 */
declare const SitecoreProvider: DefineComponent<SitecoreProviderProps>;

export default SitecoreProvider;
export type { SitecoreProviderProps };
