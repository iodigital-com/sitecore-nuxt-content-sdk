[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / useSitecoreContext

# Type Alias: useSitecoreContext()

> **useSitecoreContext** = (`options?`) => [`SitecoreProviderState`](../interfaces/SitecoreProviderState.md)

Defined in: packages/vue/types/composables/useSitecoreContext.d.ts:51

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
