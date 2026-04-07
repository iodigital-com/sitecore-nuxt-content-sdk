[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / SitecoreClientInit

# Type Alias: SitecoreClientInit

> **SitecoreClientInit** = `Omit`\<`SitecoreConfig`, `"multisite"` \| `"redirects"` \| `"personalize"`\> & `object`

Defined in: content/types/client/models.d.ts:11

Init options for Sitecore Client that allows you to override services too

## Type Declaration

### custom?

> `optional` **custom**: `object`

#### custom.componentService?

> `optional` **componentService**: `ComponentLayoutService`

#### custom.dictionaryService?

> `optional` **dictionaryService**: `DictionaryService`

#### custom.editingService?

> `optional` **editingService**: `EditingService`

#### custom.errorPagesService?

> `optional` **errorPagesService**: `ErrorPagesService`

#### custom.layoutService?

> `optional` **layoutService**: `LayoutService`

#### custom.sitePathService?

> `optional` **sitePathService**: `SitePathService`
