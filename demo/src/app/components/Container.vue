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
  <div :class="['container-default', params?.styles]">
    <Placeholder :name="`container-${params?.DynamicPlaceholderId}`" :rendering="rendering" />
  </div>
</template>
