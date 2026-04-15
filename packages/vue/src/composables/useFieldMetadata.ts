import { computed } from 'vue';
import type { Ref } from 'vue';

/**
 * Props interface for components that support field metadata.
 * @public
 */
export interface WithMetadataProps {
  field?: {
    metadata?: { [key: string]: unknown };
  };
  editable?: boolean;
}

/**
 * Composable that determines whether field metadata markup should be rendered.
 *
 * When a field has metadata and editing is enabled, components should wrap their
 * output with `FieldMetadata`. Use this composable to read that state.
 * @param {Ref<WithMetadataProps['field']>} field - The field prop
 * @param {Ref<boolean>} editable - Whether the field is editable
 * @returns An object containing showMetadata (whether to display field metadata) and metadata (the field's metadata object)
 * @public
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { toRef } from 'vue';
 * import { useFieldMetadata } from '../enhancers/withFieldMetadata';
 * import FieldMetadata from './FieldMetadata.vue';
 *
 * const props = defineProps<{ field?: { value?: string; metadata?: Record<string, unknown> }; editable?: boolean }>();
 * const { showMetadata, metadata } = useFieldMetadata(toRef(props, 'field'), toRef(props, 'editable'));
 * </script>
 *
 * <template>
 *   <FieldMetadata v-if="showMetadata" :metadata="metadata">
 *     <span>{{ field?.value }}</span>
 *   </FieldMetadata>
 *   <span v-else>{{ field?.value }}</span>
 * </template>
 * ```
 */
export function useFieldMetadata(
  field: Ref<WithMetadataProps['field'] | undefined>,
  editable: Ref<boolean | undefined>
) {
  const showMetadata = computed(() => {
    return !!(field.value?.metadata && (editable.value ?? true));
  });

  const metadata = computed(() => field.value?.metadata);

  return { showMetadata, metadata };
}
