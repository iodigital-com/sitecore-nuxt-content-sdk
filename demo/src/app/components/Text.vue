<script setup lang="ts">
import { toRef } from 'vue';
import { Text as SitecoreText } from '@sitecore-content-sdk/nuxt';
import { useDatasourceCheck } from '@sitecore-content-sdk/nuxt';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  fields?: Record<string, any>;
  params?: Record<string, any>;
  rendering?: any;
}>();

const { renderState, errorComponent } = useDatasourceCheck(toRef(props, 'rendering'));
</script>

<template>
  <component :is="errorComponent" v-if="renderState === 'error'" />
  <SitecoreText v-else-if="renderState === 'component'" :field="props.fields?.Text" />
</template>
