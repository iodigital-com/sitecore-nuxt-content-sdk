[**@sitecore-content-sdk/vue**](../README.md)

***

[@sitecore-content-sdk/vue](../README.md) / defineSitecoreComponent

# Function: defineSitecoreComponent()

> **defineSitecoreComponent**(`loader`, `componentType?`): [`VueContentSdkComponent`](../type-aliases/VueContentSdkComponent.md)

Defined in: [src/sharedTypes/components.ts:48](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/506c0785c8d8cee7fc34f92cd6f25e430868b713/packages/vue/src/sharedTypes/components.ts#L48)

Define an async Vue component for use in the Sitecore component map. Enables Vue's async component loading and allows for more optimized builds by supporting tree-shaking of components that are not used on the server or client.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `loader` | () => `Promise`\<\{ `default`: `Component`; \}\> | Async loader that resolves to a module with a default component. |
| `componentType?` | `"server"` \| `"client"` \| `"universal"` | Optional component type annotation. |

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
