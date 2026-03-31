[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / SitemapRouteOptions

# Type Alias: SitemapRouteOptions

> **SitemapRouteOptions** = `object`

Defined in: [nuxt/src/route-handlers/sitemap-route.ts:10](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/cc7599bd3ffb9b6b0f89c6d5fc538fedfa79fb62/packages/nuxt/src/route-handlers/sitemap-route.ts#L10)

## Properties

### client

> **client**: `SitecoreClient`

Defined in: [nuxt/src/route-handlers/sitemap-route.ts:14](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/cc7599bd3ffb9b6b0f89c6d5fc538fedfa79fb62/packages/nuxt/src/route-handlers/sitemap-route.ts#L14)

Sitecore client instance used to fetch robots.txt content.

***

### revalidate?

> `optional` **revalidate**: `number` \| `false`

Defined in: [nuxt/src/route-handlers/sitemap-route.ts:24](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/cc7599bd3ffb9b6b0f89c6d5fc538fedfa79fb62/packages/nuxt/src/route-handlers/sitemap-route.ts#L24)

Cache revalidation interval in seconds.
Pass false to cache indefinitely.
Default is 60 seconds.

***

### sites

> **sites**: `SiteInfo`[]

Defined in: [nuxt/src/route-handlers/sitemap-route.ts:18](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/cc7599bd3ffb9b6b0f89c6d5fc538fedfa79fb62/packages/nuxt/src/route-handlers/sitemap-route.ts#L18)

List of sites used for site resolution by hostname.
