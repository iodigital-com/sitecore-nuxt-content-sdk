[**@sitecore-content-sdk/nuxt**](../../README.md)

***

[@sitecore-content-sdk/nuxt](../../README.md) / [index](../README.md) / ProxyHandler

# Abstract Class: ProxyHandler

Defined in: [proxy/proxy.ts:53](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/86302afb70ca4607e38cac72430521ce1db7fe2c/packages/nuxt/src/proxy/proxy.ts#L53)

Proxy handler class to be extended by all proxy implementations

## Extended by

- [`ProxyBase`](ProxyBase.md)

## Constructors

### Constructor

> **new ProxyHandler**(): `ProxyHandler`

#### Returns

`ProxyHandler`

## Methods

### handle()

> `abstract` **handle**(`event`): `Promise`\<`void`\>

Defined in: [proxy/proxy.ts:58](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/86302afb70ca4607e38cac72430521ce1db7fe2c/packages/nuxt/src/proxy/proxy.ts#L58)

Handler method to execute proxy logic

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` |  |

#### Returns

`Promise`\<`void`\>
