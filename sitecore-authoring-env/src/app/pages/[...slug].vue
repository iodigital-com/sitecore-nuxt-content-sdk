<script setup lang="ts">
import { computed } from 'vue';
import { createError } from 'nuxt/app';
import { SitecoreProvider, Placeholder } from '@sitecore-content-sdk/nuxt';
import { useSitecorePage } from '@sitecore-content-sdk/nuxt/composables';
import componentMap from '../components/componentMap';

const { page, error } = await useSitecorePage();

if (error.value) {
  throw createError({ statusCode: 500, message: error.value.message });
}

if (!page.value) {
  throw createError({ statusCode: 404, message: 'Page not found: was checked by slug though!' });
}

const route = computed(() => page.value?.layout?.sitecore?.route);
console.log('Page data:', page.value);
</script>

<template>
  <SitecoreProvider :page="page" :componentMap="componentMap">
    <Placeholder name="headless-header" :rendering="route" />
    <Placeholder name="headless-main" :rendering="route" />
    <Placeholder name="headless-footer" :rendering="route" />
  </SitecoreProvider>
</template>
