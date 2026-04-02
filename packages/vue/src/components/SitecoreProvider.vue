<script setup lang="ts">
import { ref, watch, provide } from 'vue';
import fastDeepEqual from 'fast-deep-equal/es6/index';
import type { Page } from '@sitecore-content-sdk/content/client';
import { SitecoreProviderKey } from '../composables/useSitecoreContext';
import type { SitecoreProviderProps } from './SitecoreProvider';

defineOptions({
  name: 'SitecoreProvider',
});

const props = defineProps<SitecoreProviderProps>();

const page = ref<Page>(props.page);

watch(
  () => props.page,
  (newPage) => {
    if (!fastDeepEqual(newPage, page.value)) {
      page.value = newPage;
    }
  }
);

const setPage = (value: Page) => {
  page.value = value;
};

provide(SitecoreProviderKey, {
  page,
  setPage,
  api: props.api,
  componentMap: props.componentMap,
  loadImportMap: props.loadImportMap,
});
</script>

<template>
  <slot />
</template>
