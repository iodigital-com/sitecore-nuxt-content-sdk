<script setup lang="ts">
import { Placeholder } from '@sitecore-content-sdk/nuxt';
import type { ComponentRendering } from '@sitecore-content-sdk/core/layout';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  rendering: ComponentRendering;
  params?: Record<string, string>;
}>();
</script>

<template>
  <div :class="['container-default', params?.styles]">
    <Placeholder :name="`container-${params?.DynamicPlaceholderId}`" :rendering="rendering" />
  </div>
</template>
