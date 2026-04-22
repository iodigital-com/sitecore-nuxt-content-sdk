<script setup lang="ts">
import { ref, computed, onErrorCaptured } from 'vue';
import { useSitecoreContext } from '../composables/useSitecoreContext';
import ErrorComponent from './ErrorComponent.vue';
import type { ErrorBoundaryProps } from './ErrorBoundary';

/**
 * Catches errors thrown in child component render functions and lifecycle hooks,
 * and renders a fallback UI. Optionally wraps children in a Suspense boundary.
 *
 * Note: onErrorCaptured does not catch errors thrown in setup(). Errors in setup()
 * propagate to the parent and are not handled by this boundary.
 * @public
 * @example
 * ```vue
 * <ErrorBoundary :rendering="rendering">
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
defineOptions({ name: 'ErrorBoundary' });

const props = withDefaults(defineProps<ErrorBoundaryProps>(), {
  disableSuspense: true,
});

const error = ref<Error | null>(null);
const context = useSitecoreContext();

const showErrorDetails = computed(
  () =>
    process.env.NODE_ENV === 'development' ||
    context.page.value.mode.isEditing ||
    context.page.value.mode.isPreview
);

onErrorCaptured((err: Error) => {
  if (showErrorDetails.value) {
    console.error(
      `An error occurred in component ${props.rendering?.componentName} (${props.rendering?.uid}): `
    );
  }
  console.error(err);
  error.value = err;
  return false;
});
</script>

<template>
  <template v-if="error">
    <component v-if="errorComponent" :is="errorComponent" :error="error" />
    <div v-else-if="showErrorDetails">
      <ErrorComponent>
        A rendering error occurred in component <em>{{ rendering?.componentName }}</em
        ><br />
        Error: <em>{{ error.message || JSON.stringify(error) }}</em>
      </ErrorComponent>
    </div>
    <div v-else>
      <ErrorComponent message="There was a problem loading this section." />
    </div>
  </template>
  <Suspense v-else-if="!disableSuspense && !isDynamic">
    <template #default>
      <slot />
    </template>
    <template #fallback>
      <h4>{{ componentLoadingMessage || 'Loading component...' }}</h4>
    </template>
  </Suspense>
  <slot v-else />
</template>
