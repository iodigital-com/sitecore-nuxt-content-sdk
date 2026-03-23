[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / RobotsRouteOptions

# Type Alias: RobotsRouteOptions

> **RobotsRouteOptions** = `object`

Defined in: [route-handlers/robots-route.ts:11](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/f585b36b7f1297cd5452a1dd44d8c7ad219f27dc/packages/nuxt/src/route-handlers/robots-route.ts#L11)

## Properties

### client

> **client**: `SitecoreClient`

Defined in: [route-handlers/robots-route.ts:15](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/f585b36b7f1297cd5452a1dd44d8c7ad219f27dc/packages/nuxt/src/route-handlers/robots-route.ts#L15)

Sitecore client instance used to fetch robots.txt content.

***

### revalidate?

> `optional` **revalidate**: `number` \| `false`

Defined in: [route-handlers/robots-route.ts:25](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/f585b36b7f1297cd5452a1dd44d8c7ad219f27dc/packages/nuxt/src/route-handlers/robots-route.ts#L25)

Cache revalidation interval in seconds.
Pass false to cache indefinitely.
Default is 60 seconds.

***

### sites

> **sites**: `SiteInfo`[]

Defined in: [route-handlers/robots-route.ts:19](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/f585b36b7f1297cd5452a1dd44d8c7ad219f27dc/packages/nuxt/src/route-handlers/robots-route.ts#L19)

List of sites used for site resolution by hostname.
