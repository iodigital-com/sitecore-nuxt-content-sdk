[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / createSitemapRoute

# Function: createSitemapRoute()

> **createSitemapRoute**(`options`): `object`

Defined in: [nuxt/src/route-handlers/sitemap-route.ts:33](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/cc7599bd3ffb9b6b0f89c6d5fc538fedfa79fb62/packages/nuxt/src/route-handlers/sitemap-route.ts#L33)

Creates a route handler to serve the sitemap.xml file.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`SitemapRouteOptions`](../type-aliases/SitemapRouteOptions.md) | The options for the route handler. |

## Returns

The route handler.

### handle()

> **handle**: (`event`) => `Promise`\<`void`\>

Handles an incoming sitemap.xml request.
Resolves the site by hostname, fetches the sitemap.xml content from Sitecore,
and sends it as an XML response.
Returns 404 with a default disallow rule if no content is found.
Returns 500 if the Sitecore request fails.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` | The incoming H3 event |

#### Returns

`Promise`\<`void`\>

#### Throws

Will throw an error if the event's hostname cannot be found in the site resolver.
