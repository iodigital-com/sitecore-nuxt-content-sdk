[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / AllowedQueryParamsResolver

# Type Alias: AllowedQueryParamsResolver()

> **AllowedQueryParamsResolver** = (`queryParams`) => ([`AllowedQueryParam`](../interfaces/AllowedQueryParam.md) \| `string`)[]

Defined in: [packages/nuxt/src/sharedTypes/editing-types.ts:22](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/4e1825ea844316bc3551dd4ba9c4c01dbd454c12/packages/nuxt/src/sharedTypes/editing-types.ts#L22)

Resolver function for allowed query parameters, which can be used to extract additional parameters from the query string beyond the required editing parameters.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `queryParams` | `string`[] | Array of query parameters from incoming URL. |

## Returns

([`AllowedQueryParam`](../interfaces/AllowedQueryParam.md) \| `string`)[]

Allowed query editing parameters.
