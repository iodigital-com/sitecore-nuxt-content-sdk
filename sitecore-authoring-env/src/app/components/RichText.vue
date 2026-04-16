<script setup lang="ts">
// Default import van de SDK, niet van zichzelf
import { RichText as SitecoreRichText } from '@sitecore-content-sdk/nuxt';

defineProps<{
  fields?: Record<string, any>;
  params?: Record<string, any>;
  rendering?: any;
}>();

console.log('RichText props:', JSON.stringify(props, null, 2));
</script>

<template>
  <SitecoreRichText :field="fields?.Content" />
</template>
