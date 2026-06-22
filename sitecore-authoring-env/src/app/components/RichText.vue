<script setup lang="ts">
import { RichText as SitecoreRichText } from '@sitecore-content-sdk/nuxt';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  fields?: Record<string, any>;
  params?: Record<string, any>;
  rendering?: any;
}>();
</script>

<template>
  <SitecoreRichText :field="props.fields?.Text" />
</template>
