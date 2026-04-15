[**@sitecore-content-sdk/vue**](../README.md)

***

[@sitecore-content-sdk/vue](../README.md) / SitecoreProvider

# Variable: SitecoreProvider

> `const` **SitecoreProvider**: `DefineComponent`\<[`SitecoreProviderProps`](../interfaces/SitecoreProviderProps.md)\>

Defined in: [vue/src/components/SitecoreProvider.d.ts:28](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/0eb4be91f4260a1106102aacfc2513e02bf1778f/packages/vue/src/components/SitecoreProvider.d.ts#L28)

Provides the Sitecore page context to all child components via Vue's provide/inject mechanism.
Wrap your application or page with this component to make `useSitecoreContext` available
throughout the component tree.

## Example

```vue
<template>
  <SitecoreProvider :api="api" :page="page" :componentMap="componentMap" :loadImportMap="loadImportMap">
    <NuxtPage />
  </SitecoreProvider>
</template>
```
