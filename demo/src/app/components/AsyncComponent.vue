<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useEditorChromes } from '@iodigital-com/sitecore-content-sdk-nuxt';

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
  <div class="async-component">
    <p class="async-label">Timed update</p>
    <p class="async-copy">This block changes size every five seconds.</p>
    <div :class="['async-stage', isLarge ? 'is-large' : 'is-small']">
      <span>{{ isLarge ? 'Expanded' : 'Compact' }}</span>
    </div>
  </div>
</template>

<style scoped>
.async-label {
  margin: 0;
  color: #0000d2;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.async-copy {
  margin: 8px 0 20px;
  color: #232323;
}

.async-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: #1c2618;
  color: #f4f1ea;
  font-weight: 600;
  transition:
    width 0.5s ease,
    height 0.5s ease,
    font-size 0.5s ease;
}

.is-large {
  width: min(100%, 280px);
  height: 160px;
  font-size: 1.25rem;
}

.is-small {
  width: 96px;
  height: 56px;
  font-size: 0.8rem;
}
</style>
