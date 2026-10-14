[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / AnalyticsMiddlewareAdapter

# Interface: AnalyticsMiddlewareAdapter

Defined in: [packages/nuxt/src/initialization/middleware/analytics-adapter.ts:17](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/7a1e7de41f189807cf81c37cfd6c2421fef22a67/packages/nuxt/src/initialization/middleware/analytics-adapter.ts#L17)

Defines the AnalyticsMiddlewareAdapter.

## Extends

- `AnalyticsAdapter`

## Properties

### getClientId()

> **getClientId**: () => `string` \| `null`

Defined in: @sitecore-content-sdk/analytics-core/types/src/initialization/types.d.ts:18

Gets the client ID.

#### Returns

`string` \| `null`

The client ID, or null if it is not set.

#### Inherited from

`AnalyticsAdapter.getClientId`

***

### isBot()?

> `optional` **isBot**: () => `boolean`

Defined in: @sitecore-content-sdk/analytics-core/types/src/initialization/types.d.ts:13

Checks if the current request is a bot.

#### Returns

`boolean`

True if the current request is a bot, false otherwise.

#### Inherited from

`AnalyticsAdapter.isBot`

***

### location

> **location**: `object`

Defined in: @sitecore-content-sdk/analytics-core/types/src/initialization/types.d.ts:27

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

Defined in: @sitecore-content-sdk/analytics-core/types/src/initialization/types.d.ts:23

Sets the client ID.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the client ID has been set.

#### Inherited from

`AnalyticsAdapter.setClientId`

***

### type

> **type**: `"middleware"`

Defined in: [packages/nuxt/src/initialization/middleware/analytics-adapter.ts:21](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/7a1e7de41f189807cf81c37cfd6c2421fef22a67/packages/nuxt/src/initialization/middleware/analytics-adapter.ts#L21)

The type of the adapter.

#### Overrides

`AnalyticsAdapter.type`
