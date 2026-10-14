[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / getComponentForRendering

# Variable: getComponentForRendering()

> `const` **getComponentForRendering**: (`renderingDefinition`, `placeholderName`, `componentMap?`, `hiddenRenderingComponent?`, `missingComponentComponent?`) => `ComponentForRendering`

Defined in: @sitecore-content-sdk/vue/types/components/Placeholder/placeholder-utils.d.ts:44

Get component implementation from the component map based on the rendering definition.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `renderingDefinition` | [`ComponentRendering`](../interfaces/ComponentRendering.md) | rendering data |
| `placeholderName` | `string` | name of current placeholder |
| `componentMap?` | [`ComponentMap`](../type-aliases/ComponentMap.md) | component map for the current app |
| `hiddenRenderingComponent?` | [`VueContentSdkComponent`](../type-aliases/VueContentSdkComponent.md) | fallback component when the rendering is hidden |
| `missingComponentComponent?` | [`VueContentSdkComponent`](../type-aliases/VueContentSdkComponent.md) | fallback component when no component is found in the component map |

## Returns

`ComponentForRendering`

component implementation
