<script setup lang="ts">
import { computed } from 'vue';
import { createError } from 'nuxt/app';
import { SitecoreProvider, Placeholder } from '@sitecore-content-sdk/nuxt';
import { DesignLibraryNuxt } from '@sitecore-content-sdk/nuxt/components';
import { useSitecorePage } from '@sitecore-content-sdk/nuxt/composables';
import componentMap from '../components/componentMap';
const { page, error } = await useSitecorePage();

if (error.value) {
  throw createError({ statusCode: 500, message: error.value.message });
}

if (!page.value) {
  throw createError({ statusCode: 404, message: 'Page not found' });
}

const route = computed(() => page.value?.layout?.sitecore?.route);
const isDesignLibrary = computed(() => page.value?.mode?.isDesignLibrary);
</script>

<template>
  <SitecoreProvider :page="page" :api="($sitecoreConfig as any).api" :componentMap="componentMap">
    <template v-if="isDesignLibrary">
      <DesignLibraryNuxt />
    </template>
    <template v-else>
      <Placeholder name="headless-header" :rendering="route" />
      <Placeholder name="headless-main" :rendering="route" />
      <Placeholder name="headless-footer" :rendering="route" />
    </template>
  </SitecoreProvider>
</template>
