<script setup lang="ts">
import type { ErrorComponentProps } from './ErrorBoundary';

/**
 * Simple error component applying basic error styling.
 * Pass either a `message` prop or use the default slot, not both.
 * @internal
 * @example
 * ```vue
 * <ErrorComponent message="Something went wrong" />
 * <ErrorComponent>Something went <em>wrong</em></ErrorComponent>
 * ```
 */
defineOptions({ name: 'ErrorComponent' });

defineProps<ErrorComponentProps>();
</script>

<template>
  <div class="sc-content-sdk-placeholder-error">
    <template v-if="message">{{ message }}</template>
    <slot v-else />
  </div>
</template>
