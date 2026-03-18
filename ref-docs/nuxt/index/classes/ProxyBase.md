[**@sitecore-content-sdk/nuxt**](../../README.md)

***

[@sitecore-content-sdk/nuxt](../../README.md) / [index](../README.md) / ProxyBase

# Abstract Class: ProxyBase

Defined in: [proxy/proxy.ts:72](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/239ded8b6f03402ac29d5b608cdbe50e5fc624bf/packages/nuxt/src/proxy/proxy.ts#L72)

Base proxy class with common methods

## Extends

- [`ProxyHandler`](ProxyHandler.md)

## Extended by

- [`PreviewProxy`](PreviewProxy.md)

## Constructors

### Constructor

> **new ProxyBase**(`config`): `ProxyBase`

Defined in: [proxy/proxy.ts:79](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/239ded8b6f03402ac29d5b608cdbe50e5fc624bf/packages/nuxt/src/proxy/proxy.ts#L79)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `config` | [`ProxyBaseConfig`](../type-aliases/ProxyBaseConfig.md) | Proxy configuration |

#### Returns

`ProxyBase`

#### Overrides

[`ProxyHandler`](ProxyHandler.md).[`constructor`](ProxyHandler.md#constructor)

## Properties

### config

> `protected` **config**: [`ProxyBaseConfig`](../type-aliases/ProxyBaseConfig.md)

Defined in: [proxy/proxy.ts:79](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/239ded8b6f03402ac29d5b608cdbe50e5fc624bf/packages/nuxt/src/proxy/proxy.ts#L79)

Proxy configuration

***

### defaultHostname

> `protected` **defaultHostname**: `string`

Defined in: [proxy/proxy.ts:73](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/239ded8b6f03402ac29d5b608cdbe50e5fc624bf/packages/nuxt/src/proxy/proxy.ts#L73)

***

### siteResolver

> `protected` **siteResolver**: `SiteResolver`

Defined in: [proxy/proxy.ts:74](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/239ded8b6f03402ac29d5b608cdbe50e5fc624bf/packages/nuxt/src/proxy/proxy.ts#L74)

## Methods

### disabled()

> `protected` **disabled**(`event`): `boolean`

Defined in: [proxy/proxy.ts:122](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/239ded8b6f03402ac29d5b608cdbe50e5fc624bf/packages/nuxt/src/proxy/proxy.ts#L122)

Determines if the proxy should be skipped for the current request.
Returns true for Nuxt internal routes, API routes, Sitecore API routes,
or when the custom skip function returns true.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` |  |

#### Returns

`boolean`

true if the proxy should be skipped

***

### getClientFactory()

> `protected` **getClientFactory**(`graphQLOptions`): `GraphQLRequestClientFactory`

Defined in: [proxy/proxy.ts:205](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/239ded8b6f03402ac29d5b608cdbe50e5fc624bf/packages/nuxt/src/proxy/proxy.ts#L205)

Creates a new GraphQLRequestClientFactory instance

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `graphQLOptions` | `GraphQLClientOptions` | content sdk config |

#### Returns

`GraphQLRequestClientFactory`

GraphQLRequestClientFactory instance

***

### getHostHeader()

> `protected` **getHostHeader**(`event`): `string` \| `undefined`

Defined in: [proxy/proxy.ts:151](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/239ded8b6f03402ac29d5b608cdbe50e5fc624bf/packages/nuxt/src/proxy/proxy.ts#L151)

Extract 'host' header.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` |  |

#### Returns

`string` \| `undefined`

The host header, `undefined` will be returned instead of the default value when unavailable

***

### getLanguage()

> `protected` **getLanguage**(`event`): `string`

Defined in: [proxy/proxy.ts:138](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/239ded8b6f03402ac29d5b608cdbe50e5fc624bf/packages/nuxt/src/proxy/proxy.ts#L138)

Provides used language

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` |  |

#### Returns

`string`

language

***

### getSite()

> `protected` **getSite**(`event`): `SiteInfo`

Defined in: [proxy/proxy.ts:164](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/239ded8b6f03402ac29d5b608cdbe50e5fc624bf/packages/nuxt/src/proxy/proxy.ts#L164)

Get site information. If site name is stored in cookie, use it, otherwise resolve by hostname
- If site can't be resolved by site name cookie use default site info based on provided parameters
- If site can't be resolved by hostname, resolves by default hostname

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` |  |

#### Returns

`SiteInfo`

site information

***

### handle()

> `abstract` **handle**(`event`): `Promise`\<`void`\>

Defined in: [proxy/proxy.ts:65](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/239ded8b6f03402ac29d5b608cdbe50e5fc624bf/packages/nuxt/src/proxy/proxy.ts#L65)

Handler method to execute proxy logic

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` |  |

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`ProxyHandler`](ProxyHandler.md).[`handle`](ProxyHandler.md#handle)

***

### isPrefetch()

> `protected` **isPrefetch**(`event`): `boolean`

Defined in: [proxy/proxy.ts:99](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/239ded8b6f03402ac29d5b608cdbe50e5fc624bf/packages/nuxt/src/proxy/proxy.ts#L99)

Determines if the request is a Nuxt prefetch request

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` |  |

#### Returns

`boolean`

is prefetch

***

### isPreview()

> `protected` **isPreview**(`event`): `boolean`

Defined in: [proxy/proxy.ts:90](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/239ded8b6f03402ac29d5b608cdbe50e5fc624bf/packages/nuxt/src/proxy/proxy.ts#L90)

Determines if mode is preview

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` |  |

#### Returns

`boolean`

is preview

***

### rewrite()

> `protected` **rewrite**(`rewritePath`, `event`, `skipHeader?`): `void`

Defined in: [proxy/proxy.ts:191](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/239ded8b6f03402ac29d5b608cdbe50e5fc624bf/packages/nuxt/src/proxy/proxy.ts#L191)

Rewrites the request path for subsequent handling.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `rewritePath` | `string` | The destination path |
| `event` | `H3Event` | The incoming H3 event |
| `skipHeader?` | `boolean` | When true, does not write the x-sc-rewrite header |

#### Returns

`void`
