[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / BotTrackingMiddleware

# Class: BotTrackingMiddleware

Defined in: [packages/nuxt/src/middleware/bot-tracking-middleware.ts:35](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/7a1e7de41f189807cf81c37cfd6c2421fef22a67/packages/nuxt/src/middleware/bot-tracking-middleware.ts#L35)

Nuxt server middleware that detects bots and tracks their page views via Sitecore Analytics.

Run first in the middleware chain to ensure the bot detection cookie is set
before other middlewares execute.

## Example

```ts
// server/middleware/bot-tracking.ts
import { BotTrackingMiddleware } from '@sitecore-content-sdk/nuxt/middleware';

const middleware = new BotTrackingMiddleware({
  contextId: process.env.SITECORE_EDGE_CONTEXT_ID,
  edgeUrl: process.env.SITECORE_EDGE_URL,
  sites: config.sites,
});

export default defineEventHandler((event) => middleware.handle(event));
```

## Extends

- [`MiddlewareBase`](MiddlewareBase.md)

## Constructors

### Constructor

> **new BotTrackingMiddleware**(`config`): `BotTrackingMiddleware`

Defined in: [packages/nuxt/src/middleware/bot-tracking-middleware.ts:39](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/7a1e7de41f189807cf81c37cfd6c2421fef22a67/packages/nuxt/src/middleware/bot-tracking-middleware.ts#L39)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `config` | [`BotTrackingMiddlewareConfig`](../type-aliases/BotTrackingMiddlewareConfig.md) | Bot tracking middleware configuration. |

#### Returns

`BotTrackingMiddleware`

#### Overrides

[`MiddlewareBase`](MiddlewareBase.md).[`constructor`](MiddlewareBase.md#constructor)

## Properties

### config

> `protected` **config**: [`BotTrackingMiddlewareConfig`](../type-aliases/BotTrackingMiddlewareConfig.md)

Defined in: [packages/nuxt/src/middleware/bot-tracking-middleware.ts:39](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/7a1e7de41f189807cf81c37cfd6c2421fef22a67/packages/nuxt/src/middleware/bot-tracking-middleware.ts#L39)

Bot tracking middleware configuration.

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`config`](MiddlewareBase.md#config)

***

### defaultHostname

> `protected` **defaultHostname**: `string`

Defined in: [packages/nuxt/src/middleware/middleware.ts:73](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/7a1e7de41f189807cf81c37cfd6c2421fef22a67/packages/nuxt/src/middleware/middleware.ts#L73)

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`defaultHostname`](MiddlewareBase.md#defaulthostname)

***

### siteResolver

> `protected` **siteResolver**: [`SiteResolver`](SiteResolver.md)

Defined in: [packages/nuxt/src/middleware/middleware.ts:74](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/7a1e7de41f189807cf81c37cfd6c2421fef22a67/packages/nuxt/src/middleware/middleware.ts#L74)

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`siteResolver`](MiddlewareBase.md#siteresolver)

## Methods

### disabled()

> `protected` **disabled**(`event`): `boolean`

Defined in: [packages/nuxt/src/middleware/middleware.ts:122](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/7a1e7de41f189807cf81c37cfd6c2421fef22a67/packages/nuxt/src/middleware/middleware.ts#L122)

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

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`disabled`](MiddlewareBase.md#disabled)

***

### getClientFactory()

> `protected` **getClientFactory**(`graphQLOptions`): [`GraphQLRequestClientFactory`](../type-aliases/GraphQLRequestClientFactory.md)

Defined in: [packages/nuxt/src/middleware/middleware.ts:218](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/7a1e7de41f189807cf81c37cfd6c2421fef22a67/packages/nuxt/src/middleware/middleware.ts#L218)

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

Defined in: [packages/nuxt/src/middleware/middleware.ts:151](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/7a1e7de41f189807cf81c37cfd6c2421fef22a67/packages/nuxt/src/middleware/middleware.ts#L151)

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

Defined in: [packages/nuxt/src/middleware/middleware.ts:138](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/7a1e7de41f189807cf81c37cfd6c2421fef22a67/packages/nuxt/src/middleware/middleware.ts#L138)

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

Defined in: [packages/nuxt/src/middleware/middleware.ts:164](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/7a1e7de41f189807cf81c37cfd6c2421fef22a67/packages/nuxt/src/middleware/middleware.ts#L164)

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

Defined in: [packages/nuxt/src/middleware/bot-tracking-middleware.ts:59](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/7a1e7de41f189807cf81c37cfd6c2421fef22a67/packages/nuxt/src/middleware/bot-tracking-middleware.ts#L59)

Handles an incoming request and applies bot tracking if applicable.

Skips execution when:
- The middleware is disabled via config
- The request is a preview
- The environment is local or dev (unless `SITECORE_ENABLE_BOT_TRACKING=true`)
- The request has no `user-agent` header
- The user-agent does not match a known bot
- The request is a prefetch

On success, sets the bot detection cookie and tracks the page view via `botPageView()`.
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

Defined in: [packages/nuxt/src/middleware/middleware.ts:99](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/7a1e7de41f189807cf81c37cfd6c2421fef22a67/packages/nuxt/src/middleware/middleware.ts#L99)

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

Defined in: [packages/nuxt/src/middleware/middleware.ts:90](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/7a1e7de41f189807cf81c37cfd6c2421fef22a67/packages/nuxt/src/middleware/middleware.ts#L90)

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

Defined in: [packages/nuxt/src/middleware/middleware.ts:204](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/7a1e7de41f189807cf81c37cfd6c2421fef22a67/packages/nuxt/src/middleware/middleware.ts#L204)

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

### shouldSkipForLocalEnvironment()

> `protected` **shouldSkipForLocalEnvironment**(`event`): `boolean`

Defined in: [packages/nuxt/src/middleware/bot-tracking-middleware.ts:145](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/7a1e7de41f189807cf81c37cfd6c2421fef22a67/packages/nuxt/src/middleware/bot-tracking-middleware.ts#L145)

**`Internal`**

Returns `true` when bot tracking should be skipped for a local or development environment.

Can be overridden by setting `SITECORE_ENABLE_BOT_TRACKING=true`, which forces
bot tracking to run even in local environments.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` | The incoming H3 event |

#### Returns

`boolean`

`true` if the environment is local or dev
