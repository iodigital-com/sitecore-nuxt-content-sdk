[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / RedirectsMiddlewareConfig

# Type Alias: RedirectsMiddlewareConfig

> **RedirectsMiddlewareConfig** = `Omit`\<[`RedirectsServiceConfig`](RedirectsServiceConfig.md), `"fetch"` \| `"clientFactory"`\> & [`SitecoreConfig`](SitecoreConfig.md)\[`"api"`\]\[`"edge"`\] & `Partial`\<`NonNullable`\<[`SitecoreConfig`](SitecoreConfig.md)\[`"api"`\]\[`"local"`\]\>\> & [`MiddlewareBaseConfig`](MiddlewareBaseConfig.md) & [`SitecoreConfig`](SitecoreConfig.md)\[`"redirects"`\] & `object`

Defined in: [packages/nuxt/src/middleware/redirects-middleware.ts:35](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/9012ccaea91e6d12c9995dfa53c658f7debe0ac8/packages/nuxt/src/middleware/redirects-middleware.ts#L35)

Configuration for the RedirectsMiddleware.

Requires either Edge API configuration (`contextId`/`clientContextId`) or local API
configuration (`apiHost`/`apiKey`). When neither is present, the middleware initializes
without a redirects service and skips execution.

## Type Declaration

### redirectsService?

> `optional` **redirectsService**: [`RedirectsService`](../classes/RedirectsService.md)

Optional override for the redirects service. When provided, the default
RedirectsService is not instantiated.
