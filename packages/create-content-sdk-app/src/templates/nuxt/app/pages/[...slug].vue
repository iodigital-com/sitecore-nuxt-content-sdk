<!-- app/pages/[...slug].vue -->
<script setup lang="ts">
import { createError } from 'nuxt/app';
import { useSitecorePage, SitecoreProvider, Placeholder } from '@sitecore-content-sdk/nuxt';
import componentMap from '../components/componentMap';

const { page, error } = await useSitecorePage();

if (error.value) {
  throw createError({ statusCode: 500, message: error.value.message });
}

if (!page.value) {
  throw createError({ statusCode: 404, message: 'Page not found' });
}
</script>

<template>
  <SitecoreProvider :page="page" :componentMap="componentMap">
    <Placeholder name="jss-main" :rendering="page.layout.sitecore.route" />
  </SitecoreProvider>
</template>
