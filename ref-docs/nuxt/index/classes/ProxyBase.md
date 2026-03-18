[**@sitecore-content-sdk/nuxt**](../../README.md)

***

[@sitecore-content-sdk/nuxt](../../README.md) / [index](../README.md) / ProxyBase

# Abstract Class: ProxyBase

Defined in: [proxy/proxy.ts:65](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/86302afb70ca4607e38cac72430521ce1db7fe2c/packages/nuxt/src/proxy/proxy.ts#L65)

Base proxy class with common methods

## Extends

- [`ProxyHandler`](ProxyHandler.md)

## Extended by

- [`PreviewProxy`](PreviewProxy.md)

## Constructors

### Constructor

> **new ProxyBase**(`config`): `ProxyBase`

Defined in: [proxy/proxy.ts:69](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/86302afb70ca4607e38cac72430521ce1db7fe2c/packages/nuxt/src/proxy/proxy.ts#L69)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `config` | [`ProxyBaseConfig`](../type-aliases/ProxyBaseConfig.md) |

#### Returns

`ProxyBase`

#### Overrides

[`ProxyHandler`](ProxyHandler.md).[`constructor`](ProxyHandler.md#constructor)

## Properties

### config

> `protected` **config**: [`ProxyBaseConfig`](../type-aliases/ProxyBaseConfig.md)

Defined in: [proxy/proxy.ts:69](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/86302afb70ca4607e38cac72430521ce1db7fe2c/packages/nuxt/src/proxy/proxy.ts#L69)

***

### defaultHostname

> `protected` **defaultHostname**: `string`

Defined in: [proxy/proxy.ts:66](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/86302afb70ca4607e38cac72430521ce1db7fe2c/packages/nuxt/src/proxy/proxy.ts#L66)

***

### siteResolver

> `protected` **siteResolver**: `SiteResolver`

Defined in: [proxy/proxy.ts:67](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/86302afb70ca4607e38cac72430521ce1db7fe2c/packages/nuxt/src/proxy/proxy.ts#L67)

## Methods

### disabled()

> `protected` **disabled**(`event`): `boolean`

Defined in: [proxy/proxy.ts:112](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/86302afb70ca4607e38cac72430521ce1db7fe2c/packages/nuxt/src/proxy/proxy.ts#L112)

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

Defined in: [proxy/proxy.ts:194](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/86302afb70ca4607e38cac72430521ce1db7fe2c/packages/nuxt/src/proxy/proxy.ts#L194)

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

Defined in: [proxy/proxy.ts:141](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/86302afb70ca4607e38cac72430521ce1db7fe2c/packages/nuxt/src/proxy/proxy.ts#L141)

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

Defined in: [proxy/proxy.ts:128](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/86302afb70ca4607e38cac72430521ce1db7fe2c/packages/nuxt/src/proxy/proxy.ts#L128)

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

Defined in: [proxy/proxy.ts:154](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/86302afb70ca4607e38cac72430521ce1db7fe2c/packages/nuxt/src/proxy/proxy.ts#L154)

Get site information. If site name is stored in cookie, use it, otherwise resolve by hostname
- If site can't be resolved by site name cookie use default site info based on provided parameters
- If site can't be resolved by hostname throw an error

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

Defined in: [proxy/proxy.ts:58](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/86302afb70ca4607e38cac72430521ce1db7fe2c/packages/nuxt/src/proxy/proxy.ts#L58)

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

Defined in: [proxy/proxy.ts:89](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/86302afb70ca4607e38cac72430521ce1db7fe2c/packages/nuxt/src/proxy/proxy.ts#L89)

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

Defined in: [proxy/proxy.ts:80](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/86302afb70ca4607e38cac72430521ce1db7fe2c/packages/nuxt/src/proxy/proxy.ts#L80)

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

Defined in: [proxy/proxy.ts:180](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/86302afb70ca4607e38cac72430521ce1db7fe2c/packages/nuxt/src/proxy/proxy.ts#L180)

Create a rewrite response

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `rewritePath` | `string` | the destination path |
| `event` | `H3Event` |  |
| `skipHeader?` | `boolean` | don't write 'x-sc-rewrite' header |

#### Returns

`void`
