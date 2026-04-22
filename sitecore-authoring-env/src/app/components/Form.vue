<script setup lang="ts">
import { Form as SitecoreForm } from '@sitecore-content-sdk/nuxt';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  params?: Record<string, any>;
  rendering?: any;
}>();
</script>

<template>
  <SitecoreForm :params="props.params" :rendering="props.rendering" />
</template>
