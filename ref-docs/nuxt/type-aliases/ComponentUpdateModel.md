[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / ComponentUpdateModel

# Type Alias: ComponentUpdateModel

> **ComponentUpdateModel** = `object`

Defined in: nuxt/src/composables/useDesignLibraryActions.ts:19

Model containing the data for a component update received from Design Library.

## Properties

### generatedComponentData?

> `optional` **generatedComponentData**: `GeneratedComponentData`

Defined in: nuxt/src/composables/useDesignLibraryActions.ts:28

The data needed for generated component to be rendered on the server.
Required if update event is coming for a generated component in variant generation mode.

***

### rendering?

> `optional` **rendering**: `ComponentRendering`

Defined in: nuxt/src/composables/useDesignLibraryActions.ts:23

The updated component rendering data.

***

### uid

> **uid**: `string`

Defined in: nuxt/src/composables/useDesignLibraryActions.ts:21

Unique identifier of the component being updated.
