[**@sitecore-content-sdk/vue**](../README.md)

***

[@sitecore-content-sdk/vue](../README.md) / useSitecoreContext

# Function: useSitecoreContext()

> **useSitecoreContext**(`options?`): [`SitecoreProviderState`](../interfaces/SitecoreProviderState.md)

Defined in: [src/composables/useSitecoreContext.ts:56](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/7a1e7de41f189807cf81c37cfd6c2421fef22a67/packages/vue/src/composables/useSitecoreContext.ts#L56)

Composable that provides access to the current Sitecore page and API configuration.
Must be used within a component tree wrapped by `SitecoreProvider`.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | [`UseSitecoreContextOptions`](../interfaces/UseSitecoreContextOptions.md) | Composable options |

## Returns

[`SitecoreProviderState`](../interfaces/SitecoreProviderState.md)

The current Sitecore context

## Throws

When used outside of a SitecoreProvider

## Examples

```ts
const { page } = useSitecoreContext();
console.log(page.value.mode.isEditing);
```

```ts
// With updatable option to expose setPage
const { page, setPage } = useSitecoreContext({ updatable: true });
setPage(newPage);
@public
```
