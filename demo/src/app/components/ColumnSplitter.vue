<script setup lang="ts">
import { Placeholder } from '@iodigital-com/sitecore-content-sdk-nuxt';
import type { ComponentRendering } from '@iodigital-com/sitecore-content-sdk-nuxt';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  rendering: ComponentRendering;
  params?: Record<string, string>;
}>();
</script>

<template>
  <div :class="['column-splitter', params?.styles]">
    <div :class="params?.ColumnWidth1" style="flex: 1">
      <Placeholder :name="`column-1-${params?.DynamicPlaceholderId}`" :rendering="rendering" />
    </div>
    <div :class="params?.ColumnWidth2" style="flex: 1">
      <Placeholder :name="`column-2-${params?.DynamicPlaceholderId}`" :rendering="rendering" />
    </div>
  </div>
</template>
