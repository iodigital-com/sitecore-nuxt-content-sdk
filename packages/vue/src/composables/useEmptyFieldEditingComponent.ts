import { computed } from 'vue';
import type { Ref, Component } from 'vue';
import { isFieldValueEmpty } from '@sitecore-content-sdk/content/layout';
import type { GenericFieldValue, Field, FieldMetadata } from '@sitecore-content-sdk/content/layout';

/**
 * Field type accepted by the composable.
 * @public
 */
export type EmptyFieldEditingField = (Partial<Field> | GenericFieldValue) & FieldMetadata;

/**
 * Options for the useEmptyFieldEditingComponent composable.
 * @public
 */
export interface UseEmptyFieldEditingComponentOptions {
  /** The default empty field editing component to render when no custom one is provided. */
  defaultEmptyFieldEditingComponent: Component;
}

/**
 * Composable that determines whether an empty field editing component should be rendered
 * instead of the actual field component.
 *
 * Returns `showEmpty` (whether to render the empty component) and `emptyComponent`
 * (the component to render — custom or default).
 *
 * Only activates when:
 * - The field has metadata (editing mode)
 * - The field is editable
 * - The field value is empty
 * @param {Ref<EmptyFieldEditingField | undefined>} field - The field prop
 * @param {Ref<boolean | undefined>} editable - Whether the field is editable
 * @param {Ref<Component | undefined>} emptyFieldEditingComponent - Optional custom empty component
 * @param {UseEmptyFieldEditingComponentOptions} options - Composable options
 * @returns {{ showEmpty: Ref<boolean>, emptyComponent: Ref<Component | null> }} An object containing showEmpty (whether to render the empty component) and emptyComponent (the component to render)
 * @public
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { toRef } from 'vue';
 * import { useEmptyFieldEditingComponent } from '../enhancers/useEmptyFieldEditingComponent';
 * import DefaultEmptyFieldEditingComponentText from './DefaultEmptyFieldEditingComponentText.vue';
 *
 * const props = defineProps<{ field?: any; editable?: boolean; emptyFieldEditingComponent?: Component }>();
 * const { showEmpty, emptyComponent } = useEmptyFieldEditingComponent(
 *   toRef(props, 'field'),
 *   toRef(props, 'editable'),
 *   toRef(props, 'emptyFieldEditingComponent'),
 *   { defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText }
 * );
 * </script>
 *
 * <template>
 *   <component v-if="showEmpty" :is="emptyComponent" v-bind="emptyProps" />
 *   <span v-else>{{ field?.value }}</span>
 * </template>
 * ```
 */
export function useEmptyFieldEditingComponent(
  field: Ref<EmptyFieldEditingField | undefined>,
  editable: Ref<boolean | undefined>,
  emptyFieldEditingComponent: Ref<Component | undefined>,
  options: UseEmptyFieldEditingComponentOptions
) {
  const showEmpty = computed(() => {
    const isEditable = editable.value ?? true;
    return !!(field.value?.metadata && isEditable && isFieldValueEmpty(field.value));
  });

  const emptyComponent = computed<Component | null>(() => {
    if (!showEmpty.value) return null;
    return emptyFieldEditingComponent.value || options.defaultEmptyFieldEditingComponent;
  });

  const isCustomComponent = computed(() => !!emptyFieldEditingComponent.value);

  return { showEmpty, emptyComponent, isCustomComponent };
}
