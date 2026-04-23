<script setup lang="ts">
import { Placeholder } from '@sitecore-content-sdk/nuxt';
import type { ComponentRendering } from '@sitecore-content-sdk/nuxt';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  rendering: ComponentRendering;
  params?: Record<string, string>;
}>();
</script>

<template>
  <Placeholder v-if="params?.sig" :name="params.sig" :rendering="rendering" />
</template>
