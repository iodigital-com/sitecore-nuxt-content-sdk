[**@iodigital-com/sitecore-content-sdk-nuxt**](../README.md)

***

[@iodigital-com/sitecore-content-sdk-nuxt](../README.md) / SitecoreProviderState

# Interface: SitecoreProviderState

Defined in: @iodigital-com/sitecore-content-sdk-vue/types/composables/useSitecoreContext.d.ts:10

The state provided by SitecoreProvider.

## Properties

### api?

> `optional` **api**: `Required`\<\{ `edge?`: `Required`\<\{ `clientContextId?`: `string`; `contextId`: `string`; `edgeUrl?`: `string`; \} \| `undefined`\>; `local?`: `Required`\<\{ `apiHost`: `string`; `apiKey`: `string`; `path?`: `string`; \} \| `undefined`\>; \}\>

Defined in: @iodigital-com/sitecore-content-sdk-vue/types/composables/useSitecoreContext.d.ts:19

The API configuration defined in the `SitecoreConfig`.

***

### componentMap

> **componentMap**: [`ComponentMap`](../type-aliases/ComponentMap.md)

Defined in: @iodigital-com/sitecore-content-sdk-vue/types/composables/useSitecoreContext.d.ts:21

The component map to use for rendering components.

***

### loadImportMap()

> **loadImportMap**: () => `Promise`\<`ImportMapImport`\>

Defined in: @iodigital-com/sitecore-content-sdk-vue/types/composables/useSitecoreContext.d.ts:23

The dynamic import for import map to be used in variant generation mode.

#### Returns

`Promise`\<`ImportMapImport`\>

***

### page

> **page**: `Ref`\<[`Page`](../type-aliases/Page.md)\>

Defined in: @iodigital-com/sitecore-content-sdk-vue/types/composables/useSitecoreContext.d.ts:12

The current page data as a reactive ref.

***

### setPage()?

> `optional` **setPage**: (`value`) => `void`

Defined in: @iodigital-com/sitecore-content-sdk-vue/types/composables/useSitecoreContext.d.ts:17

Method to update the page. Only exposed when `updatable: true` is passed to `useSitecore`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | [`Page`](../type-aliases/Page.md) | The new page value. |

#### Returns

`void`
