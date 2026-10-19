<script setup lang="ts">
import { toRef } from 'vue';
import { Text as SitecoreText } from '@iodigital-com/sitecore-content-sdk-nuxt';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  fields?: Record<string, any>;
  params?: Record<string, any>;
  rendering?: any;
}>();
</script>

<template>
  <SitecoreText :field="props.fields?.Text" />
</template>
