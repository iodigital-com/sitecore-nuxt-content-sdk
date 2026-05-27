<script setup lang="ts">
import { Link as SitecoreLink } from '@sitecore-content-sdk/nuxt';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  fields?: Record<string, any>;
  params?: Record<string, any>;
  rendering?: any;
}>();
</script>

<template>
  <SitecoreLink :field="props.fields?.URL" v-bind="$attrs" />
</template>
