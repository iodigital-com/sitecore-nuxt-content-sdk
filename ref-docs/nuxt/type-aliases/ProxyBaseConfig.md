[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / ProxyBaseConfig

# Type Alias: ProxyBaseConfig

> **ProxyBaseConfig** = `object`

Defined in: [proxy/proxy.ts:31](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/cbeed6fb90db4605b6095a61687601d54c102027/packages/nuxt/src/proxy/proxy.ts#L31)

The interface for the Proxy configuration

## Properties

### defaultHostname?

> `optional` **defaultHostname**: `string`

Defined in: [proxy/proxy.ts:42](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/cbeed6fb90db4605b6095a61687601d54c102027/packages/nuxt/src/proxy/proxy.ts#L42)

Fallback hostname in case `host` header is not present

#### Default

```ts
localhost
```

***

### defaultLanguage?

> `optional` **defaultLanguage**: `string`

Defined in: [proxy/proxy.ts:48](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/cbeed6fb90db4605b6095a61687601d54c102027/packages/nuxt/src/proxy/proxy.ts#L48)

Fallback language in locale cannot be extracted from request URL

#### Default

```ts
'en'
```

***

### sites

> **sites**: `SiteInfo`[]

Defined in: [proxy/proxy.ts:53](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/cbeed6fb90db4605b6095a61687601d54c102027/packages/nuxt/src/proxy/proxy.ts#L53)

Site resolution implementation by name/hostname

***

### skip()?

> `optional` **skip**: (`event`) => `boolean`

Defined in: [proxy/proxy.ts:36](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/cbeed6fb90db4605b6095a61687601d54c102027/packages/nuxt/src/proxy/proxy.ts#L36)

function, determines if the proxy execution should be skipped, based on cookie, header, or other considerations

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` | event object from proxy handler |

#### Returns

`boolean`
