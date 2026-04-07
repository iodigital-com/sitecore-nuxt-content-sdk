[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / ComponentPreviewModel

# Type Alias: ComponentPreviewModel

> **ComponentPreviewModel** = `object`

Defined in: nuxt/src/composables/useDesignLibraryActions.ts:35

Model containing the result of a component preview cache update.

## Properties

### error?

> `optional` **error**: `string`

Defined in: nuxt/src/composables/useDesignLibraryActions.ts:43

Error message in case fetching generated component data from secured cache endpoint fails.

***

### generatedComponentData?

> `optional` **generatedComponentData**: `GeneratedComponentData`

Defined in: nuxt/src/composables/useDesignLibraryActions.ts:39

The data needed for generated component to be rendered on the server.

***

### rendering?

> `optional` **rendering**: `ComponentRendering` \| `null`

Defined in: nuxt/src/composables/useDesignLibraryActions.ts:41

The updated component rendering data.

***

### uid

> **uid**: `string`

Defined in: nuxt/src/composables/useDesignLibraryActions.ts:37

Unique identifier of the component being updated.
