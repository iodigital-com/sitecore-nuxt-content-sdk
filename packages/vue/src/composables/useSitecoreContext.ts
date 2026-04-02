import { inject } from 'vue';
import type { InjectionKey, Ref } from 'vue';
import type { Page } from '@sitecore-content-sdk/content/client';
import type { SitecoreConfig } from '@sitecore-content-sdk/content/config';
import type { ComponentMap } from '../sharedTypes';
import type { ImportMapImport } from '../components/DesignLibrary/models';

/**
 * The state provided by SitecoreProvider.
 * @public
 */
export interface SitecoreProviderState {
  /** The current page data as a reactive ref. */
  page: Ref<Page>;
  /**
   * Method to update the page. Only exposed when `updatable: true` is passed to `useSitecore`.
   * @param {Page} value - The new page value.
   */
  setPage?: (value: Page) => void;
  /** The API configuration defined in the `SitecoreConfig`. */
  api?: SitecoreConfig['api'];
  /** The component map to use for rendering components. */
  componentMap: ComponentMap;
  /** The dynamic import for import map to be used in variant generation mode. */
  loadImportMap: () => Promise<ImportMapImport>;
}

/**
 * Options for the useSitecore composable.
 * @public
 */
export interface UseSitecoreContextOptions {
  /**
   * If set to true, the `setPage` method will be exposed.
   */
  updatable?: boolean;
}

export const SitecoreProviderKey: InjectionKey<SitecoreProviderState> = Symbol('SitecoreProvider');

/**
 * Composable that provides access to the current Sitecore page and API configuration.
 * Must be used within a component tree wrapped by `SitecoreProvider`.
 * @param {UseSitecoreContextOptions} [options] - Composable options
 * @returns {SitecoreProviderState} The current Sitecore context
 * @throws {Error} When used outside of a SitecoreProvider
 * @example
 * const { page } = useSitecoreContext();
 * console.log(page.value.mode.isEditing);
 * @example
 * // With updatable option to expose setPage
 * const { page, setPage } = useSitecoreContext({ updatable: true });
 * setPage(newPage);
 * @public
 */
export function useSitecoreContext(options?: UseSitecoreContextOptions): SitecoreProviderState {
  const context = inject(SitecoreProviderKey);

  if (!context) {
    throw new Error('useSitecoreContext must be used within a SitecoreProvider');
  }

  return {
    ...context,
    setPage: options?.updatable ? context.setPage : undefined,
  };
}
