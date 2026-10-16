<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useEditorChromes } from '@sitecore-content-sdk/nuxt';

const props = defineProps<{
  fields?: Record<string, any>;
  params?: Record<string, any>;
  rendering?: any;
}>();

const isLarge = ref(true);
let intervalId: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  intervalId = setInterval(() => {
    isLarge.value = !isLarge.value;
  }, 5000);
});

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});

useEditorChromes();
</script>

<template>
  <div :class="['async-component', isLarge ? 'is-large' : 'is-small']">
    <span>I toggle from big to small</span>
  </div>
</template>

<style scoped>
.async-component {
  transition: all 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin: 20px;
}

.is-large {
  width: 200px;
  height: 200px;
  background-color: #f0f0f0;
  border: 2px solid #ccc;
  font-size: 18px;
}

.is-small {
  width: 50px;
  height: 50px;
  background-color: #f4f4f4;
  border: 2px solid #ccc;
  font-size: 10px;
}
</style>
