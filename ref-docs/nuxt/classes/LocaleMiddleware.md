[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / LocaleMiddleware

# Class: LocaleMiddleware

Defined in: [packages/nuxt/src/middleware/locale-middleware.ts:36](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/9012ccaea91e6d12c9995dfa53c658f7debe0ac8/packages/nuxt/src/middleware/locale-middleware.ts#L36)

Middleware that resolves the active locale from the request path and shares it
with downstream middleware via the `x-sc-locale` response header.

Nuxt i18n handles the actual locale routing and path rewriting. This middleware
only reads the resolved locale and makes it available to other middleware in the chain,
such as PersonalizeMiddleware, which reads the header via `getLanguage()`.

## Example

```ts
// server/middleware/locale.ts
import { LocaleMiddleware } from '@sitecore-content-sdk/nuxt';

const middleware = new LocaleMiddleware({
  locales: ['en', 'nl', 'de'],
  sites: config.sites,
});

export default defineEventHandler((event) => middleware.handle(event));
@public
```

## Extends

- [`MiddlewareBase`](MiddlewareBase.md)

## Constructors

### Constructor

> **new LocaleMiddleware**(`config`): `LocaleMiddleware`

Defined in: [packages/nuxt/src/middleware/locale-middleware.ts:40](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/9012ccaea91e6d12c9995dfa53c658f7debe0ac8/packages/nuxt/src/middleware/locale-middleware.ts#L40)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `config` | [`LocaleMiddlewareConfig`](../type-aliases/LocaleMiddlewareConfig.md) | Locale middleware configuration |

#### Returns

`LocaleMiddleware`

#### Overrides

[`MiddlewareBase`](MiddlewareBase.md).[`constructor`](MiddlewareBase.md#constructor)

## Properties

### config

> `protected` **config**: [`LocaleMiddlewareConfig`](../type-aliases/LocaleMiddlewareConfig.md)

Defined in: [packages/nuxt/src/middleware/locale-middleware.ts:40](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/9012ccaea91e6d12c9995dfa53c658f7debe0ac8/packages/nuxt/src/middleware/locale-middleware.ts#L40)

Locale middleware configuration

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`config`](MiddlewareBase.md#config)

***

### defaultHostname

> `protected` **defaultHostname**: `string`

Defined in: [packages/nuxt/src/middleware/middleware.ts:73](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/9012ccaea91e6d12c9995dfa53c658f7debe0ac8/packages/nuxt/src/middleware/middleware.ts#L73)

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`defaultHostname`](MiddlewareBase.md#defaulthostname)

***

### siteResolver

> `protected` **siteResolver**: [`SiteResolver`](SiteResolver.md)

Defined in: [packages/nuxt/src/middleware/middleware.ts:74](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/9012ccaea91e6d12c9995dfa53c658f7debe0ac8/packages/nuxt/src/middleware/middleware.ts#L74)

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`siteResolver`](MiddlewareBase.md#siteresolver)

## Methods

### disabled()

> `protected` **disabled**(`event`): `boolean`

Defined in: [packages/nuxt/src/middleware/locale-middleware.ts:96](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/9012ccaea91e6d12c9995dfa53c658f7debe0ac8/packages/nuxt/src/middleware/locale-middleware.ts#L96)

Determines whether the middleware should be skipped for the current request.
Returns `true` for paths containing a file extension (static assets) or
when the base disabled check matches.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` | The incoming H3 event |

#### Returns

`boolean`

`true` if the middleware should be skipped

#### Overrides

[`MiddlewareBase`](MiddlewareBase.md).[`disabled`](MiddlewareBase.md#disabled)

***

### getClientFactory()

> `protected` **getClientFactory**(`graphQLOptions`): [`GraphQLRequestClientFactory`](../type-aliases/GraphQLRequestClientFactory.md)

Defined in: [packages/nuxt/src/middleware/middleware.ts:218](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/9012ccaea91e6d12c9995dfa53c658f7debe0ac8/packages/nuxt/src/middleware/middleware.ts#L218)

Creates a new GraphQLRequestClientFactory instance

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `graphQLOptions` | `GraphQLClientOptions` | content sdk config |

#### Returns

[`GraphQLRequestClientFactory`](../type-aliases/GraphQLRequestClientFactory.md)

GraphQLRequestClientFactory instance

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`getClientFactory`](MiddlewareBase.md#getclientfactory)

***

### getHostHeader()

> `protected` **getHostHeader**(`event`): `string` \| `undefined`

Defined in: [packages/nuxt/src/middleware/middleware.ts:151](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/9012ccaea91e6d12c9995dfa53c658f7debe0ac8/packages/nuxt/src/middleware/middleware.ts#L151)

Extract 'host' header.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` |  |

#### Returns

`string` \| `undefined`

The host header, `undefined` will be returned instead of the default value when unavailable

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`getHostHeader`](MiddlewareBase.md#gethostheader)

***

### getLanguage()

> `protected` **getLanguage**(`event`): `string`

Defined in: [packages/nuxt/src/middleware/middleware.ts:138](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/9012ccaea91e6d12c9995dfa53c658f7debe0ac8/packages/nuxt/src/middleware/middleware.ts#L138)

Provides used language

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` |  |

#### Returns

`string`

language

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`getLanguage`](MiddlewareBase.md#getlanguage)

***

### getLocaleFromPath()

> `protected` **getLocaleFromPath**(`path`): `string` \| `undefined`

Defined in: [packages/nuxt/src/middleware/locale-middleware.ts:110](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/9012ccaea91e6d12c9995dfa53c658f7debe0ac8/packages/nuxt/src/middleware/locale-middleware.ts#L110)

Extracts the active locale from the request path by matching against the configured locales.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | The request pathname |

#### Returns

`string` \| `undefined`

The matched locale, or `undefined` if not found

#### Example

```ts
// '/nl-NL/about' → 'nl-NL'
// '/en' → 'en'
// '/about' → undefined
```

***

### getSite()

> `protected` **getSite**(`event`): [`SiteInfo`](../type-aliases/SiteInfo.md)

Defined in: [packages/nuxt/src/middleware/middleware.ts:164](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/9012ccaea91e6d12c9995dfa53c658f7debe0ac8/packages/nuxt/src/middleware/middleware.ts#L164)

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

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`getSite`](MiddlewareBase.md#getsite)

***

### handle()

> **handle**(`event`): `Promise`\<`void`\>

Defined in: [packages/nuxt/src/middleware/locale-middleware.ts:53](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/9012ccaea91e6d12c9995dfa53c658f7debe0ac8/packages/nuxt/src/middleware/locale-middleware.ts#L53)

Handles an incoming request by resolving the active locale and setting
the `x-sc-locale` response header.

Skips execution for static files, API routes, and Nuxt internal routes.
Falls back to `config.defaultLanguage` or `'en'` when no locale is found in the path.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` | The incoming H3 event |

#### Returns

`Promise`\<`void`\>

#### Overrides

[`MiddlewareBase`](MiddlewareBase.md).[`handle`](MiddlewareBase.md#handle)

***

### isPrefetch()

> `protected` **isPrefetch**(`event`): `boolean`

Defined in: [packages/nuxt/src/middleware/middleware.ts:99](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/9012ccaea91e6d12c9995dfa53c658f7debe0ac8/packages/nuxt/src/middleware/middleware.ts#L99)

Determines if the request is a Nuxt prefetch request

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` |  |

#### Returns

`boolean`

is prefetch

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`isPrefetch`](MiddlewareBase.md#isprefetch)

***

### isPreview()

> `protected` **isPreview**(`event`): `boolean`

Defined in: [packages/nuxt/src/middleware/middleware.ts:90](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/9012ccaea91e6d12c9995dfa53c658f7debe0ac8/packages/nuxt/src/middleware/middleware.ts#L90)

Determines if mode is preview

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` |  |

#### Returns

`boolean`

is preview

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`isPreview`](MiddlewareBase.md#ispreview)

***

### rewrite()

> `protected` **rewrite**(`rewritePath`, `event`, `skipHeader?`): `void`

Defined in: [packages/nuxt/src/middleware/middleware.ts:204](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/9012ccaea91e6d12c9995dfa53c658f7debe0ac8/packages/nuxt/src/middleware/middleware.ts#L204)

Rewrites the request path for subsequent handling.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `rewritePath` | `string` | The destination path |
| `event` | `H3Event` | The incoming H3 event |
| `skipHeader?` | `boolean` | When true, does not write the x-sc-rewrite header |

#### Returns

`void`

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`rewrite`](MiddlewareBase.md#rewrite)
