[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / MultisiteMiddleware

# Class: MultisiteMiddleware

Defined in: nuxt/src/middleware/multisite-middleware.ts:55

Middleware that resolves the active Sitecore site for each request and rewrites
the request path to include the site segment.

Site resolution order:
1. `sc_site` query string parameter
2. `site` query string parameter (used in Page Builder preview)
3. `sc_site` cookie (when `useCookieResolution` returns true)
4. Hostname-based resolution via `SiteResolver`

In Sitecore preview mode (`sc_preview` cookie present), the site name is read
directly from the `sc_site` cookie to preserve site context during navigation.

On success, rewrites `event.node.req.url` to the site-specific path and sets
the `sc_site` cookie for downstream middleware.

## Example

```ts
// server/middleware/multisite.ts
import { MultisiteMiddleware } from '@sitecore-content-sdk/nuxt';

const middleware = new MultisiteMiddleware({
  enabled: true,
  useCookieResolution: () => true,
  sites: config.sites,
});

export default defineEventHandler((event) => middleware.handle(event));
@public
```

## Extends

- [`MiddlewareBase`](MiddlewareBase.md)

## Constructors

### Constructor

> **new MultisiteMiddleware**(`config`): `MultisiteMiddleware`

Defined in: nuxt/src/middleware/multisite-middleware.ts:59

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `config` | [`MultisiteMiddlewareConfig`](../type-aliases/MultisiteMiddlewareConfig.md) | Multisite middleware configuration |

#### Returns

`MultisiteMiddleware`

#### Overrides

[`MiddlewareBase`](MiddlewareBase.md).[`constructor`](MiddlewareBase.md#constructor)

## Properties

### config

> `protected` **config**: [`MultisiteMiddlewareConfig`](../type-aliases/MultisiteMiddlewareConfig.md)

Defined in: nuxt/src/middleware/multisite-middleware.ts:59

Multisite middleware configuration

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`config`](MiddlewareBase.md#config)

***

### defaultHostname

> `protected` **defaultHostname**: `string`

Defined in: [nuxt/src/middleware/middleware.ts:73](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/bcfd48627517b7dcda869581de14dee3f971bda7/packages/nuxt/src/middleware/middleware.ts#L73)

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`defaultHostname`](MiddlewareBase.md#defaulthostname)

***

### siteResolver

> `protected` **siteResolver**: `SiteResolver`

Defined in: [nuxt/src/middleware/middleware.ts:74](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/bcfd48627517b7dcda869581de14dee3f971bda7/packages/nuxt/src/middleware/middleware.ts#L74)

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`siteResolver`](MiddlewareBase.md#siteresolver)

## Methods

### disabled()

> `protected` **disabled**(`event`): `boolean`

Defined in: nuxt/src/middleware/multisite-middleware.ts:150

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

> `protected` **getClientFactory**(`graphQLOptions`): `GraphQLRequestClientFactory`

Defined in: [nuxt/src/middleware/middleware.ts:205](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/bcfd48627517b7dcda869581de14dee3f971bda7/packages/nuxt/src/middleware/middleware.ts#L205)

Creates a new GraphQLRequestClientFactory instance

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `graphQLOptions` | `GraphQLClientOptions` | content sdk config |

#### Returns

`GraphQLRequestClientFactory`

GraphQLRequestClientFactory instance

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`getClientFactory`](MiddlewareBase.md#getclientfactory)

***

### getHostHeader()

> `protected` **getHostHeader**(`event`): `string` \| `undefined`

Defined in: [nuxt/src/middleware/middleware.ts:151](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/bcfd48627517b7dcda869581de14dee3f971bda7/packages/nuxt/src/middleware/middleware.ts#L151)

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

Defined in: [nuxt/src/middleware/middleware.ts:138](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/bcfd48627517b7dcda869581de14dee3f971bda7/packages/nuxt/src/middleware/middleware.ts#L138)

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

### getSite()

> `protected` **getSite**(`event`): `SiteInfo`

Defined in: [nuxt/src/middleware/middleware.ts:164](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/bcfd48627517b7dcda869581de14dee3f971bda7/packages/nuxt/src/middleware/middleware.ts#L164)

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

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`getSite`](MiddlewareBase.md#getsite)

***

### getSiteRewrite()

> `protected` **getSiteRewrite**(`pathname`, `siteName`): `string`

Defined in: nuxt/src/middleware/multisite-middleware.ts:180

Generates a site-specific rewrite path based on the provided pathname and site name.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `pathname` | `string` | The pathname to rewrite |
| `siteName` | `string` | The resolved site name |

#### Returns

`string`

The rewritten path

#### Example

```ts
// '/about' + 'my-site' → '/_site_my-site/about'
```

***

### handle()

> **handle**(`event`): `Promise`\<`void`\>

Defined in: nuxt/src/middleware/multisite-middleware.ts:75

Handles an incoming request by resolving the active site and rewriting the path.

Skips execution when:
- The middleware is globally disabled via config (unless in preview mode)
- The request targets a static file, API route, or Nuxt internal route
- The request is a preview (unless site name preservation is needed)

Errors are caught and logged without re-throwing, so the request continues normally.

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

Defined in: [nuxt/src/middleware/middleware.ts:99](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/bcfd48627517b7dcda869581de14dee3f971bda7/packages/nuxt/src/middleware/middleware.ts#L99)

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

Defined in: [nuxt/src/middleware/middleware.ts:90](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/bcfd48627517b7dcda869581de14dee3f971bda7/packages/nuxt/src/middleware/middleware.ts#L90)

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

Defined in: [nuxt/src/middleware/middleware.ts:191](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/bcfd48627517b7dcda869581de14dee3f971bda7/packages/nuxt/src/middleware/middleware.ts#L191)

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

***

### shouldSkipWhenDisabled()

> `protected` **shouldSkipWhenDisabled**(): `boolean`

Defined in: nuxt/src/middleware/multisite-middleware.ts:168

Determines if the middleware should be skipped when multisite is disabled.
Override in subclasses to provide environment-specific behaviour.

#### Returns

`boolean`

`true` if the middleware should be skipped when disabled

***

### shouldWarnWhenDisabled()

> `protected` **shouldWarnWhenDisabled**(): `void`

Defined in: nuxt/src/middleware/multisite-middleware.ts:159

Called when multisite is disabled. Override in subclasses to show
environment-specific warnings.

#### Returns

`void`
