<script setup lang="ts">
import { FEaaSWrapper as SitecoreFEaaSWrapper } from '@sitecore-content-sdk/nuxt';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  params?: Record<string, any>;
  rendering?: any;
}>();
</script>

<template>
  <SitecoreFEaaSWrapper :params="props.params" :rendering="props.rendering" />
</template>
