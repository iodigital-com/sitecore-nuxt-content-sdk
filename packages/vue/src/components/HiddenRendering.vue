<script setup lang="ts">
defineOptions({ name: 'HiddenRendering' });

const isTest = process.env.NODE_ENV === 'test';

const styles: Record<string, string> = {
  'background-size': '3px 3px',
  display: 'flex',
  'justify-content': 'center',
  'align-items': 'center',
  padding: '30px',
  color: 'rgb(170, 170, 170)',
  ...(isTest
    ? {}
    : {
        'background-image':
          'linear-gradient(45deg, #ffffff 25%, #dcdcdc 25%, #dcdcdc 50%, #ffffff 50%, #ffffff 75%, #dcdcdc 75%, #dcdcdc 100%)',
      }),
};
</script>

<template>
  <div :style="styles">The component is hidden</div>
</template>
