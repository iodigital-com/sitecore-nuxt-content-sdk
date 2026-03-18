[**@sitecore-content-sdk/nuxt**](../../README.md)

***

[@sitecore-content-sdk/nuxt](../../README.md) / [index](../README.md) / ProxyBaseConfig

# Type Alias: ProxyBaseConfig

> **ProxyBaseConfig** = `object`

Defined in: [proxy/proxy.ts:24](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/86302afb70ca4607e38cac72430521ce1db7fe2c/packages/nuxt/src/proxy/proxy.ts#L24)

The interface for the Proxy configuration

## Properties

### defaultHostname?

> `optional` **defaultHostname**: `string`

Defined in: [proxy/proxy.ts:35](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/86302afb70ca4607e38cac72430521ce1db7fe2c/packages/nuxt/src/proxy/proxy.ts#L35)

Fallback hostname in case `host` header is not present

#### Default

```ts
localhost
```

***

### defaultLanguage?

> `optional` **defaultLanguage**: `string`

Defined in: [proxy/proxy.ts:41](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/86302afb70ca4607e38cac72430521ce1db7fe2c/packages/nuxt/src/proxy/proxy.ts#L41)

Fallback language in locale cannot be extracted from request URL

#### Default

```ts
'en'
```

***

### sites

> **sites**: `SiteInfo`[]

Defined in: [proxy/proxy.ts:46](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/86302afb70ca4607e38cac72430521ce1db7fe2c/packages/nuxt/src/proxy/proxy.ts#L46)

Site resolution implementation by name/hostname

***

### skip()?

> `optional` **skip**: (`event`) => `boolean`

Defined in: [proxy/proxy.ts:29](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/86302afb70ca4607e38cac72430521ce1db7fe2c/packages/nuxt/src/proxy/proxy.ts#L29)

function, determines if the proxy execution should be skipped, based on cookie, header, or other considerations

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` | event object from proxy handler |

#### Returns

`boolean`
