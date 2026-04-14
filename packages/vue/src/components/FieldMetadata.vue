<script setup lang="ts">
import { computed } from 'vue';
import { MetadataKind } from '@sitecore-content-sdk/content/editing';

/**
 * Renders field metadata markup for chromes hydration in Sitecore Page Builder.
 * Wraps children between open and close code tags containing the field metadata.
 * @public
 */
defineOptions({ name: 'FieldMetadata' });

const props = defineProps<{
  metadata: { [key: string]: unknown };
}>();

const data = computed(() => JSON.stringify(props.metadata));

const baseAttributes = {
  type: 'text/sitecore',
  chrometype: 'field',
  class: 'scpm',
};

const openAttributes = { ...baseAttributes, kind: MetadataKind.Open };
const closeAttributes = { ...baseAttributes, kind: MetadataKind.Close };
</script>

<template>
  <code v-bind="openAttributes">{{ data }}</code>
  <slot />
  <code v-bind="closeAttributes"></code>
</template>
