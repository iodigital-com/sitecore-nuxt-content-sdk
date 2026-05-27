[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / ComponentPropsFetchFunction

# Type Alias: ComponentPropsFetchFunction()\<FetchedProps\>

> **ComponentPropsFetchFunction**\<`FetchedProps`\> = (`rendering`, `layoutData`) => `Promise`\<`FetchedProps`\>

Defined in: [packages/nuxt/src/sharedTypes/component-props.ts:23](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/e1d697260f8666d7ac77ee73644c4bf6a6972edd/packages/nuxt/src/sharedTypes/component-props.ts#L23)

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
