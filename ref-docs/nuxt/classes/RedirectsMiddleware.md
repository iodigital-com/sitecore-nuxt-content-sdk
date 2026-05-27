[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / RedirectsMiddleware

# Class: RedirectsMiddleware

Defined in: [packages/nuxt/src/middleware/redirects-middleware.ts:74](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/e1d697260f8666d7ac77ee73644c4bf6a6972edd/packages/nuxt/src/middleware/redirects-middleware.ts#L74)

Middleware that fetches redirect rules from Sitecore and applies them to incoming requests.

Supports 301, 302, and server transfer (rewrite) redirect types.
Handles both static URL patterns and regex-based patterns.
Preserves query strings and language prefixes when configured.

Requires the `LocaleMiddleware` to run before this middleware so that the
`x-sc-locale` response header is set and the locale can be resolved correctly.

When neither Edge nor local API configuration is provided, the middleware initializes
in a degraded state and skips all redirect processing. This is expected when running
locally without a connected Sitecore environment.

## Example

```ts
// server/middleware/redirects.ts
import { RedirectsMiddleware } from '@sitecore-content-sdk/nuxt';

const middleware = new RedirectsMiddleware({
  enabled: true,
  contextId: process.env.SITECORE_CONTEXT_ID,
  locales: ['en', 'nl'],
  sites: config.sites,
});

export default defineEventHandler((event) => middleware.handle(event));
@public
```

## Extends

- [`MiddlewareBase`](MiddlewareBase.md)

## Constructors

### Constructor

> **new RedirectsMiddleware**(`config`): `RedirectsMiddleware`

Defined in: [packages/nuxt/src/middleware/redirects-middleware.ts:83](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/e1d697260f8666d7ac77ee73644c4bf6a6972edd/packages/nuxt/src/middleware/redirects-middleware.ts#L83)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `config` | [`RedirectsMiddlewareConfig`](../type-aliases/RedirectsMiddlewareConfig.md) | Redirects middleware configuration. When neither Edge nor local API configuration is provided, `redirectsService` is set to `null` and redirect processing is disabled. |

#### Returns

`RedirectsMiddleware`

#### Overrides

[`MiddlewareBase`](MiddlewareBase.md).[`constructor`](MiddlewareBase.md#constructor)

## Properties

### config

> `protected` **config**: [`RedirectsMiddlewareConfig`](../type-aliases/RedirectsMiddlewareConfig.md)

Defined in: [packages/nuxt/src/middleware/redirects-middleware.ts:83](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/e1d697260f8666d7ac77ee73644c4bf6a6972edd/packages/nuxt/src/middleware/redirects-middleware.ts#L83)

Redirects middleware configuration.
When neither Edge nor local API configuration is provided, `redirectsService` is set
to `null` and redirect processing is disabled.

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`config`](MiddlewareBase.md#config)

***

### defaultHostname

> `protected` **defaultHostname**: `string`

Defined in: [packages/nuxt/src/middleware/middleware.ts:73](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/e1d697260f8666d7ac77ee73644c4bf6a6972edd/packages/nuxt/src/middleware/middleware.ts#L73)

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`defaultHostname`](MiddlewareBase.md#defaulthostname)

***

### redirectsService

> `protected` **redirectsService**: [`RedirectsService`](RedirectsService.md) \| `null`

Defined in: [packages/nuxt/src/middleware/redirects-middleware.ts:75](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/e1d697260f8666d7ac77ee73644c4bf6a6972edd/packages/nuxt/src/middleware/redirects-middleware.ts#L75)

***

### siteResolver

> `protected` **siteResolver**: [`SiteResolver`](SiteResolver.md)

Defined in: [packages/nuxt/src/middleware/middleware.ts:74](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/e1d697260f8666d7ac77ee73644c4bf6a6972edd/packages/nuxt/src/middleware/middleware.ts#L74)

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`siteResolver`](MiddlewareBase.md#siteresolver)

## Methods

### disabled()

> `protected` **disabled**(`event`): `boolean`

Defined in: [packages/nuxt/src/middleware/redirects-middleware.ts:239](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/e1d697260f8666d7ac77ee73644c4bf6a6972edd/packages/nuxt/src/middleware/redirects-middleware.ts#L239)

Determines whether the middleware should be skipped for the current request.

Returns `true` when the redirects service is not configured, the path contains
a file extension (static assets), or the base disabled check matches.

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

### dispatchRedirect()

> `protected` **dispatchRedirect**(`event`, `target`, `type`): `Promise`\<`void`\>

Defined in: [packages/nuxt/src/middleware/redirects-middleware.ts:347](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/e1d697260f8666d7ac77ee73644c4bf6a6972edd/packages/nuxt/src/middleware/redirects-middleware.ts#L347)

Dispatches a redirect or rewrite based on the redirect type.

- `REDIRECT_TYPE_301` → HTTP 301 redirect via `sendRedirect`
- `REDIRECT_TYPE_302` → HTTP 302 redirect via `sendRedirect`
- `REDIRECT_TYPE_SERVER_TRANSFER` → internal rewrite via `this.rewrite`
- Unknown types → falls back to a 302 redirect with a console warning

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` | The incoming H3 event |
| `target` | `string` | The target URL or path |
| `type` | `string` | The redirect type constant |

#### Returns

`Promise`\<`void`\>

***

### getClientFactory()

> `protected` **getClientFactory**(`graphQLOptions`): [`GraphQLRequestClientFactory`](../type-aliases/GraphQLRequestClientFactory.md)

Defined in: [packages/nuxt/src/middleware/middleware.ts:218](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/e1d697260f8666d7ac77ee73644c4bf6a6972edd/packages/nuxt/src/middleware/middleware.ts#L218)

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

### getExistsRedirect()

> `protected` **getExistsRedirect**(`event`, `siteName`): `Promise`\<`RedirectResult` \| `undefined`\>

Defined in: [packages/nuxt/src/middleware/redirects-middleware.ts:376](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/e1d697260f8666d7ac77ee73644c4bf6a6972edd/packages/nuxt/src/middleware/redirects-middleware.ts#L376)

Finds a matching redirect rule for the current request by comparing the normalized
incoming URL against all redirect rules fetched from the Sitecore redirects service.

Handles both static URL patterns and regex-based patterns. For regex patterns,
language prefixes are stripped before matching and query strings are evaluated separately.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` | The incoming H3 event |
| `siteName` | `string` | The resolved Sitecore site name |

#### Returns

`Promise`\<`RedirectResult` \| `undefined`\>

The matched redirect rule, or `undefined` if none found

***

### getHostHeader()

> `protected` **getHostHeader**(`event`): `string` \| `undefined`

Defined in: [packages/nuxt/src/middleware/middleware.ts:151](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/e1d697260f8666d7ac77ee73644c4bf6a6972edd/packages/nuxt/src/middleware/middleware.ts#L151)

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

Defined in: [packages/nuxt/src/middleware/middleware.ts:138](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/e1d697260f8666d7ac77ee73644c4bf6a6972edd/packages/nuxt/src/middleware/middleware.ts#L138)

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

> `protected` **getSite**(`event`): [`SiteInfo`](../type-aliases/SiteInfo.md)

Defined in: [packages/nuxt/src/middleware/middleware.ts:164](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/e1d697260f8666d7ac77ee73644c4bf6a6972edd/packages/nuxt/src/middleware/middleware.ts#L164)

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

Defined in: [packages/nuxt/src/middleware/redirects-middleware.ts:147](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/e1d697260f8666d7ac77ee73644c4bf6a6972edd/packages/nuxt/src/middleware/redirects-middleware.ts#L147)

Handles an incoming request by checking for matching redirect rules and applying them.

Skips execution when:
- The middleware is globally disabled via config
- The request targets a static file, API route, or Nuxt internal route
- The request is a preview or prefetch
- No redirects service is configured
- No matching redirect rule is found

For 301/302 redirects, sends an HTTP redirect response via `sendRedirect`.
For server transfer redirects, rewrites the request path in place.

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

Defined in: [packages/nuxt/src/middleware/middleware.ts:99](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/e1d697260f8666d7ac77ee73644c4bf6a6972edd/packages/nuxt/src/middleware/middleware.ts#L99)

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

Defined in: [packages/nuxt/src/middleware/middleware.ts:90](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/e1d697260f8666d7ac77ee73644c4bf6a6972edd/packages/nuxt/src/middleware/middleware.ts#L90)

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

### normalizeUrl()

> `protected` **normalizeUrl**(`url`): `URL`

Defined in: [packages/nuxt/src/middleware/redirects-middleware.ts:458](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/e1d697260f8666d7ac77ee73644c4bf6a6972edd/packages/nuxt/src/middleware/redirects-middleware.ts#L458)

Normalizes the incoming URL by removing Next.js-style `path=` query parameters
that are added when using the `Link` component.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `url` | `URL` | The URL to normalize |

#### Returns

`URL`

The normalized URL

#### Example

```ts
// '/about/contact?path=about&path=contact' → '/about/contact'
```

***

### processAbsoluteUrlTarget()

> `protected` **processAbsoluteUrlTarget**(`event`, `url`, `existsRedirect`): `Promise`\<`void`\>

Defined in: [packages/nuxt/src/middleware/redirects-middleware.ts:257](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/e1d697260f8666d7ac77ee73644c4bf6a6972edd/packages/nuxt/src/middleware/redirects-middleware.ts#L257)

Handles redirect logic for absolute (external) URLs.
Merges query strings when `isQueryStringPreserved` is set on the redirect rule.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` | The incoming H3 event |
| `url` | `URL` | The normalized incoming URL |
| `existsRedirect` | `RedirectResult` | The matched redirect rule |

#### Returns

`Promise`\<`void`\>

***

### processRelativeUrlTarget()

> `protected` **processRelativeUrlTarget**(`event`, `url`, `existsRedirect`, `language`): `Promise`\<`void`\>

Defined in: [packages/nuxt/src/middleware/redirects-middleware.ts:287](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/e1d697260f8666d7ac77ee73644c4bf6a6972edd/packages/nuxt/src/middleware/redirects-middleware.ts#L287)

Handles redirect logic for relative (internal) URLs.
Resolves the target locale, merges query strings when configured, and applies
any site prefix from the `x-sc-rewrite` response header.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` | The incoming H3 event |
| `url` | `URL` | The normalized incoming URL |
| `existsRedirect` | `RedirectResult` | The matched redirect rule |
| `language` | `string` | The resolved language for the current request |

#### Returns

`Promise`\<`void`\>

***

### rewrite()

> `protected` **rewrite**(`rewritePath`, `event`, `skipHeader?`): `void`

Defined in: [packages/nuxt/src/middleware/middleware.ts:204](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/e1d697260f8666d7ac77ee73644c4bf6a6972edd/packages/nuxt/src/middleware/middleware.ts#L204)

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
