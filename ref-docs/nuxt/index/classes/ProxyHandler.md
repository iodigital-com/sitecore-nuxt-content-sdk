[**@sitecore-content-sdk/nuxt**](../../README.md)

***

[@sitecore-content-sdk/nuxt](../../README.md) / [index](../README.md) / ProxyHandler

# Abstract Class: ProxyHandler

Defined in: [proxy/proxy.ts:60](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/9f27831d38ed4ea4c87bdfb6922610bef950bdc1/packages/nuxt/src/proxy/proxy.ts#L60)

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

Defined in: [proxy/proxy.ts:65](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/9f27831d38ed4ea4c87bdfb6922610bef950bdc1/packages/nuxt/src/proxy/proxy.ts#L65)

Handler method to execute proxy logic

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` |  |

#### Returns

`Promise`\<`void`\>
