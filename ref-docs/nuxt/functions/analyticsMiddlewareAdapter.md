[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / analyticsMiddlewareAdapter

# Function: analyticsMiddlewareAdapter()

> **analyticsMiddlewareAdapter**(`event`): [`AnalyticsMiddlewareAdapter`](../interfaces/AnalyticsMiddlewareAdapter.md)

Defined in: [nuxt/src/initialization/middleware/analytics-adapter.ts:32](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/0855a622b10e7f8f1a092bf930d8d53d3144a776/packages/nuxt/src/initialization/middleware/analytics-adapter.ts#L32)

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
