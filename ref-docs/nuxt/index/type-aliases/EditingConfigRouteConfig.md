[**@sitecore-content-sdk/nuxt**](../../README.md)

***

[@sitecore-content-sdk/nuxt](../../README.md) / [index](../README.md) / EditingConfigRouteConfig

# Type Alias: EditingConfigRouteConfig

> **EditingConfigRouteConfig** = `object`

Defined in: routes/editing-config-route.ts:18

Configuration for the EditingConfigRoute.

## Properties

### clientComponents?

> `optional` **clientComponents**: `ComponentMap`\<[`NuxtContentSdkComponent`](NuxtContentSdkComponent.md)\>

Defined in: routes/editing-config-route.ts:32

Contains only client and universal components that can be used in client bundles.
When provided, Page Builder can distinguish between server and client components.

***

### components

> **components**: `ComponentMap`\<[`NuxtContentSdkComponent`](NuxtContentSdkComponent.md)\>

Defined in: routes/editing-config-route.ts:23

Components available in the application.
Used to report available components to the Sitecore Page Builder.

***

### metadata

> **metadata**: `Metadata`

Defined in: routes/editing-config-route.ts:27

Application metadata containing package information.
