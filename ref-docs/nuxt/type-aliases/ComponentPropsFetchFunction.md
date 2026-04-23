[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / ComponentPropsFetchFunction

# Type Alias: ComponentPropsFetchFunction()\<FetchedProps\>

> **ComponentPropsFetchFunction**\<`FetchedProps`\> = (`rendering`, `layoutData`) => `Promise`\<`FetchedProps`\>

Defined in: [packages/nuxt/src/sharedTypes/component-props.ts:23](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/f9df27f3b8d16cd24df156046de00eadab843a8d/packages/nuxt/src/sharedTypes/component-props.ts#L23)

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
