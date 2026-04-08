<script setup lang="ts">
import { MissingComponentProps } from './MissingComponent';

/**
 * Renders a fallback component when a Sitecore component has no Vue implementation.
 * Logs the component props to the console for debugging unless an error override is provided.
 * @public
 */
defineOptions({
  name: 'MissingComponent',
});

const props = defineProps<MissingComponentProps>();

const componentName = props.rendering?.componentName ?? 'Unnamed Component';

if (!props.errorOverride) {
  console.log(`Component props for unimplemented '${componentName}' component`, props);
}

const errorMessage =
  props.errorOverride ||
  'Content SDK component is missing Vue implementation. See the developer console for more information.';
</script>

<template>
  <div
    style="
      background: darkorange;
      outline: 5px solid orange;
      padding: 10px;
      color: white;
      max-width: 500px;
    "
  >
    <h2>{{ componentName }}</h2>
    <p>{{ errorMessage }}</p>
  </div>
</template>
