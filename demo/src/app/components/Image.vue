<script setup lang="ts">
import { Image as SitecoreImage } from '@sitecore-content-sdk/nuxt';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  fields?: Record<string, any>;
  params?: Record<string, any>;
  rendering?: any;
}>();
</script>

<template>
  <figure class="content-image">
    <SitecoreImage :field="props.fields?.Image" />
  </figure>
</template>
