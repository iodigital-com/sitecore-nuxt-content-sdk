[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / EditingConfigRouteConfig

# Type Alias: EditingConfigRouteConfig

> **EditingConfigRouteConfig** = `object`

Defined in: [route-handlers/editing-config-route.ts:18](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/f585b36b7f1297cd5452a1dd44d8c7ad219f27dc/packages/nuxt/src/route-handlers/editing-config-route.ts#L18)

Configuration for the createEditingConfigRoute factory function.

## Properties

### clientComponents?

> `optional` **clientComponents**: `ComponentMap`\<[`NuxtContentSdkComponent`](NuxtContentSdkComponent.md)\>

Defined in: [route-handlers/editing-config-route.ts:32](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/f585b36b7f1297cd5452a1dd44d8c7ad219f27dc/packages/nuxt/src/route-handlers/editing-config-route.ts#L32)

Contains only client and universal components that can be used in client bundles.
When provided, Page Builder can distinguish between server and client components.

***

### components

> **components**: `ComponentMap`\<[`NuxtContentSdkComponent`](NuxtContentSdkComponent.md)\>

Defined in: [route-handlers/editing-config-route.ts:23](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/f585b36b7f1297cd5452a1dd44d8c7ad219f27dc/packages/nuxt/src/route-handlers/editing-config-route.ts#L23)

Components available in the application.
Used to report available components to the Sitecore Page Builder.

***

### metadata

> **metadata**: `Metadata`

Defined in: [route-handlers/editing-config-route.ts:27](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/f585b36b7f1297cd5452a1dd44d8c7ad219f27dc/packages/nuxt/src/route-handlers/editing-config-route.ts#L27)

Application metadata containing package information.
