[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / SitecoreConfigInput

# Type Alias: SitecoreConfigInput

> **SitecoreConfigInput** = `SitecoreConfigInputCore` & `object`

Defined in: [packages/nuxt/src/config/define-config.ts:57](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/f9df27f3b8d16cd24df156046de00eadab843a8d/packages/nuxt/src/config/define-config.ts#L57)

Type to be used as config input in sitecore.config

## Type Declaration

### sitecoreInternalEditingHostUrl?

> `optional` **sitecoreInternalEditingHostUrl**: `string`

The internal host URL for the Nuxt application, used for server-side requests for page rendering during editing.
This should be the base URL where the Nuxt app is accessible from the server side (e.g., "http://localhost:3000").
