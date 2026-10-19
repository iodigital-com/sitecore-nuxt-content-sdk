[**@iodigital-com/sitecore-content-sdk-nuxt**](../README.md)

***

[@iodigital-com/sitecore-content-sdk-nuxt](../README.md) / defineSitecoreComponent

# Function: defineSitecoreComponent()

> **defineSitecoreComponent**(`loader`, `componentType?`): [`VueContentSdkComponent`](../type-aliases/VueContentSdkComponent.md)

Defined in: @iodigital-com/sitecore-content-sdk-vue/types/sharedTypes/components.d.ts:39

Define an async Vue component for use in the Sitecore component map. Enables Vue's async component loading and allows for more optimized builds by supporting tree-shaking of components that are not used on the server or client.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `loader` | () => `Promise`\<\{ `default`: `Component`; \}\> | Async loader that resolves to a module with a default component. |
| `componentType?` | `"client"` \| `"server"` \| `"universal"` | Optional component type annotation. |

## Returns

[`VueContentSdkComponent`](../type-aliases/VueContentSdkComponent.md)

A VueContentSdkComponent ready for use in the component map.

## Example

```ts
// app/components/componentMap.ts
const componentMap: ComponentMap = new Map([
 ['MyComponent', defineSitecoreComponent(() => import('./MyComponent.vue'), 'client')],
]);
```
