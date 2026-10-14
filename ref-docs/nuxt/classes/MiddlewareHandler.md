[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / MiddlewareHandler

# Abstract Class: MiddlewareHandler

Defined in: [packages/nuxt/src/middleware/middleware.ts:60](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/4e1825ea844316bc3551dd4ba9c4c01dbd454c12/packages/nuxt/src/middleware/middleware.ts#L60)

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

Defined in: [packages/nuxt/src/middleware/middleware.ts:65](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/4e1825ea844316bc3551dd4ba9c4c01dbd454c12/packages/nuxt/src/middleware/middleware.ts#L65)

Handler method to execute middleware logic

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` |  |

#### Returns

`Promise`\<`void`\>
