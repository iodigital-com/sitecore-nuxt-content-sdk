<script setup lang="ts">
import {
  getDynamicPlaceholderPattern,
  isDynamicPlaceholder,
} from '@sitecore-content-sdk/content/layout';
import { MetadataKind, DEFAULT_PLACEHOLDER_UID } from '@sitecore-content-sdk/content/editing';
import { PlaceholderMetadataProps, CodeBlockAttributes } from './models';

/**
 * Generates metadata chrome blocks for a placeholder or rendering in Sitecore Page Builder.
 *
 * Renders an open and close `<code>` block around its slot content, with the correct
 * Sitecore chrome attributes. Page Builder uses these blocks to identify and select
 * components and placeholders on the page.
 *
 * When `placeholderName` is provided, generates placeholder chromes.
 * When omitted, generates rendering chromes.
 *
 * Supports dynamic placeholders (SXA) by matching the placeholder name against
 * registered dynamic placeholder patterns.
 * @internal
 * @example
 * <!-- Rendering chrome -->
 * <PlaceholderMetadata :rendering="componentRendering">
 *   <MyComponent />
 * </PlaceholderMetadata>
 * @example
 * <!-- Placeholder chrome -->
 * <PlaceholderMetadata :rendering="routeRendering" placeholder-name="main">
 *   <ChildComponents />
 * </PlaceholderMetadata>
 */
defineOptions({
  name: 'PlaceholderMetadata',
});

const props = defineProps<PlaceholderMetadataProps>();

/**
 * Builds the attributes for an open or close chrome code block.
 * For open placeholder chromes, resolves the placeholder ID including support for dynamic placeholders.
 * For open rendering chromes, adds the `data-csdk-component-runtime` attribute when a runtime is provided.
 * @param {object} params
 * @param {MetadataKind} params.kind - Whether this is an open or close chrome block
 * @param {string} [params.id] - The UID of the rendering or placeholder
 * @param {string} [params.placeholderName] - When provided, generates placeholder chrome attributes instead of rendering chrome attributes
 * @returns {CodeBlockAttributes} The attributes to apply to the `<code>` element
 */
const getCodeBlockAttributes = ({
  kind,
  id,
  placeholderName,
}: {
  kind: MetadataKind;
  id?: string;
  placeholderName?: string;
}): CodeBlockAttributes => {
  const chrometype = placeholderName ? 'placeholder' : 'rendering';

  const attributes: CodeBlockAttributes = {
    type: 'text/sitecore',
    chrometype,
    class: 'scpm',
    kind,
  };

  if (kind === MetadataKind.Open) {
    if (chrometype === 'placeholder' && placeholderName) {
      let phId = '';

      for (const placeholder of Object.keys(props.rendering.placeholders ?? {})) {
        if (placeholderName === placeholder) {
          phId = id ? `${placeholderName}_${id}` : `${placeholderName}_${DEFAULT_PLACEHOLDER_UID}`;
          break;
        }

        if (isDynamicPlaceholder(placeholder)) {
          const pattern = getDynamicPlaceholderPattern(placeholder);

          if (pattern.test(placeholderName)) {
            phId = id ? `${placeholder}_${id}` : `${placeholder}_${DEFAULT_PLACEHOLDER_UID}`;
            break;
          }
        }
      }

      attributes.id = phId;
    } else {
      attributes.id = id;
    }

    if (chrometype === 'rendering' && props.componentRuntime) {
      attributes['data-csdk-component-runtime'] = props.componentRuntime;
    }
  }

  return attributes;
};
</script>

<template>
  <code
    v-bind="getCodeBlockAttributes({ kind: MetadataKind.Open, id: rendering.uid, placeholderName })"
  />
  <slot />
  <code v-bind="getCodeBlockAttributes({ kind: MetadataKind.Close, placeholderName })" />
</template>
