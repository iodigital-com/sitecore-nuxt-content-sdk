[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / MiddlewareBaseConfig

# Type Alias: MiddlewareBaseConfig

> **MiddlewareBaseConfig** = `object`

Defined in: [packages/nuxt/src/middleware/middleware.ts:24](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/middleware.ts#L24)

The interface for the Middleware configuration

## Properties

### defaultHostname?

> `optional` **defaultHostname**: `string`

Defined in: [packages/nuxt/src/middleware/middleware.ts:35](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/middleware.ts#L35)

Fallback hostname in case `host` header is not present

#### Default

```ts
localhost
```

***

### defaultLanguage?

> `optional` **defaultLanguage**: `string`

Defined in: [packages/nuxt/src/middleware/middleware.ts:41](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/middleware.ts#L41)

Fallback language in locale cannot be extracted from request URL

#### Default

```ts
'en'
```

***

### sites

> **sites**: [`SiteInfo`](SiteInfo.md)[]

Defined in: [packages/nuxt/src/middleware/middleware.ts:46](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/middleware.ts#L46)

Site resolution implementation by name/hostname

***

### skip()?

> `optional` **skip**: (`event`) => `boolean`

Defined in: [packages/nuxt/src/middleware/middleware.ts:29](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/d70e3f78edb5d654a3c5779bdb880ed2da0dfa5c/packages/nuxt/src/middleware/middleware.ts#L29)

function, determines if the middleware execution should be skipped, based on cookie, header, or other considerations

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` | event object from middleware handler |

#### Returns

`boolean`
