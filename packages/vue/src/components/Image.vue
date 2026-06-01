<script setup lang="ts">
import { computed, toRef, useAttrs } from 'vue';
import { isFieldValueEmpty } from '@sitecore-content-sdk/content/layout';
import { mediaApi } from '@sitecore-content-sdk/content/media';
import { useFieldMetadata } from '../composables/useFieldMetadata';
import { useEmptyFieldEditingComponent } from '../composables/useEmptyFieldEditingComponent';
import FieldMetadataComponent from './FieldMetadata.vue';
import DefaultEmptyFieldEditingComponentImage from './DefaultEmptyFieldEditingComponentImage.vue';
import type { ImageProps, ImageField, ImageFieldValue } from './Image';

/**
 * Renders a Sitecore image field.
 *
 * Handles media URL rewriting for proxy/CDN environments and supports
 * srcset for responsive images. When the field is empty in editing mode,
 * renders a default or custom empty field component.
 *
 * HTML attributes such as `class`, `alt`, `width`, and `height` can be passed
 * directly and will be applied to the rendered `<img>` element.
 * @public
 * @example
 * ```vue
 * <Image :field="fields.photo" :imageParams="{ mw: 300 }" alt="My photo" class="hero" />
 * ```
 */
defineOptions({ name: 'Image', inheritAttrs: false });

const attrs = useAttrs();

const props = withDefaults(defineProps<ImageProps>(), {
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
  { defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentImage }
);

const imageAttrs = computed(() => {
  const dynamicMedia = props.field as ImageField | ImageFieldValue | undefined;

  if (!dynamicMedia || isFieldValueEmpty(dynamicMedia)) return null;

  // Support both raw value (has src directly) and wrapped field value (has .value.src)
  const rawImg = (dynamicMedia as ImageFieldValue).src
    ? { ...(dynamicMedia as ImageFieldValue) }
    : { ...(dynamicMedia as ImageField).value };

  if (!rawImg?.src) return null;

  // Strip metadata and srcSet before binding to the DOM
  const {
    metadata: _metadata,
    srcSet: _srcSet,
    src,
    ...otherAttrs
  } = rawImg as Record<string, unknown> & {
    src?: string;
    srcSet?: unknown;
    metadata?: unknown;
  };

  const resolvedSrc = mediaApi.updateImageUrl(
    src as string,
    props.imageParams,
    props.mediaUrlPrefix
  );

  const newAttrs: Record<string, unknown> = {
    // Field attributes from Sitecore (width, height, alt, etc.)
    ...otherAttrs,
    // User-provided attributes override field attributes
    ...attrs,
    // src and srcset always come from the computed values
    src: resolvedSrc,
  };

  // Vue extracts declared props from attrs, so class must be added explicitly
  // since it's defined in ImageProps for documentation purposes
  if (props.class) {
    newAttrs.class = props.class;
  }

  if (props.srcSet) {
    newAttrs.srcset = mediaApi.getSrcSet(
      resolvedSrc,
      props.srcSet,
      props.imageParams,
      props.mediaUrlPrefix
    );
  }

  return newAttrs;
});
</script>

<template>
  <template v-if="!isFieldValueEmpty(field) || showMetadata">
    <FieldMetadataComponent v-if="showMetadata" :metadata="field!.metadata!">
      <component :is="emptyComponent" v-if="showEmpty" v-bind="attrs" :class="props.class" />
      <img v-else-if="imageAttrs" v-bind="imageAttrs" />
    </FieldMetadataComponent>
    <img v-else-if="imageAttrs" v-bind="imageAttrs" />
  </template>
</template>
