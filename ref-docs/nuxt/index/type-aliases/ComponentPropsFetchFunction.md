[**@sitecore-content-sdk/nuxt**](../../README.md)

***

[@sitecore-content-sdk/nuxt](../../README.md) / [index](../README.md) / ComponentPropsFetchFunction

# Type Alias: ComponentPropsFetchFunction()\<FetchedProps\>

> **ComponentPropsFetchFunction**\<`FetchedProps`\> = (`rendering`, `layoutData`) => `Promise`\<`FetchedProps`\>

Defined in: [sharedTypes/component-props.ts:23](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/9f27831d38ed4ea4c87bdfb6922610bef950bdc1/packages/nuxt/src/sharedTypes/component-props.ts#L23)

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
