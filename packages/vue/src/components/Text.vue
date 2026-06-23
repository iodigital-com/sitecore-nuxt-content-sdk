<script setup lang="ts">
import { computed, toRef } from 'vue';
import { isFieldValueEmpty } from '@sitecore-content-sdk/content/layout';
import { useFieldMetadata } from '../composables/useFieldMetadata';
import { useEmptyFieldEditingComponent } from '../composables/useEmptyFieldEditingComponent';
import FieldMetadataComponent from './FieldMetadata.vue';
import DefaultEmptyFieldEditingComponentText from './DefaultEmptyFieldEditingComponentText.vue';
import type { TextProps } from './Text';

defineOptions({ name: 'Text' });

const props = withDefaults(defineProps<TextProps>(), {
  editable: true,
  encode: true,
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

const isEmpty = computed(() => isFieldValueEmpty(props.field));

const tag = computed(() => props.tag || 'span');

const formattedParts = computed(() => {
  if (isEmpty.value) return [];
  const raw = String(props.field?.value ?? '');
  const parts = raw.split('\n');
  if (parts.length <= 1) return [raw];
  return parts;
});

const hasLineBreaks = computed(() => formattedParts.value.length > 1);
</script>

<template>
  <template v-if="!isEmpty || showMetadata">
    <FieldMetadataComponent v-if="showMetadata" :metadata="field!.metadata!">
      <component :is="emptyComponent" v-if="showEmpty" v-bind="{ tag }" />
      <component
        :is="tag"
        v-else-if="encode"
        :suppress-hydration-warning="showMetadata || undefined"
      >
        <template v-if="hasLineBreaks">
          <template v-for="(part, i) in formattedParts" :key="i">
            {{ part }}<br v-if="i < formattedParts.length - 1" />
          </template>
        </template>
        <template v-else>{{ field?.value }}</template>
      </component>
      <component :is="tag" v-else v-html="field?.value" />
    </FieldMetadataComponent>
    <template v-else-if="!showMetadata && !isEmpty">
      <component :is="tag" v-if="!encode" v-html="String(field?.value ?? '')" />
      <component :is="tag" v-else-if="tag !== 'span'">
        <template v-if="hasLineBreaks">
          <template v-for="(part, i) in formattedParts" :key="i">
            {{ part }}<br v-if="i < formattedParts.length - 1" />
          </template>
        </template>
        <template v-else>{{ field?.value }}</template>
      </component>
      <template v-else>
        <template v-if="hasLineBreaks">
          <template v-for="(part, i) in formattedParts" :key="i">
            {{ part }}<br v-if="i < formattedParts.length - 1" />
          </template>
        </template>
        <template v-else>{{ field?.value }}</template>
      </template>
    </template>
  </template>
</template>
