<script setup lang="ts">
import { computed, toRef, useAttrs } from 'vue';
import { isFieldValueEmpty } from '@sitecore-content-sdk/content/layout';
import { useFieldMetadata } from '../composables/useFieldMetadata';
import { useEmptyFieldEditingComponent } from '../composables/useEmptyFieldEditingComponent';
import FieldMetadataComponent from './FieldMetadata.vue';
import DefaultEmptyFieldEditingComponentText from './DefaultEmptyFieldEditingComponentText.vue';
import type { DateFieldProps } from './DateField';

/**
 * Renders a Sitecore date field.
 *
 * Renders the date value as a string, optionally wrapped in an HTML element.
 * Accepts a custom `render` function to format the date. When the field is
 * empty in editing mode, renders a default or custom empty field component.
 * @public
 * @example
 * ```vue
 * <DateField :field="fields.date" tag="span" />
 * ```
 * @example
 * ```vue
 * <DateField :field="fields.date" :render="(date) => date?.toLocaleDateString('nl-NL')" />
 * ```
 */
defineOptions({ name: 'DateField', inheritAttrs: false });

const attrs = useAttrs();

const props = withDefaults(defineProps<DateFieldProps>(), {
  editable: true,
});

const fieldRef = toRef(props, 'field');
const editableRef = toRef(props, 'editable');
const emptyFieldEditingComponentRef = toRef(props, 'emptyFieldEditingComponent');

const { showMetadata } = useFieldMetadata(fieldRef, editableRef);
const { showEmpty, emptyComponent } = useEmptyFieldEditingComponent(
  fieldRef,
  editableRef,
  emptyFieldEditingComponentRef,
  { defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText }
);

const tag = computed(() => props.tag || null);

const dateContent = computed(() => {
  if (!props.field?.value) return null;
  const date = new Date(props.field.value);
  return props.render ? props.render(date) : props.field.value;
});
</script>

<template>
  <template v-if="!isFieldValueEmpty(field) || showMetadata">
    <FieldMetadataComponent v-if="showMetadata" :metadata="field!.metadata!">
      <component v-if="showEmpty" :is="emptyComponent" />
      <component
        v-else-if="tag"
        :is="tag"
        v-bind="attrs"
        :suppressHydrationWarning="showMetadata || undefined"
        >{{ dateContent }}</component
      >
      <template v-else>{{ dateContent }}</template>
    </FieldMetadataComponent>
    <component v-else-if="tag" :is="tag" v-bind="attrs">{{ dateContent }}</component>
    <template v-else>{{ dateContent }}</template>
  </template>
</template>
