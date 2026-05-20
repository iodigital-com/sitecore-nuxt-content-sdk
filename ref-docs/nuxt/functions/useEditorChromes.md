[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / useEditorChromes

# Function: useEditorChromes()

> **useEditorChromes**(): `void`

Defined in: packages/vue/types/composables/useEditorChromes.d.ts:18

Composable that resets Sitecore editor chromes on subsequent component updates.
Call this in the setup of any component that needs to notify the Page Builder
of DOM changes after the initial render.

Skips the first render — only fires on re-renders, consistent with the
Next.js `withEditorChromes` HOC behaviour.

## Returns

`void`

## Example

```vue
<script setup lang="ts">
import { useEditorChromes } from '@sitecore-content-sdk/vue';

useEditorChromes();
</script>
```
