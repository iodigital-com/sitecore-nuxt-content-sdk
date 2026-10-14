[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / NuxtContentSdkComponent

# Type Alias: NuxtContentSdkComponent

> **NuxtContentSdkComponent** = [`VueContentSdkComponent`](VueContentSdkComponent.md) & `object`

Defined in: [packages/nuxt/src/sharedTypes/component-props.ts:31](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/506c0785c8d8cee7fc34f92cd6f25e430868b713/packages/nuxt/src/sharedTypes/component-props.ts#L31)

Represents a Nuxt component import for use in the Sitecore component map.

## Type Declaration

### componentType?

> `optional` **componentType**: `"client"` \| `"server"` \| `"universal"`

Indicates the type of the component in a Nuxt context.
- 'client': The component contains client only api's and will be rendered on the client side.
- 'server': The component contains server only api's and will be rendered on the server side.
- 'universal': The component is isomorphic and can be rendered on both server and client.

### dynamicModule()?

> `optional` **dynamicModule**: () => `Promise`\<[`VueContentSdkComponent`](VueContentSdkComponent.md)\>

Optional dynamic import for lazy components.

#### Returns

`Promise`\<[`VueContentSdkComponent`](VueContentSdkComponent.md)\>

#### Example

```ts
dynamicModule: () => import('./MyComponent.vue')
```
