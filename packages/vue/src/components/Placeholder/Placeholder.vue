<script setup lang="ts">
import { onMounted } from 'vue';
import { PlaceholderProps } from './models';
import { useSitecoreContext } from '../../composables/useSitecoreContext';
import { getPlaceholderRenderings } from './placeholder-utils';
import { PagesEditor } from '@sitecore-content-sdk/content/editing';
import AppPlaceholder from './AppPlaceholder.vue';

/**
 * Renders the components assigned to a placeholder in Sitecore.
 *
 * Reads the current page and componentMap from the `SitecoreProvider` context via `useSitecoreContext`.
 * Resolves the placeholder renderings from the provided rendering data and delegates
 * the actual rendering to `AppPlaceholder`.
 *
 * When the placeholder is empty and Page Builder is active, resets the editing chromes
 * on mount so Page Builder can correctly identify the empty placeholder.
 * @public
 * @example
 * ```vue
 * <Placeholder name="main" :rendering="route" />
 * ```
 */
defineOptions({
  name: 'Placeholder',
});

const props = defineProps<PlaceholderProps>();

const { page, componentMap } = useSitecoreContext();
const placeholderRenderings = getPlaceholderRenderings(
  props.rendering,
  props.name,
  page.value.mode.isEditing
);
const isEmpty = !placeholderRenderings.length;

onMounted(() => {
  if (isEmpty && PagesEditor.isActive()) {
    PagesEditor.resetChromes();
  }
});

const appProps = { ...props, page: page.value, componentMap: componentMap };
</script>

<template>
  <AppPlaceholder v-bind="appProps" />
</template>
