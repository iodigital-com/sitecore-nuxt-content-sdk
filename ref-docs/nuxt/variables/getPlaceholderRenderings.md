[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / getPlaceholderRenderings

# Variable: getPlaceholderRenderings()

> `const` **getPlaceholderRenderings**: (`rendering`, `name`, `isEditing`) => [`ComponentRendering`](../interfaces/ComponentRendering.md)\<[`ComponentFields`](../interfaces/ComponentFields.md)\>[]

Defined in: packages/vue/types/components/Placeholder/placeholder-utils.d.ts:12

Get the renderings for the specified placeholder from the rendering layout data.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `rendering` | [`ComponentRendering`](../interfaces/ComponentRendering.md) \| [`RouteData`](../interfaces/RouteData.md) | rendering data |
| `name` | `string` | placeholder name |
| `isEditing` | `boolean` | whether components should be rendered in editing mode |

## Returns

[`ComponentRendering`](../interfaces/ComponentRendering.md)\<[`ComponentFields`](../interfaces/ComponentFields.md)\>[]

array of component renderings
