[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / useDatasourceCheck

# Function: useDatasourceCheck()

> **useDatasourceCheck**(`rendering`, `options?`): `object`

Defined in: packages/vue/types/composables/useDatasourceCheck.d.ts:51

Composable that checks whether a Sitecore datasource is present and determines
what to render depending on page mode.

Returns:
- `'component'` when the datasource is present or page is in Design Library mode
- `'error'` when the datasource is missing in editing mode
- `'null'` when the datasource is missing in normal mode

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `rendering` | `Ref`\<[`ComponentRendering`](../interfaces/ComponentRendering.md)\<[`ComponentFields`](../interfaces/ComponentFields.md)\>\> | The component rendering ref |
| `options?` | [`UseDatasourceCheckOptions`](../interfaces/UseDatasourceCheckOptions.md) | Optional composable options |

## Returns

`object`

render state and error component to use

### errorComponent

> **errorComponent**: `ComputedRef`\<`Component`\>

### renderState

> **renderState**: `ComputedRef`\<`"null"` \| `"error"` \| `"component"`\>

## Example

```vue
<script setup lang="ts">
import { toRef } from 'vue';
import { useDatasourceCheck } from '../enhancers/useDatasourceCheck';

const props = defineProps<{ rendering: ComponentRendering }>();
const { renderState, errorComponent } = useDatasourceCheck(toRef(props, 'rendering'));
</script>

<template>
  <component :is="errorComponent" v-if="renderState === 'error'" />
  <template v-else-if="renderState === 'component'">
    <!-- component content -->
  </template>
</template>
```
