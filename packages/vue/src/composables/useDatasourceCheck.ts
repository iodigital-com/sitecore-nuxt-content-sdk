import { computed, defineComponent, h, type Component, type Ref } from 'vue';
import { useSitecoreContext } from './useSitecoreContext';
import type { ComponentRendering } from '@sitecore-content-sdk/content/layout';

/**
 * Default component rendered when a datasource is missing in editing mode.
 * @public
 */
export const DefaultDatasourceError = defineComponent({
  name: 'DefaultDatasourceError',
  setup: () => () =>
    h(
      'div',
      { class: 'sc-jss-editing-error', role: 'alert' },
      'Datasource is required. Please choose a content item for this component.'
    ),
});

/**
 * Options for the useDatasourceCheck composable.
 * @public
 */
export interface UseDatasourceCheckOptions {
  /**
   * A component that is rendered when a datasource is missing during editing.
   * If unspecified, a default component with message is displayed.
   */
  editingErrorComponent?: Component;
}

/**
 * Composable that checks whether a Sitecore datasource is present and determines
 * what to render depending on page mode.
 *
 * Returns:
 * - `'component'` when the datasource is present or page is in Design Library mode
 * - `'error'` when the datasource is missing in editing mode
 * - `'null'` when the datasource is missing in normal mode
 * @param {Ref<ComponentRendering>} rendering - The component rendering ref
 * @param {UseDatasourceCheckOptions} [options] - Optional composable options
 * @returns {{ renderState, errorComponent }} render state and error component to use
 * @public
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { toRef } from 'vue';
 * import { useDatasourceCheck } from '../enhancers/useDatasourceCheck';
 *
 * const props = defineProps<{ rendering: ComponentRendering }>();
 * const { renderState, errorComponent } = useDatasourceCheck(toRef(props, 'rendering'));
 * </script>
 *
 * <template>
 *   <component :is="errorComponent" v-if="renderState === 'error'" />
 *   <template v-else-if="renderState === 'component'">
 *     <!-- component content -->
 *   </template>
 * </template>
 * ```
 */
export function useDatasourceCheck(
  rendering: Ref<ComponentRendering>,
  options?: UseDatasourceCheckOptions
) {
  const { page } = useSitecoreContext();

  const renderState = computed<'component' | 'error' | 'null'>(() => {
    if (page.value.mode.isDesignLibrary || rendering.value?.dataSource) {
      return 'component';
    }
    if (page.value.mode.isEditing) {
      return 'error';
    }
    return 'null';
  });

  const errorComponent = computed<Component>(() => {
    return options?.editingErrorComponent ?? DefaultDatasourceError;
  });

  return { renderState, errorComponent };
}
