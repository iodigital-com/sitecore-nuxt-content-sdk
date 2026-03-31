[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / MiddlewareHandler

# Abstract Class: MiddlewareHandler

Defined in: [nuxt/src/middleware/middleware.ts:60](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/cc7599bd3ffb9b6b0f89c6d5fc538fedfa79fb62/packages/nuxt/src/middleware/middleware.ts#L60)

Middleware handler class to be extended by all middleware implementations

## Extended by

- [`MiddlewareBase`](MiddlewareBase.md)

## Constructors

### Constructor

> **new MiddlewareHandler**(): `MiddlewareHandler`

#### Returns

`MiddlewareHandler`

## Methods

### handle()

> `abstract` **handle**(`event`): `Promise`\<`void`\>

Defined in: [nuxt/src/middleware/middleware.ts:65](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/cc7599bd3ffb9b6b0f89c6d5fc538fedfa79fb62/packages/nuxt/src/middleware/middleware.ts#L65)

Handler method to execute middleware logic

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` |  |

#### Returns

`Promise`\<`void`\>
