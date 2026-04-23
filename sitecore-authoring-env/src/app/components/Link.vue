<script setup lang="ts">
import { Link as SitecoreLink } from '@sitecore-content-sdk/nuxt';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  field?: Record<string, any>;
  params?: Record<string, any>;
  rendering?: any;
}>();
</script>

<template>
  <SitecoreLink :field="props.field" v-bind="$attrs">
    <slot />
  </SitecoreLink>
</template>
