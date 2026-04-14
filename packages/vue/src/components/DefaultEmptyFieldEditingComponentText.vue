<script setup lang="ts">
defineOptions({ name: 'DefaultEmptyFieldEditingComponentText' });

const props = defineProps<{
  tag?: string;
}>();
</script>

<template>
  <component :is="props.tag || 'span'" v-bind="$attrs">[No text in field]</component>
</template>
