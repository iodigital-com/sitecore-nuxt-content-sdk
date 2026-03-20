[**@sitecore-content-sdk/nuxt**](../../README.md)

***

[@sitecore-content-sdk/nuxt](../../README.md) / [index](../README.md) / ProxyHandler

# Abstract Class: ProxyHandler

Defined in: [proxy/proxy.ts:60](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/3e9ab6412a8024198f4f7a02eed2152a06d94ee6/packages/nuxt/src/proxy/proxy.ts#L60)

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

Defined in: [proxy/proxy.ts:65](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/3e9ab6412a8024198f4f7a02eed2152a06d94ee6/packages/nuxt/src/proxy/proxy.ts#L65)

Handler method to execute proxy logic

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` |  |

#### Returns

`Promise`\<`void`\>
