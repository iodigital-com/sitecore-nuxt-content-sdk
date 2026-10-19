[**@iodigital-com/sitecore-content-sdk-vue**](../README.md)

***

[@iodigital-com/sitecore-content-sdk-vue](../README.md) / SitecoreProviderState

# Interface: SitecoreProviderState

Defined in: [src/composables/useSitecoreContext.ts:12](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/4e1825ea844316bc3551dd4ba9c4c01dbd454c12/packages/vue/src/composables/useSitecoreContext.ts#L12)

The state provided by SitecoreProvider.

## Properties

### api?

> `optional` **api**: `Required`\<\{ `edge?`: `Required`\<\{ `clientContextId?`: `string`; `contextId`: `string`; `edgeUrl?`: `string`; \} \| `undefined`\>; `local?`: `Required`\<\{ `apiHost`: `string`; `apiKey`: `string`; `path?`: `string`; \} \| `undefined`\>; \}\>

Defined in: [src/composables/useSitecoreContext.ts:21](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/4e1825ea844316bc3551dd4ba9c4c01dbd454c12/packages/vue/src/composables/useSitecoreContext.ts#L21)

The API configuration defined in the `SitecoreConfig`.

***

### componentMap

> **componentMap**: [`ComponentMap`](../type-aliases/ComponentMap.md)

Defined in: [src/composables/useSitecoreContext.ts:23](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/4e1825ea844316bc3551dd4ba9c4c01dbd454c12/packages/vue/src/composables/useSitecoreContext.ts#L23)

The component map to use for rendering components.

***

### loadImportMap()

> **loadImportMap**: () => `Promise`\<`ImportMapImport`\>

Defined in: [src/composables/useSitecoreContext.ts:25](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/4e1825ea844316bc3551dd4ba9c4c01dbd454c12/packages/vue/src/composables/useSitecoreContext.ts#L25)

The dynamic import for import map to be used in variant generation mode.

#### Returns

`Promise`\<`ImportMapImport`\>

***

### page

> **page**: `Ref`\<`Page`\>

Defined in: [src/composables/useSitecoreContext.ts:14](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/4e1825ea844316bc3551dd4ba9c4c01dbd454c12/packages/vue/src/composables/useSitecoreContext.ts#L14)

The current page data as a reactive ref.

***

### setPage()?

> `optional` **setPage**: (`value`) => `void`

Defined in: [src/composables/useSitecoreContext.ts:19](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/4e1825ea844316bc3551dd4ba9c4c01dbd454c12/packages/vue/src/composables/useSitecoreContext.ts#L19)

Method to update the page. Only exposed when `updatable: true` is passed to `useSitecore`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | `Page` | The new page value. |

#### Returns

`void`
