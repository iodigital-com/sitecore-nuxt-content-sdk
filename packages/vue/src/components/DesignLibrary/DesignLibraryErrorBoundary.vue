<script setup lang="ts">
import { ref, watch, onErrorCaptured } from 'vue';
import { DesignLibraryPreviewError, sendErrorEvent } from '@sitecore-content-sdk/content/codegen';

/**
 * Error boundary for the Design Library component.
 * Catches errors during rendering and sends them to the Design Library.
 * @internal
 */
defineOptions({ name: 'DesignLibraryErrorBoundary' });

const props = defineProps<{
  uid: string;
  renderKey?: number;
}>();

const hasError = ref(false);

watch(
  () => props.renderKey,
  () => {
    hasError.value = false;
  }
);

onErrorCaptured((error: Error) => {
  hasError.value = true;
  sendErrorEvent(props.uid, error, DesignLibraryPreviewError.Render);
  return false;
});
</script>

<template>
  <div v-if="hasError">Error during component rendering</div>
  <slot v-else />
</template>
