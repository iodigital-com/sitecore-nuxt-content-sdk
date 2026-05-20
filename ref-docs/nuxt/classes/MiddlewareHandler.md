[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / MiddlewareHandler

# Abstract Class: MiddlewareHandler

Defined in: [packages/nuxt/src/middleware/middleware.ts:53](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/middleware.ts#L53)

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

Defined in: [packages/nuxt/src/middleware/middleware.ts:58](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/middleware.ts#L58)

Handler method to execute middleware logic

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` |  |

#### Returns

`Promise`\<`void`\>
