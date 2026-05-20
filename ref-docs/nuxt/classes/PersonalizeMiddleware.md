[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / PersonalizeMiddleware

# Class: PersonalizeMiddleware

Defined in: [packages/nuxt/src/middleware/personalize-middleware.ts:128](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/personalize-middleware.ts#L128)

Middleware that integrates Sitecore Personalize into the Nuxt server middleware chain.

On each request, it resolves the current site, fetches personalize info from the Edge API,
calls the CDP to identify applicable variants, and rewrites the request path to the
personalized route.

When Edge configuration (`contextId`/`clientContextId`) is missing, the middleware
initializes in a degraded state and skips all personalization. This is expected when
running locally without a connected Sitecore environment.

## Example

```ts
// server/middleware/personalize.ts
import { PersonalizeMiddleware } from '@sitecore-content-sdk/nuxt';

const middleware = new PersonalizeMiddleware({
  enabled: true,
  contextId: process.env.SITECORE_CONTEXT_ID,
  clientContextId: process.env.SITECORE_CLIENT_CONTEXT_ID,
  edgeUrl: process.env.SITECORE_EDGE_URL,
  edgeTimeout: 400,
  cdpTimeout: 400,
  sites: config.sites,
});

export default defineEventHandler((event) => middleware.handle(event));
```

## Extends

- [`MiddlewareBase`](MiddlewareBase.md)

## Constructors

### Constructor

> **new PersonalizeMiddleware**(`config`): `PersonalizeMiddleware`

Defined in: [packages/nuxt/src/middleware/personalize-middleware.ts:136](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/personalize-middleware.ts#L136)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `config` | [`PersonalizeMiddlewareConfig`](../type-aliases/PersonalizeMiddlewareConfig.md) | Personalize middleware configuration. When `contextId` and `clientContextId` are not provided, `personalizeService` is set to `null` and personalization is disabled. |

#### Returns

`PersonalizeMiddleware`

#### Overrides

[`MiddlewareBase`](MiddlewareBase.md).[`constructor`](MiddlewareBase.md#constructor)

## Properties

### config

> `protected` **config**: [`PersonalizeMiddlewareConfig`](../type-aliases/PersonalizeMiddlewareConfig.md)

Defined in: [packages/nuxt/src/middleware/personalize-middleware.ts:136](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/personalize-middleware.ts#L136)

Personalize middleware configuration.
When `contextId` and `clientContextId` are not provided, `personalizeService` is set
to `null` and personalization is disabled.

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`config`](MiddlewareBase.md#config)

***

### defaultHostname

> `protected` **defaultHostname**: `string`

Defined in: [packages/nuxt/src/middleware/middleware.ts:66](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/middleware.ts#L66)

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`defaultHostname`](MiddlewareBase.md#defaulthostname)

***

### personalizeService

> `protected` **personalizeService**: [`PersonalizeService`](PersonalizeService.md) \| `null`

Defined in: [packages/nuxt/src/middleware/personalize-middleware.ts:129](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/personalize-middleware.ts#L129)

***

### siteResolver

> `protected` **siteResolver**: [`SiteResolver`](SiteResolver.md)

Defined in: [packages/nuxt/src/middleware/middleware.ts:67](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/middleware.ts#L67)

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`siteResolver`](MiddlewareBase.md#siteresolver)

## Methods

### disabled()

> `protected` **disabled**(`event`): `boolean`

Defined in: [packages/nuxt/src/middleware/personalize-middleware.ts:323](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/personalize-middleware.ts#L323)

Determines whether the middleware should be skipped for the current request.

Returns `true` when the personalize service is not configured, the path contains
a file extension (static assets), or the base disabled check matches.

Also logs a debug message when skipping due to missing Edge configuration.

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

Defined in: [packages/nuxt/src/middleware/middleware.ts:211](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/middleware.ts#L211)

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

### getExperienceParams()

> `protected` **getExperienceParams**(`event`): [`ExperienceParams`](../type-aliases/ExperienceParams.md)

Defined in: [packages/nuxt/src/middleware/personalize-middleware.ts:344](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/personalize-middleware.ts#L344)

Builds the experience context params from the current request.

Reads UTM parameters from the query string and merges any additional
params returned by `config.getExtraUtmParams`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` | The incoming H3 event |

#### Returns

[`ExperienceParams`](../type-aliases/ExperienceParams.md)

The experience params to pass to the CDP

***

### getHostHeader()

> `protected` **getHostHeader**(`event`): `string` \| `undefined`

Defined in: [packages/nuxt/src/middleware/middleware.ts:142](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/middleware.ts#L142)

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

Defined in: [packages/nuxt/src/middleware/middleware.ts:131](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/middleware.ts#L131)

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

### getPersonalizeExecutions()

> `protected` **getPersonalizeExecutions**(`personalizeInfo`, `language`): `PersonalizeExecution`[]

Defined in: [packages/nuxt/src/middleware/personalize-middleware.ts:460](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/personalize-middleware.ts#L460)

Builds the list of CDP experience calls based on the personalize info for the current route.

Groups component-level variant IDs (format: `componentId_variantId`) into a single
execution per component, and treats top-level variant IDs as page-level experiences.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `personalizeInfo` | `PersonalizeInfo` | The personalize info for the current route |
| `language` | `string` | The current page language |

#### Returns

`PersonalizeExecution`[]

The list of executions to run in parallel

***

### getSite()

> `protected` **getSite**(`event`): [`SiteInfo`](../type-aliases/SiteInfo.md)

Defined in: [packages/nuxt/src/middleware/middleware.ts:155](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/middleware.ts#L155)

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

Defined in: [packages/nuxt/src/middleware/personalize-middleware.ts:186](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/personalize-middleware.ts#L186)

Handles an incoming request and applies personalization if applicable.

Skips execution when:
- The middleware is globally disabled via config
- The request targets a static file, API route, or Nuxt internal route
- The request is a preview or prefetch
- No personalize service is configured
- No personalize info is found for the current route
- No variants are identified by the CDP

On success, rewrites `event.runtime!.node!.req.url` to the personalized path and sets
the `x-sc-rewrite` response header for downstream middleware.

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

### initPersonalizeServer()

> `protected` **initPersonalizeServer**(`params`): `Promise`\<`void`\>

Defined in: [packages/nuxt/src/middleware/personalize-middleware.ts:374](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/personalize-middleware.ts#L374)

Initializes the Sitecore Content SDK with analytics and personalize plugins
for the current request context.

This must be called before invoking `personalize()` on each request, as it
binds the analytics and personalize adapters to the current H3 event.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `params` | \{ `event`: `H3Event`; `hostname`: `string`; `siteName`: `string`; \} |  |
| `params.event` | `H3Event` | The incoming H3 event |
| `params.hostname` | `string` | The request hostname, used as the cookie domain |
| `params.siteName` | `string` | The resolved Sitecore site name |

#### Returns

`Promise`\<`void`\>

***

### isPrefetch()

> `protected` **isPrefetch**(`event`): `boolean`

Defined in: [packages/nuxt/src/middleware/middleware.ts:92](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/middleware.ts#L92)

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

Defined in: [packages/nuxt/src/middleware/middleware.ts:83](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/middleware.ts#L83)

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

### personalize()

> `protected` **personalize**(`params`): `Promise`\<\{ `variantId`: `string`; \}\>

Defined in: [packages/nuxt/src/middleware/personalize-middleware.ts:418](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/personalize-middleware.ts#L418)

Calls the CDP to identify the variant for a single experience.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `params` | \{ `friendlyId`: `string`; `geo?`: [`PersonalizeGeoData`](../type-aliases/PersonalizeGeoData.md); `language`: `string`; `params`: [`ExperienceParams`](../type-aliases/ExperienceParams.md); `timeout?`: `number`; `variantIds?`: `string`[]; \} |  |
| `params.friendlyId` | `string` | The CDP-friendly ID for the experience |
| `params.geo?` | [`PersonalizeGeoData`](../type-aliases/PersonalizeGeoData.md) | Optional geolocation data |
| `params.language` | `string` | The current page language |
| `params.params` | [`ExperienceParams`](../type-aliases/ExperienceParams.md) | The experience context params |
| `params.timeout?` | `number` | Optional timeout in milliseconds |
| `params.variantIds?` | `string`[] | The list of variant IDs to evaluate |

#### Returns

`Promise`\<\{ `variantId`: `string`; \}\>

The identified variant ID

***

### rewrite()

> `protected` **rewrite**(`rewritePath`, `event`, `skipHeader?`): `void`

Defined in: [packages/nuxt/src/middleware/middleware.ts:195](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/middleware.ts#L195)

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
