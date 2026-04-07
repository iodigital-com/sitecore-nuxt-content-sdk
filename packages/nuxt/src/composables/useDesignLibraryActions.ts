import { refreshNuxtData } from 'nuxt/app';
import { debug } from '@sitecore-content-sdk/content';
import type { ComponentRendering } from '@sitecore-content-sdk/content/layout';
import type {
  ServerComponentPreviewEventArgs,
  GeneratedComponentData,
} from '@sitecore-content-sdk/content/codegen';
import { fetchGeneratedComponentFromCache } from '@sitecore-content-sdk/content/codegen';
import { setCache } from '@sitecore-content-sdk/core/tools';
import {
  COMPONENT_UPDATE_CACHE_KEY_PREFIX,
  COMPONENT_PREVIEW_CACHE_KEY_PREFIX,
} from '@sitecore-content-sdk/content/editing';

/**
 * Model containing the data for a component update received from Design Library.
 * @public
 */
export type ComponentUpdateModel = {
  /** Unique identifier of the component being updated. */
  uid: string;
  /** The updated component rendering data. */
  rendering?: ComponentRendering;
  /**
   * The data needed for generated component to be rendered on the server.
   * Required if update event is coming for a generated component in variant generation mode.
   */
  generatedComponentData?: GeneratedComponentData;
};

/**
 * Model containing the result of a component preview cache update.
 * @public
 */
export type ComponentPreviewModel = {
  /** Unique identifier of the component being updated. */
  uid: string;
  /** The data needed for generated component to be rendered on the server. */
  generatedComponentData?: GeneratedComponentData;
  /** The updated component rendering data. */
  rendering?: ComponentRendering | null;
  /** Error message in case fetching generated component data from secured cache endpoint fails. */
  error?: string;
};

/**
 * Model containing the preview event data received from Design Library in variant generation mode.
 * @public
 */
export type PreviewEventModel = {
  /** Unique identifier of the component being updated. */
  uid: string;
  /** The preview component event arguments in variant generation mode. */
  args: ServerComponentPreviewEventArgs;
};

/**
 * Composable that provides server-side component cache update functions for use with
 * Sitecore Design Library.
 *
 * Replaces Next.js server actions with Nuxt-compatible equivalents.
 * Uses `refreshNuxtData` to invalidate the page cache after updating component data,
 * triggering a server-side re-render of the affected components.
 * @public
 * @example
 * const { updateComponent, previewComponent } = useDesignLibraryActions();
 *
 * // Update a component from a Design Library event
 * await updateComponent({ uid: 'component-uid', rendering: updatedRendering });
 */
export function useDesignLibraryActions() {
  /**
   * Updates the global cache with the provided component data received from Design Library.
   * Stores the given {@link ComponentUpdateModel} in the cache using a key based on the component UID.
   * Invalidates the page cache via `refreshNuxtData` to trigger a re-render.
   * @param {ComponentUpdateModel} updatedComponent - The component update model
   * @returns {Promise<void>}
   */
  async function updateComponent(updatedComponent: ComponentUpdateModel): Promise<void> {
    debug.editing(`Updating server component cache for Update Component: ${updatedComponent.uid}`);
    setCache(`${COMPONENT_UPDATE_CACHE_KEY_PREFIX}${updatedComponent.uid}`, updatedComponent);
    await refreshNuxtData();
  }

  /**
   * Updates the global cache with the generated component data in variant generation mode.
   * Fetches the generated component data from a secured cache endpoint via the provided
   * event arguments, then invalidates the page cache via `refreshNuxtData`.
   * @param {PreviewEventModel} previewEvent - The preview event model
   * @param {ComponentRendering | null} rendering - The component rendering data
   * @param {string} [edgeUrl] - Optional Edge URL to fetch the generated component data
   * @returns {Promise<void>}
   */
  async function previewComponent(
    previewEvent: PreviewEventModel,
    rendering: ComponentRendering | null,
    edgeUrl: string | undefined
  ): Promise<void> {
    debug.editing(`Updating server component cache for Preview Component: ${previewEvent.uid}`);

    const updatedComponent: ComponentPreviewModel = {
      uid: previewEvent.uid,
      generatedComponentData: undefined,
      rendering,
      error: undefined,
    };

    if (previewEvent.args) {
      try {
        updatedComponent.generatedComponentData = await fetchGeneratedComponentFromCache(
          previewEvent.args.message.cache.id,
          previewEvent.args.message.cache.token,
          edgeUrl
        );
      } catch (error) {
        debug.editing(
          `Error fetching generated component data from cache for Component: ${previewEvent.uid}`,
          error
        );
        updatedComponent.error = error instanceof Error ? error.message : String(error);
      }
    } else {
      debug.editing(`No preview event arguments provided for Component: ${previewEvent.uid}`);
      updatedComponent.error = 'No preview event arguments provided';
    }

    setCache(`${COMPONENT_PREVIEW_CACHE_KEY_PREFIX}${updatedComponent.uid}`, updatedComponent);
    await refreshNuxtData();
  }

  return { updateComponent, previewComponent };
}
