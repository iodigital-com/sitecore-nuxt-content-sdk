[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / ComponentPropsFetchFunction

# Type Alias: ComponentPropsFetchFunction()\<FetchedProps\>

> **ComponentPropsFetchFunction**\<`FetchedProps`\> = (`rendering`, `layoutData`) => `Promise`\<`FetchedProps`\>

Defined in: [packages/nuxt/src/sharedTypes/component-props.ts:23](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/506c0785c8d8cee7fc34f92cd6f25e430868b713/packages/nuxt/src/sharedTypes/component-props.ts#L23)

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
