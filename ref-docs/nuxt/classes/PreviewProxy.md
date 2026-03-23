[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / PreviewProxy

# Class: PreviewProxy

Defined in: [proxy/preview-proxy.ts:26](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/f585b36b7f1297cd5452a1dd44d8c7ad219f27dc/packages/nuxt/src/proxy/preview-proxy.ts#L26)

Proxy handler for bypassing cache in editing and preview mode.
Reads the preview cookie set by EditingRenderRoute and sets cache control
headers to prevent cached responses from being served to the Page Builder editor.
NOTE: This middleware has no dependencies on other proxies
and can run at any position in the middleware chain.

## Example

```ts
// server/middleware/05.preview.ts
import { PreviewProxy } from '@sitecore-content-sdk/nuxt/proxy';
import sites from '../../.sitecore/sites.json';

const proxy = new PreviewProxy({ sites });

export default defineEventHandler((event) => proxy.handle(event));
```

## Extends

- [`ProxyBase`](ProxyBase.md)

## Constructors

### Constructor

> **new PreviewProxy**(`config`): `PreviewProxy`

Defined in: [proxy/preview-proxy.ts:30](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/f585b36b7f1297cd5452a1dd44d8c7ad219f27dc/packages/nuxt/src/proxy/preview-proxy.ts#L30)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `config` | [`ProxyBaseConfig`](../type-aliases/ProxyBaseConfig.md) | Preview proxy configuration |

#### Returns

`PreviewProxy`

#### Overrides

[`ProxyBase`](ProxyBase.md).[`constructor`](ProxyBase.md#constructor)

## Properties

### config

> `protected` **config**: [`ProxyBaseConfig`](../type-aliases/ProxyBaseConfig.md)

Defined in: [proxy/preview-proxy.ts:30](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/f585b36b7f1297cd5452a1dd44d8c7ad219f27dc/packages/nuxt/src/proxy/preview-proxy.ts#L30)

Preview proxy configuration

#### Inherited from

[`ProxyBase`](ProxyBase.md).[`config`](ProxyBase.md#config)

***

### defaultHostname

> `protected` **defaultHostname**: `string`

Defined in: [proxy/proxy.ts:73](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/f585b36b7f1297cd5452a1dd44d8c7ad219f27dc/packages/nuxt/src/proxy/proxy.ts#L73)

#### Inherited from

[`ProxyBase`](ProxyBase.md).[`defaultHostname`](ProxyBase.md#defaulthostname)

***

### siteResolver

> `protected` **siteResolver**: `SiteResolver`

Defined in: [proxy/proxy.ts:74](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/f585b36b7f1297cd5452a1dd44d8c7ad219f27dc/packages/nuxt/src/proxy/proxy.ts#L74)

#### Inherited from

[`ProxyBase`](ProxyBase.md).[`siteResolver`](ProxyBase.md#siteresolver)

## Methods

### disabled()

> `protected` **disabled**(`event`): `boolean`

Defined in: [proxy/proxy.ts:122](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/f585b36b7f1297cd5452a1dd44d8c7ad219f27dc/packages/nuxt/src/proxy/proxy.ts#L122)

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

#### Inherited from

[`ProxyBase`](ProxyBase.md).[`disabled`](ProxyBase.md#disabled)

***

### getClientFactory()

> `protected` **getClientFactory**(`graphQLOptions`): `GraphQLRequestClientFactory`

Defined in: [proxy/proxy.ts:205](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/f585b36b7f1297cd5452a1dd44d8c7ad219f27dc/packages/nuxt/src/proxy/proxy.ts#L205)

Creates a new GraphQLRequestClientFactory instance

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `graphQLOptions` | `GraphQLClientOptions` | content sdk config |

#### Returns

`GraphQLRequestClientFactory`

GraphQLRequestClientFactory instance

#### Inherited from

[`ProxyBase`](ProxyBase.md).[`getClientFactory`](ProxyBase.md#getclientfactory)

***

### getHostHeader()

> `protected` **getHostHeader**(`event`): `string` \| `undefined`

Defined in: [proxy/proxy.ts:151](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/f585b36b7f1297cd5452a1dd44d8c7ad219f27dc/packages/nuxt/src/proxy/proxy.ts#L151)

Extract 'host' header.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` |  |

#### Returns

`string` \| `undefined`

The host header, `undefined` will be returned instead of the default value when unavailable

#### Inherited from

[`ProxyBase`](ProxyBase.md).[`getHostHeader`](ProxyBase.md#gethostheader)

***

### getLanguage()

> `protected` **getLanguage**(`event`): `string`

Defined in: [proxy/proxy.ts:138](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/f585b36b7f1297cd5452a1dd44d8c7ad219f27dc/packages/nuxt/src/proxy/proxy.ts#L138)

Provides used language

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` |  |

#### Returns

`string`

language

#### Inherited from

[`ProxyBase`](ProxyBase.md).[`getLanguage`](ProxyBase.md#getlanguage)

***

### getSite()

> `protected` **getSite**(`event`): `SiteInfo`

Defined in: [proxy/proxy.ts:164](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/f585b36b7f1297cd5452a1dd44d8c7ad219f27dc/packages/nuxt/src/proxy/proxy.ts#L164)

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

[`ProxyBase`](ProxyBase.md).[`getSite`](ProxyBase.md#getsite)

***

### handle()

> **handle**(`event`): `Promise`\<`void`\>

Defined in: [proxy/preview-proxy.ts:42](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/f585b36b7f1297cd5452a1dd44d8c7ad219f27dc/packages/nuxt/src/proxy/preview-proxy.ts#L42)

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

[`ProxyBase`](ProxyBase.md).[`handle`](ProxyBase.md#handle)

***

### isPrefetch()

> `protected` **isPrefetch**(`event`): `boolean`

Defined in: [proxy/proxy.ts:99](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/f585b36b7f1297cd5452a1dd44d8c7ad219f27dc/packages/nuxt/src/proxy/proxy.ts#L99)

Determines if the request is a Nuxt prefetch request

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` |  |

#### Returns

`boolean`

is prefetch

#### Inherited from

[`ProxyBase`](ProxyBase.md).[`isPrefetch`](ProxyBase.md#isprefetch)

***

### isPreview()

> `protected` **isPreview**(`event`): `boolean`

Defined in: [proxy/proxy.ts:90](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/f585b36b7f1297cd5452a1dd44d8c7ad219f27dc/packages/nuxt/src/proxy/proxy.ts#L90)

Determines if mode is preview

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` |  |

#### Returns

`boolean`

is preview

#### Inherited from

[`ProxyBase`](ProxyBase.md).[`isPreview`](ProxyBase.md#ispreview)

***

### rewrite()

> `protected` **rewrite**(`rewritePath`, `event`, `skipHeader?`): `void`

Defined in: [proxy/proxy.ts:191](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/f585b36b7f1297cd5452a1dd44d8c7ad219f27dc/packages/nuxt/src/proxy/proxy.ts#L191)

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

[`ProxyBase`](ProxyBase.md).[`rewrite`](ProxyBase.md#rewrite)
