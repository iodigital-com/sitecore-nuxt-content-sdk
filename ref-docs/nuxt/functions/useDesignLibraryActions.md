[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / useDesignLibraryActions

# Function: useDesignLibraryActions()

> **useDesignLibraryActions**(): `object`

Defined in: nuxt/src/composables/useDesignLibraryActions.ts:71

Composable that provides server-side component cache update functions for use with
Sitecore Design Library.

Replaces Next.js server actions with Nuxt-compatible equivalents.
Uses `refreshNuxtData` to invalidate the page cache after updating component data,
triggering a server-side re-render of the affected components.

## Returns

### previewComponent()

> **previewComponent**: (`previewEvent`, `rendering`, `edgeUrl?`) => `Promise`\<`void`\>

Updates the global cache with the generated component data in variant generation mode.
Fetches the generated component data from a secured cache endpoint via the provided
event arguments, then invalidates the page cache via `refreshNuxtData`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `previewEvent` | [`PreviewEventModel`](../type-aliases/PreviewEventModel.md) | The preview event model |
| `rendering` | `ComponentRendering`\<`ComponentFields`\> \| `null` | The component rendering data |
| `edgeUrl?` | `string` | Optional Edge URL to fetch the generated component data |

#### Returns

`Promise`\<`void`\>

### updateComponent()

> **updateComponent**: (`updatedComponent`) => `Promise`\<`void`\>

Updates the global cache with the provided component data received from Design Library.
Stores the given [ComponentUpdateModel](../type-aliases/ComponentUpdateModel.md) in the cache using a key based on the component UID.
Invalidates the page cache via `refreshNuxtData` to trigger a re-render.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `updatedComponent` | [`ComponentUpdateModel`](../type-aliases/ComponentUpdateModel.md) | The component update model |

#### Returns

`Promise`\<`void`\>

## Example

```ts
const { updateComponent, previewComponent } = useDesignLibraryActions();

// Update a component from a Design Library event
await updateComponent({ uid: 'component-uid', rendering: updatedRendering });
```
