<script setup lang="ts">
import { computed, toRef } from 'vue';
import { isFieldValueEmpty } from '@sitecore-content-sdk/content/layout';
import type { FieldMetadata } from '@sitecore-content-sdk/content/layout';
import { useFieldMetadata } from '../composables/useFieldMetadata';
import { useEmptyFieldEditingComponent } from '../composables/useEmptyFieldEditingComponent';
import FieldMetadataComponent from './FieldMetadata.vue';
import DefaultEmptyFieldEditingComponentText from './DefaultEmptyFieldEditingComponentText.vue';
import type { RichTextProps } from './RichText';

/**
 * The RichText field interface.
 * @public
 */
export interface RichTextField extends FieldMetadata {
  value?: string;
}

/**
 * Renders a Sitecore rich text field.
 *
 * Renders field value as raw HTML. When the field is empty in editing mode,
 * renders a default or custom empty field component.
 * @public
 * @example
 * ```vue
 * <RichText :field="fields.body" tag="div" />
 * ```
 */
defineOptions({ name: 'RichText' });

const props = withDefaults(defineProps<RichTextProps>(), {
  editable: true,
});

const fieldRef = toRef(props, 'field');
const editableRef = toRef(props, 'editable');
const emptyFieldEditingComponentRef = toRef(props, 'emptyFieldEditingComponent');

const tag = computed(() => props.tag || 'div');

const { showMetadata } = useFieldMetadata(fieldRef, editableRef);
const { showEmpty, emptyComponent } = useEmptyFieldEditingComponent(
  fieldRef,
  editableRef,
  emptyFieldEditingComponentRef,
  { defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText }
);
</script>

<template>
  <template v-if="!isFieldValueEmpty(field) || showMetadata">
    <FieldMetadataComponent v-if="showMetadata" :metadata="field!.metadata!">
      <component :is="emptyComponent" v-if="showEmpty" />
      <component
        :is="tag"
        v-else
        :suppress-hydration-warning="showMetadata || undefined"
        v-html="editable && field?.editable ? field.editable : field?.value"
      />
    </FieldMetadataComponent>
    <component
      :is="tag"
      v-else
      v-html="editable && field?.editable ? field.editable : field?.value"
    />
  </template>
</template>
