[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / ComponentPropsFetchFunction

# Type Alias: ComponentPropsFetchFunction()\<FetchedProps\>

> **ComponentPropsFetchFunction**\<`FetchedProps`\> = (`rendering`, `layoutData`) => `Promise`\<`FetchedProps`\>

Defined in: [nuxt/src/sharedTypes/component-props.ts:23](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/41d0c7cf29778b0f6307913d365064cd5f8d528a/packages/nuxt/src/sharedTypes/component-props.ts#L23)

Type of side effect function which could be invoked on component level via useComponentServerProps composable.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `FetchedProps` | `unknown` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `rendering` | `ComponentRendering` |
| `layoutData` | `LayoutServiceData` |

## Returns

`Promise`\<`FetchedProps`\>
