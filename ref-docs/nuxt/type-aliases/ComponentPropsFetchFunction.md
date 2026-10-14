[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / ComponentPropsFetchFunction

# Type Alias: ComponentPropsFetchFunction()\<FetchedProps\>

> **ComponentPropsFetchFunction**\<`FetchedProps`\> = (`rendering`, `layoutData`) => `Promise`\<`FetchedProps`\>

Defined in: [packages/nuxt/src/sharedTypes/component-props.ts:23](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/4e1825ea844316bc3551dd4ba9c4c01dbd454c12/packages/nuxt/src/sharedTypes/component-props.ts#L23)

Type of side effect function which could be invoked on component level via useComponentServerProps composable.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `FetchedProps` | `unknown` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `rendering` | [`ComponentRendering`](../interfaces/ComponentRendering.md) |
| `layoutData` | [`LayoutServiceData`](../interfaces/LayoutServiceData.md) |

## Returns

`Promise`\<`FetchedProps`\>
