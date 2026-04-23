[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / SitecoreClientInit

# Type Alias: SitecoreClientInit

> **SitecoreClientInit** = `Omit`\<`SitecoreConfig`, `"multisite"` \| `"redirects"` \| `"personalize"`\> & `object`

Defined in: packages/content/types/client/models.d.ts:11

Init options for Sitecore Client that allows you to override services too

## Type Declaration

### custom?

> `optional` **custom**: `object`

#### custom.componentService?

> `optional` **componentService**: [`ComponentLayoutService`](../classes/ComponentLayoutService.md)

#### custom.dictionaryService?

> `optional` **dictionaryService**: [`DictionaryService`](../classes/DictionaryService.md)

#### custom.editingService?

> `optional` **editingService**: `EditingService`

#### custom.errorPagesService?

> `optional` **errorPagesService**: [`ErrorPagesService`](../classes/ErrorPagesService.md)

#### custom.layoutService?

> `optional` **layoutService**: [`LayoutService`](../classes/LayoutService.md)

#### custom.sitePathService?

> `optional` **sitePathService**: [`SitePathService`](../classes/SitePathService.md)
