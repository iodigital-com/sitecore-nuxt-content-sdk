[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / EditingRenderRouteConfig

# Type Alias: EditingRenderRouteConfig

> **EditingRenderRouteConfig** = `object`

Defined in: [nuxt/src/route-handlers/editing-render-route.ts:32](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/8963802a0d4f5d901b409afced72114460b0c2b1/packages/nuxt/src/route-handlers/editing-render-route.ts#L32)

## Properties

### allowedQueryParams?

> `optional` **allowedQueryParams**: [`AllowedQueryParams`](AllowedQueryParams.md)

Defined in: [nuxt/src/route-handlers/editing-render-route.ts:46](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/8963802a0d4f5d901b409afced72114460b0c2b1/packages/nuxt/src/route-handlers/editing-render-route.ts#L46)

Query string parameters to allow and include in the search params.
- Array: each item is a parameter name (string) or an object `{ name, required? }`.
- Function: receives the request's query parameter names and returns the list of allowed parameters.

***

### resolvePageUrl()?

> `optional` **resolvePageUrl**: (`itemPath`) => `string`

Defined in: [nuxt/src/route-handlers/editing-render-route.ts:40](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/8963802a0d4f5d901b409afced72114460b0c2b1/packages/nuxt/src/route-handlers/editing-render-route.ts#L40)

Function used to determine route/page URL to render.
This may be necessary for certain custom Nuxt routing configurations.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `itemPath` | `string` | The Sitecore relative item path e.g. '/styleguide' |

#### Returns

`string`

The URL to render

#### Default

`${itemPath}`

***

### sitecoreInternalEditingHostUrl?

> `optional` **sitecoreInternalEditingHostUrl**: `string`

Defined in: [nuxt/src/route-handlers/editing-render-route.ts:55](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/8963802a0d4f5d901b409afced72114460b0c2b1/packages/nuxt/src/route-handlers/editing-render-route.ts#L55)

Optional URL for the internal host of the Sitecore editing environment, used for CORS validation.
If not provided, the route handler will attempt to resolve the internal host URL from the incoming request.
This is necessary in environments where the internal editing host URL cannot be reliably determined from the request (e.g. certain containerized setups).
In such cases, providing this URL explicitly can ensure CORS validation works correctly for requests coming from the Sitecore editing environment.
The URL should include the protocol and port (e.g. 'http://editing-host:9000').
