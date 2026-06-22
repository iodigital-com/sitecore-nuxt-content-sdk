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
  <div :class="['row-splitter', params?.styles]" style="display: flex; flex-direction: column">
    <div :class="params?.RowHeight1">
      <Placeholder :name="`row-1-${params?.DynamicPlaceholderId}`" :rendering="rendering" />
    </div>
    <div :class="params?.RowHeight2">
      <Placeholder :name="`row-2-${params?.DynamicPlaceholderId}`" :rendering="rendering" />
    </div>
  </div>
</template>
