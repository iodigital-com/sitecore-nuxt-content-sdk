[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / MiddlewareBaseConfig

# Type Alias: MiddlewareBaseConfig

> **MiddlewareBaseConfig** = `object`

Defined in: [nuxt/src/middleware/middleware.ts:31](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/dd9a23232a2cc3068e1c232b739c5e5e2eaaeb29/packages/nuxt/src/middleware/middleware.ts#L31)

The interface for the Middleware configuration

## Properties

### defaultHostname?

> `optional` **defaultHostname**: `string`

Defined in: [nuxt/src/middleware/middleware.ts:42](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/dd9a23232a2cc3068e1c232b739c5e5e2eaaeb29/packages/nuxt/src/middleware/middleware.ts#L42)

Fallback hostname in case `host` header is not present

#### Default

```ts
localhost
```

***

### defaultLanguage?

> `optional` **defaultLanguage**: `string`

Defined in: [nuxt/src/middleware/middleware.ts:48](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/dd9a23232a2cc3068e1c232b739c5e5e2eaaeb29/packages/nuxt/src/middleware/middleware.ts#L48)

Fallback language in locale cannot be extracted from request URL

#### Default

```ts
'en'
```

***

### sites

> **sites**: `SiteInfo`[]

Defined in: [nuxt/src/middleware/middleware.ts:53](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/dd9a23232a2cc3068e1c232b739c5e5e2eaaeb29/packages/nuxt/src/middleware/middleware.ts#L53)

Site resolution implementation by name/hostname

***

### skip()?

> `optional` **skip**: (`event`) => `boolean`

Defined in: [nuxt/src/middleware/middleware.ts:36](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/dd9a23232a2cc3068e1c232b739c5e5e2eaaeb29/packages/nuxt/src/middleware/middleware.ts#L36)

function, determines if the middleware execution should be skipped, based on cookie, header, or other considerations

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` | event object from middleware handler |

#### Returns

`boolean`
