[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / MiddlewareBase

# Abstract Class: MiddlewareBase

Defined in: [packages/nuxt/src/middleware/middleware.ts:72](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/4e1825ea844316bc3551dd4ba9c4c01dbd454c12/packages/nuxt/src/middleware/middleware.ts#L72)

Base middleware class with common methods

## Extends

- [`MiddlewareHandler`](MiddlewareHandler.md)

## Extended by

- [`PreviewMiddleware`](PreviewMiddleware.md)
- [`MultisiteMiddleware`](MultisiteMiddleware.md)
- [`PersonalizeMiddleware`](PersonalizeMiddleware.md)
- [`LocaleMiddleware`](LocaleMiddleware.md)
- [`RedirectsMiddleware`](RedirectsMiddleware.md)
- [`BotTrackingMiddleware`](BotTrackingMiddleware.md)

## Constructors

### Constructor

> **new MiddlewareBase**(`config`): `MiddlewareBase`

Defined in: [packages/nuxt/src/middleware/middleware.ts:79](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/4e1825ea844316bc3551dd4ba9c4c01dbd454c12/packages/nuxt/src/middleware/middleware.ts#L79)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `config` | [`MiddlewareBaseConfig`](../type-aliases/MiddlewareBaseConfig.md) | Middleware configuration |

#### Returns

`MiddlewareBase`

#### Overrides

[`MiddlewareHandler`](MiddlewareHandler.md).[`constructor`](MiddlewareHandler.md#constructor)

## Properties

### config

> `protected` **config**: [`MiddlewareBaseConfig`](../type-aliases/MiddlewareBaseConfig.md)

Defined in: [packages/nuxt/src/middleware/middleware.ts:79](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/4e1825ea844316bc3551dd4ba9c4c01dbd454c12/packages/nuxt/src/middleware/middleware.ts#L79)

Middleware configuration

***

### defaultHostname

> `protected` **defaultHostname**: `string`

Defined in: [packages/nuxt/src/middleware/middleware.ts:73](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/4e1825ea844316bc3551dd4ba9c4c01dbd454c12/packages/nuxt/src/middleware/middleware.ts#L73)

***

### siteResolver

> `protected` **siteResolver**: [`SiteResolver`](SiteResolver.md)

Defined in: [packages/nuxt/src/middleware/middleware.ts:74](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/4e1825ea844316bc3551dd4ba9c4c01dbd454c12/packages/nuxt/src/middleware/middleware.ts#L74)

## Methods

### disabled()

> `protected` **disabled**(`event`): `boolean`

Defined in: [packages/nuxt/src/middleware/middleware.ts:122](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/4e1825ea844316bc3551dd4ba9c4c01dbd454c12/packages/nuxt/src/middleware/middleware.ts#L122)

Determines if the middleware should be skipped for the current request.
Returns true for Nuxt internal routes, API routes, Sitecore API routes,
or when the custom skip function returns true.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` |  |

#### Returns

`boolean`

true if the middleware should be skipped

***

### getClientFactory()

> `protected` **getClientFactory**(`graphQLOptions`): [`GraphQLRequestClientFactory`](../type-aliases/GraphQLRequestClientFactory.md)

Defined in: [packages/nuxt/src/middleware/middleware.ts:218](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/4e1825ea844316bc3551dd4ba9c4c01dbd454c12/packages/nuxt/src/middleware/middleware.ts#L218)

Creates a new GraphQLRequestClientFactory instance

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `graphQLOptions` | `GraphQLClientOptions` | content sdk config |

#### Returns

[`GraphQLRequestClientFactory`](../type-aliases/GraphQLRequestClientFactory.md)

GraphQLRequestClientFactory instance

***

### getHostHeader()

> `protected` **getHostHeader**(`event`): `string` \| `undefined`

Defined in: [packages/nuxt/src/middleware/middleware.ts:151](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/4e1825ea844316bc3551dd4ba9c4c01dbd454c12/packages/nuxt/src/middleware/middleware.ts#L151)

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

Defined in: [packages/nuxt/src/middleware/middleware.ts:138](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/4e1825ea844316bc3551dd4ba9c4c01dbd454c12/packages/nuxt/src/middleware/middleware.ts#L138)

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

> `protected` **getSite**(`event`): [`SiteInfo`](../type-aliases/SiteInfo.md)

Defined in: [packages/nuxt/src/middleware/middleware.ts:164](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/4e1825ea844316bc3551dd4ba9c4c01dbd454c12/packages/nuxt/src/middleware/middleware.ts#L164)

Get site information. If site name is stored in cookie, use it, otherwise resolve by hostname
- If site can't be resolved by site name cookie use default site info based on provided parameters
- If site can't be resolved by hostname, resolves by default hostname

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` |  |

#### Returns

[`SiteInfo`](../type-aliases/SiteInfo.md)

site information

***

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

#### Inherited from

[`MiddlewareHandler`](MiddlewareHandler.md).[`handle`](MiddlewareHandler.md#handle)

***

### isPrefetch()

> `protected` **isPrefetch**(`event`): `boolean`

Defined in: [packages/nuxt/src/middleware/middleware.ts:99](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/4e1825ea844316bc3551dd4ba9c4c01dbd454c12/packages/nuxt/src/middleware/middleware.ts#L99)

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

Defined in: [packages/nuxt/src/middleware/middleware.ts:90](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/4e1825ea844316bc3551dd4ba9c4c01dbd454c12/packages/nuxt/src/middleware/middleware.ts#L90)

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

Defined in: [packages/nuxt/src/middleware/middleware.ts:204](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/4e1825ea844316bc3551dd4ba9c4c01dbd454c12/packages/nuxt/src/middleware/middleware.ts#L204)

Rewrites the request path for subsequent handling.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `rewritePath` | `string` | The destination path |
| `event` | `H3Event` | The incoming H3 event |
| `skipHeader?` | `boolean` | When true, does not write the x-sc-rewrite header |

#### Returns

`void`
