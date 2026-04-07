[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / UseSitecorePageResult

# Type Alias: UseSitecorePageResult

> **UseSitecorePageResult** = `object`

Defined in: [nuxt/src/composables/useSitecorePages.ts:12](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/0855a622b10e7f8f1a092bf930d8d53d3144a776/packages/nuxt/src/composables/useSitecorePages.ts#L12)

Return type of the useSitecorePage composable.

## Properties

### error

> **error**: `Ref`\<`NuxtError`\<`unknown`\> \| `undefined`\>

Defined in: [nuxt/src/composables/useSitecorePages.ts:20](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/0855a622b10e7f8f1a092bf930d8d53d3144a776/packages/nuxt/src/composables/useSitecorePages.ts#L20)

Error returned by useAsyncData, if any.

***

### page

> **page**: `Ref`\<`Page` \| `null` \| `undefined`\>

Defined in: [nuxt/src/composables/useSitecorePages.ts:16](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/0855a622b10e7f8f1a092bf930d8d53d3144a776/packages/nuxt/src/composables/useSitecorePages.ts#L16)

The page data returned from Sitecore, or null if not found.

***

### status

> **status**: `Ref`\<`"idle"` \| `"pending"` \| `"success"` \| `"error"`\>

Defined in: [nuxt/src/composables/useSitecorePages.ts:24](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/0855a622b10e7f8f1a092bf930d8d53d3144a776/packages/nuxt/src/composables/useSitecorePages.ts#L24)

Status of the async data fetch.
