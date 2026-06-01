<script setup lang="ts">
import { computed, toRef, useAttrs, useSlots } from 'vue';
import { isFieldValueEmpty } from '@sitecore-content-sdk/content/layout';
import { useFieldMetadata } from '../composables/useFieldMetadata';
import { useEmptyFieldEditingComponent } from '../composables/useEmptyFieldEditingComponent';
import FieldMetadataComponent from './FieldMetadata.vue';
import DefaultEmptyFieldEditingComponentText from './DefaultEmptyFieldEditingComponentText.vue';
import type { LinkProps, LinkField, LinkFieldValue } from './Link';

/**
 * Renders a Sitecore link field as an `<a>` element.
 *
 * Supports both wrapped (`{ value: { href } }`) and raw (`{ href }`) field formats.
 * When the field is empty in editing mode, renders a default or custom empty field component.
 *
 * HTML attributes such as `id`, `style`, and `class` can be passed directly
 * and will be applied to the rendered `<a>` element.
 * @public
 * @example
 * ```vue
 * <Link :field="fields.link" />
 * <Link :field="fields.link" showLinkTextWithChildrenPresent>
 *   <span>Custom label</span>
 * </Link>
 * ```
 */
defineOptions({ name: 'Link', inheritAttrs: false });

const attrs = useAttrs();
const slots = useSlots();

const props = withDefaults(defineProps<LinkProps>(), {
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

const linkAttrs = computed(() => {
  const dynamicField = props.field as LinkField | LinkFieldValue | undefined;

  if (!dynamicField || isFieldValueEmpty(dynamicField)) return null;

  const link = (dynamicField as LinkFieldValue).href
    ? (dynamicField as LinkFieldValue)
    : (dynamicField as LinkField).value;

  if (!link) return null;

  const anchor = link.linktype !== 'anchor' && link.anchor ? `#${link.anchor}` : '';
  const querystring = link.querystring ? `?${link.querystring}` : '';

  const anchorAttrs: Record<string, unknown> = {
    href: `${link.href}${querystring}${anchor}`,
    class: link.class,
    title: link.title,
    target: link.target,
    ...attrs,
  };

  if (anchorAttrs.target === '_blank' && !anchorAttrs.rel) {
    anchorAttrs.rel = 'noopener noreferrer';
  }

  return anchorAttrs;
});

const linkText = computed(() => {
  const dynamicField = props.field as LinkField | LinkFieldValue | undefined;
  if (!dynamicField || isFieldValueEmpty(dynamicField)) return null;

  const link = (dynamicField as LinkFieldValue).href
    ? (dynamicField as LinkFieldValue)
    : (dynamicField as LinkField).value;

  if (!link) return null;

  const hasChildren = !!slots.default;
  return props.showLinkTextWithChildrenPresent || !hasChildren
    ? link.text || link.href || null
    : null;
});
</script>

<template>
  <template v-if="!isFieldValueEmpty(field) || showMetadata">
    <FieldMetadataComponent v-if="showMetadata" :metadata="field!.metadata!">
      <component :is="emptyComponent" v-if="showEmpty" />
      <a v-else-if="linkAttrs" v-bind="linkAttrs">{{ linkText }}<slot /></a>
    </FieldMetadataComponent>
    <a v-else-if="linkAttrs" v-bind="linkAttrs">{{ linkText }}<slot /></a>
  </template>
</template>
