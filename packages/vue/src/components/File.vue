<script setup lang="ts">
import { computed, useSlots } from 'vue';
import { isFieldValueEmpty } from '@sitecore-content-sdk/content/layout';
import { FileField, FileFieldValue } from './File';

defineOptions({
  name: 'File',
});

const props = defineProps<{
  /** The file field data. */
  field: FileFieldValue | FileField;
}>();

const slots = useSlots();

const dynamicField = computed<FileFieldValue | FileField>(() => props.field);

const isEmpty = computed(() => isFieldValueEmpty(dynamicField.value as any));

const file = computed<FileFieldValue | null>(() => {
  if (isEmpty.value) {
    return null;
  }

  const df = dynamicField.value as FileFieldValue | FileField;

  // handle link directly on field for forgetful devs
  const candidate =
    (df as FileFieldValue).src != null ? (df as FileFieldValue) : (df as FileField).value;

  return candidate ?? null;
});

const linkText = computed(() => {
  if (!file.value) return '';
  return (file.value.title || file.value.displayName || '') as string;
});

const hasDefaultSlot = computed(() => !!slots.default);
</script>

<template>
  <template v-if="file && file.src">
    <a :href="file.src" v-bind="$attrs">
      <template v-if="!hasDefaultSlot && linkText">
        {{ linkText }}
      </template>
      <slot></slot>
    </a>
  </template>
</template>
