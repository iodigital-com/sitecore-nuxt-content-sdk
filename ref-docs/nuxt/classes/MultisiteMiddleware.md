[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / MultisiteMiddleware

# Class: MultisiteMiddleware

Defined in: [nuxt/src/middleware/multisite-middleware.ts:59](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/dd9a23232a2cc3068e1c232b739c5e5e2eaaeb29/packages/nuxt/src/middleware/multisite-middleware.ts#L59)

Middleware that resolves the active Sitecore site for each request and rewrites
the request path to include the site segment.

Because Nuxt uses file-based routing with a `[site]` dynamic segment, the middleware
always runs regardless of whether multisite is configured with multiple sites.
Skipping it would cause 404 errors for regular page requests.
This middleware is only needed when your Nuxt app uses multisite routing
with a `[site]` dynamic segment. If your app serves a single site, do not
register this middleware.

Site resolution order:
1. `sc_site` cookie — when in Sitecore preview mode (`sc_preview` cookie present)
2. `sc_site` query string parameter
3. `site` query string parameter (used in Sitecore Page Builder preview)
4. `sc_site` cookie — when `useCookieResolution` returns true
5. Hostname-based resolution via `SiteResolver`

On success, rewrites `event.node.req.url` to `/${siteName}${pathname}` and sets
the `sc_site` cookie for downstream middleware.

## Example

```ts
// server/middleware/multisite.ts
import { MultisiteMiddleware } from '@sitecore-content-sdk/nuxt';

const middleware = new MultisiteMiddleware({
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

Defined in: [nuxt/src/middleware/multisite-middleware.ts:63](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/dd9a23232a2cc3068e1c232b739c5e5e2eaaeb29/packages/nuxt/src/middleware/multisite-middleware.ts#L63)

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

Defined in: [nuxt/src/middleware/multisite-middleware.ts:63](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/dd9a23232a2cc3068e1c232b739c5e5e2eaaeb29/packages/nuxt/src/middleware/multisite-middleware.ts#L63)

Multisite middleware configuration

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`config`](MiddlewareBase.md#config)

***

### defaultHostname

> `protected` **defaultHostname**: `string`

Defined in: [nuxt/src/middleware/middleware.ts:73](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/dd9a23232a2cc3068e1c232b739c5e5e2eaaeb29/packages/nuxt/src/middleware/middleware.ts#L73)

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`defaultHostname`](MiddlewareBase.md#defaulthostname)

***

### siteResolver

> `protected` **siteResolver**: `SiteResolver`

Defined in: [nuxt/src/middleware/middleware.ts:74](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/dd9a23232a2cc3068e1c232b739c5e5e2eaaeb29/packages/nuxt/src/middleware/middleware.ts#L74)

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`siteResolver`](MiddlewareBase.md#siteresolver)

## Methods

### disabled()

> `protected` **disabled**(`event`): `boolean`

Defined in: [nuxt/src/middleware/multisite-middleware.ts:132](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/dd9a23232a2cc3068e1c232b739c5e5e2eaaeb29/packages/nuxt/src/middleware/multisite-middleware.ts#L132)

Determines whether the middleware should be skipped for the current request.
Returns `true` for paths containing a file extension (static assets) or
when the base disabled check matches (API routes, Nuxt internal routes, custom skip).

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

Defined in: [nuxt/src/middleware/middleware.ts:205](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/dd9a23232a2cc3068e1c232b739c5e5e2eaaeb29/packages/nuxt/src/middleware/middleware.ts#L205)

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

Defined in: [nuxt/src/middleware/middleware.ts:151](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/dd9a23232a2cc3068e1c232b739c5e5e2eaaeb29/packages/nuxt/src/middleware/middleware.ts#L151)

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

Defined in: [nuxt/src/middleware/middleware.ts:138](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/dd9a23232a2cc3068e1c232b739c5e5e2eaaeb29/packages/nuxt/src/middleware/middleware.ts#L138)

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

Defined in: [nuxt/src/middleware/middleware.ts:164](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/dd9a23232a2cc3068e1c232b739c5e5e2eaaeb29/packages/nuxt/src/middleware/middleware.ts#L164)

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

Defined in: [nuxt/src/middleware/multisite-middleware.ts:146](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/dd9a23232a2cc3068e1c232b739c5e5e2eaaeb29/packages/nuxt/src/middleware/multisite-middleware.ts#L146)

Generates the site-specific rewrite path by prepending the site name segment.

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
// '/about' + 'my-site' → '/my-site/about'
// 'about' + 'my-site' → '/my-site/about'
```

***

### handle()

> **handle**(`event`): `Promise`\<`void`\>

Defined in: [nuxt/src/middleware/multisite-middleware.ts:80](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/dd9a23232a2cc3068e1c232b739c5e5e2eaaeb29/packages/nuxt/src/middleware/multisite-middleware.ts#L80)

Handles an incoming request by resolving the active site and rewriting the path.

Skips execution for static files, API routes, Nuxt internal routes, and when
a custom skip function returns true.

In Sitecore preview mode, the site name is read from the `sc_site` cookie to
preserve site context during navigation between pages.

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

Defined in: [nuxt/src/middleware/middleware.ts:99](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/dd9a23232a2cc3068e1c232b739c5e5e2eaaeb29/packages/nuxt/src/middleware/middleware.ts#L99)

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

Defined in: [nuxt/src/middleware/middleware.ts:90](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/dd9a23232a2cc3068e1c232b739c5e5e2eaaeb29/packages/nuxt/src/middleware/middleware.ts#L90)

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

Defined in: [nuxt/src/middleware/middleware.ts:191](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/dd9a23232a2cc3068e1c232b739c5e5e2eaaeb29/packages/nuxt/src/middleware/middleware.ts#L191)

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
