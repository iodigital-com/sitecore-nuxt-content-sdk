[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / PreviewMiddleware

# Class: PreviewMiddleware

Defined in: [nuxt/src/middleware/preview-middleware.ts:26](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/8e9953c2fff3c96cef6d4adca5dc120a512f0dfb/packages/nuxt/src/middleware/preview-middleware.ts#L26)

Middleware handler for bypassing cache in editing and preview mode.
Reads the preview cookie set by EditingRenderRoute and sets cache control
headers to prevent cached responses from being served to the Page Builder editor.
NOTE: This middleware has no dependencies on other proxies
and can run at any position in the middleware chain.

## Example

```ts
// server/middleware/05.preview.ts
import { PreviewMiddleware } from '@sitecore-content-sdk/nuxt/middleware';
import sites from '../../.sitecore/sites.json';

const middleware = new PreviewMiddleware({ sites });

export default defineEventHandler((event) => middleware.handle(event));
```

## Extends

- [`MiddlewareBase`](MiddlewareBase.md)

## Constructors

### Constructor

> **new PreviewMiddleware**(`config`): `PreviewMiddleware`

Defined in: [nuxt/src/middleware/preview-middleware.ts:30](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/8e9953c2fff3c96cef6d4adca5dc120a512f0dfb/packages/nuxt/src/middleware/preview-middleware.ts#L30)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `config` | [`MiddlewareBaseConfig`](../type-aliases/MiddlewareBaseConfig.md) | Preview middleware configuration |

#### Returns

`PreviewMiddleware`

#### Overrides

[`MiddlewareBase`](MiddlewareBase.md).[`constructor`](MiddlewareBase.md#constructor)

## Properties

### config

> `protected` **config**: [`MiddlewareBaseConfig`](../type-aliases/MiddlewareBaseConfig.md)

Defined in: [nuxt/src/middleware/preview-middleware.ts:30](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/8e9953c2fff3c96cef6d4adca5dc120a512f0dfb/packages/nuxt/src/middleware/preview-middleware.ts#L30)

Preview middleware configuration

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`config`](MiddlewareBase.md#config)

***

### defaultHostname

> `protected` **defaultHostname**: `string`

Defined in: [nuxt/src/middleware/middleware.ts:73](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/8e9953c2fff3c96cef6d4adca5dc120a512f0dfb/packages/nuxt/src/middleware/middleware.ts#L73)

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`defaultHostname`](MiddlewareBase.md#defaulthostname)

***

### siteResolver

> `protected` **siteResolver**: `SiteResolver`

Defined in: [nuxt/src/middleware/middleware.ts:74](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/8e9953c2fff3c96cef6d4adca5dc120a512f0dfb/packages/nuxt/src/middleware/middleware.ts#L74)

#### Inherited from

[`MiddlewareBase`](MiddlewareBase.md).[`siteResolver`](MiddlewareBase.md#siteresolver)

## Methods

### disabled()

> `protected` **disabled**(`event`): `boolean`

Defined in: [nuxt/src/middleware/middleware.ts:122](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/8e9953c2fff3c96cef6d4adca5dc120a512f0dfb/packages/nuxt/src/middleware/middleware.ts#L122)

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

> `protected` **getClientFactory**(`graphQLOptions`): `GraphQLRequestClientFactory`

Defined in: [nuxt/src/middleware/middleware.ts:205](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/8e9953c2fff3c96cef6d4adca5dc120a512f0dfb/packages/nuxt/src/middleware/middleware.ts#L205)

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

Defined in: [nuxt/src/middleware/middleware.ts:151](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/8e9953c2fff3c96cef6d4adca5dc120a512f0dfb/packages/nuxt/src/middleware/middleware.ts#L151)

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

Defined in: [nuxt/src/middleware/middleware.ts:138](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/8e9953c2fff3c96cef6d4adca5dc120a512f0dfb/packages/nuxt/src/middleware/middleware.ts#L138)

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

Defined in: [nuxt/src/middleware/middleware.ts:164](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/8e9953c2fff3c96cef6d4adca5dc120a512f0dfb/packages/nuxt/src/middleware/middleware.ts#L164)

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

### handle()

> **handle**(`event`): `Promise`\<`void`\>

Defined in: [nuxt/src/middleware/preview-middleware.ts:42](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/8e9953c2fff3c96cef6d4adca5dc120a512f0dfb/packages/nuxt/src/middleware/preview-middleware.ts#L42)

Handles an incoming request.
If the request is a preview request, bypasses the cache.
Errors are caught and logged, the request always continues.
@

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

Defined in: [nuxt/src/middleware/middleware.ts:99](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/8e9953c2fff3c96cef6d4adca5dc120a512f0dfb/packages/nuxt/src/middleware/middleware.ts#L99)

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

Defined in: [nuxt/src/middleware/middleware.ts:90](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/8e9953c2fff3c96cef6d4adca5dc120a512f0dfb/packages/nuxt/src/middleware/middleware.ts#L90)

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

Defined in: [nuxt/src/middleware/middleware.ts:191](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/8e9953c2fff3c96cef6d4adca5dc120a512f0dfb/packages/nuxt/src/middleware/middleware.ts#L191)

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
