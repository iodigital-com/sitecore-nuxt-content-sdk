<script setup lang="ts">
import { toRef } from 'vue';
import { Text as SitecoreText } from '@iodigital-com/sitecore-content-sdk-nuxt';
import { useDatasourceCheck } from '@iodigital-com/sitecore-content-sdk-nuxt';

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
  <div v-else-if="renderState === 'component'" class="content-text">
    <SitecoreText :field="props.fields?.Text" />
  </div>
</template>
