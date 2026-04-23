[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / analyticsMiddlewareAdapter

# Function: analyticsMiddlewareAdapter()

> **analyticsMiddlewareAdapter**(`event`): [`AnalyticsMiddlewareAdapter`](../interfaces/AnalyticsMiddlewareAdapter.md)

Defined in: [packages/nuxt/src/initialization/middleware/analytics-adapter.ts:32](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/9012ccaea91e6d12c9995dfa53c658f7debe0ac8/packages/nuxt/src/initialization/middleware/analytics-adapter.ts#L32)

Creates a middleware-based analytics adapter that reads and writes the visitor ID
using cookies and can resolve a new client ID from the Edge proxy when needed.
The adapter also provides access to the current URL search parameters.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` | The H3 event object. |

## Returns

[`AnalyticsMiddlewareAdapter`](../interfaces/AnalyticsMiddlewareAdapter.md)

The analytics middleware adapter.
