[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / AnalyticsMiddlewareAdapter

# Interface: AnalyticsMiddlewareAdapter

Defined in: [packages/nuxt/src/initialization/middleware/analytics-adapter.ts:17](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/e1d697260f8666d7ac77ee73644c4bf6a6972edd/packages/nuxt/src/initialization/middleware/analytics-adapter.ts#L17)

Defines the AnalyticsMiddlewareAdapter.

## Extends

- `AnalyticsAdapter`

## Properties

### getClientId()

> **getClientId**: () => `string` \| `null`

Defined in: packages/analytics-core/types/src/initialization/types.d.ts:13

Gets the client ID.

#### Returns

`string` \| `null`

The client ID, or null if it is not set.

#### Inherited from

`AnalyticsAdapter.getClientId`

***

### location

> **location**: `object`

Defined in: packages/analytics-core/types/src/initialization/types.d.ts:22

The location object, which provides a method for getting search parameters.

#### getSearchParams()

> **getSearchParams**: () => `string`

Gets the search parameters from the location.

##### Returns

`string`

The search parameters from the location.

#### Inherited from

`AnalyticsAdapter.location`

***

### setClientId()

> **setClientId**: () => `Promise`\<`void`\>

Defined in: packages/analytics-core/types/src/initialization/types.d.ts:18

Sets the client ID.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the client ID has been set.

#### Inherited from

`AnalyticsAdapter.setClientId`

***

### type

> **type**: `"middleware"`

Defined in: [packages/nuxt/src/initialization/middleware/analytics-adapter.ts:21](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/e1d697260f8666d7ac77ee73644c4bf6a6972edd/packages/nuxt/src/initialization/middleware/analytics-adapter.ts#L21)

The type of the adapter.

#### Overrides

`AnalyticsAdapter.type`
