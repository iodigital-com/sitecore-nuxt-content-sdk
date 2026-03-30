[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / SitemapRouteOptions

# Type Alias: SitemapRouteOptions

> **SitemapRouteOptions** = `object`

Defined in: route-handlers/sitemap-route.ts:10

## Properties

### client

> **client**: `SitecoreClient`

Defined in: route-handlers/sitemap-route.ts:14

Sitecore client instance used to fetch robots.txt content.

***

### revalidate?

> `optional` **revalidate**: `number` \| `false`

Defined in: route-handlers/sitemap-route.ts:24

Cache revalidation interval in seconds.
Pass false to cache indefinitely.
Default is 60 seconds.

***

### sites

> **sites**: `SiteInfo`[]

Defined in: route-handlers/sitemap-route.ts:18

List of sites used for site resolution by hostname.
