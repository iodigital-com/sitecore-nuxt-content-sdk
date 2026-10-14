[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / SitecoreClient

# Class: SitecoreClient

Defined in: [packages/nuxt/src/client/sitecore-nuxt-client.ts:38](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/506c0785c8d8cee7fc34f92cd6f25e430868b713/packages/nuxt/src/client/sitecore-nuxt-client.ts#L38)

Nuxt-specific extension of SitecoreClient.

Adds path normalization for multisite and personalization rewrites that are
applied by the Nuxt server middleware chain. When a request passes through
`MultisiteMiddleware` and `PersonalizeMiddleware`, the URL is rewritten to
include site and variant segments. `parsePath` strips those segments before
passing the path to Sitecore.

## Example

```ts
// sitecore-client.ts
import { SitecoreNuxtClient } from '@sitecore-content-sdk/nuxt';
import scConfig from './sitecore.config';

const client = new SitecoreNuxtClient(scConfig);
export default client;
@public
```

## Extends

- `SitecoreClient`

## Constructors

### Constructor

> **new SitecoreClient**(`initOptions`): `SitecoreNuxtClient`

Defined in: [packages/nuxt/src/client/sitecore-nuxt-client.ts:42](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/506c0785c8d8cee7fc34f92cd6f25e430868b713/packages/nuxt/src/client/sitecore-nuxt-client.ts#L42)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `initOptions` | `SitecoreNuxtClientInit` | Nuxt client configuration |

#### Returns

`SitecoreNuxtClient`

#### Overrides

`SitecoreClient.constructor`

## Properties

### clientFactory

> `protected` **clientFactory**: [`GraphQLRequestClientFactory`](../type-aliases/GraphQLRequestClientFactory.md)

Defined in: @sitecore-content-sdk/content/types/client/sitecore-client.d.ts:211

#### Inherited from

`SitecoreClient.clientFactory`

***

### componentService

> `protected` **componentService**: `ComponentLayoutService`

Defined in: @sitecore-content-sdk/content/types/client/sitecore-client.d.ts:213

#### Inherited from

`SitecoreClient.componentService`

***

### dictionaryService

> `protected` **dictionaryService**: [`DictionaryService`](DictionaryService.md)

Defined in: @sitecore-content-sdk/content/types/client/sitecore-client.d.ts:209

#### Inherited from

`SitecoreClient.dictionaryService`

***

### editingService

> `protected` **editingService**: `EditingService`

Defined in: @sitecore-content-sdk/content/types/client/sitecore-client.d.ts:210

#### Inherited from

`SitecoreClient.editingService`

***

### errorPagesService

> `protected` **errorPagesService**: [`ErrorPagesService`](ErrorPagesService.md)

Defined in: @sitecore-content-sdk/content/types/client/sitecore-client.d.ts:212

#### Inherited from

`SitecoreClient.errorPagesService`

***

### graphQLClient

> `protected` **graphQLClient**: `GraphQLClient`

Defined in: @sitecore-content-sdk/content/types/client/sitecore-client.d.ts:215

#### Inherited from

`SitecoreClient.graphQLClient`

***

### initOptions

> `protected` **initOptions**: `SitecoreNuxtClientInit`

Defined in: [packages/nuxt/src/client/sitecore-nuxt-client.ts:42](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/506c0785c8d8cee7fc34f92cd6f25e430868b713/packages/nuxt/src/client/sitecore-nuxt-client.ts#L42)

Nuxt client configuration

#### Inherited from

`SitecoreClient.initOptions`

***

### layoutService

> `protected` **layoutService**: [`LayoutService`](LayoutService.md)

Defined in: @sitecore-content-sdk/content/types/client/sitecore-client.d.ts:208

#### Inherited from

`SitecoreClient.layoutService`

***

### sitePathService

> `protected` **sitePathService**: [`SitePathService`](SitePathService.md)

Defined in: @sitecore-content-sdk/content/types/client/sitecore-client.d.ts:214

#### Inherited from

`SitecoreClient.sitePathService`

## Methods

### applyContentRewrite()

> `protected` **applyContentRewrite**(`layout`): [`LayoutServiceData`](../interfaces/LayoutServiceData.md)

Defined in: @sitecore-content-sdk/content/types/client/sitecore-client.d.ts:335

**`Internal`**

Applies media URL rewrite when rewriteMediaUrls is enabled.
When true, uses default Edge host rewriter; when a function, transforms each string.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `layout` | [`LayoutServiceData`](../interfaces/LayoutServiceData.md) | Layout data from layout/editing/component/error service |

#### Returns

[`LayoutServiceData`](../interfaces/LayoutServiceData.md)

Rewritten layout (or same reference if rewrite disabled)

#### Inherited from

`SitecoreClient.applyContentRewrite`

***

### getBaseServiceOptions()

> `protected` **getBaseServiceOptions**(): `BaseServiceOptions`

Defined in: @sitecore-content-sdk/content/types/client/sitecore-client.d.ts:321

#### Returns

`BaseServiceOptions`

#### Inherited from

`SitecoreClient.getBaseServiceOptions`

***

### getData()

> **getData**\<`T`\>(`query`, `variables?`, `fetchOptions?`): `Promise`\<`T`\>

Defined in: @sitecore-content-sdk/content/types/client/sitecore-client.d.ts:234

Execute a raw GraphQL request using the client's configured GraphQL Edge endpoint.
This is a thin pass-through to the underlying `GraphQLClient.request` method,

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `query` | `string` \| `DocumentNode` | GraphQL query |
| `variables?` | `Record`\<`string`, `unknown`\> | Optional variables bag |
| `fetchOptions?` | `FetchOptions` | Optional fetch overrides (e.g. fetch, headers) |

#### Returns

`Promise`\<`T`\>

#### Inherited from

`SitecoreClient.getData`

***

### getDesignLibraryData()

> **getDesignLibraryData**(`designLibData`, `fetchOptions?`): `Promise`\<[`Page`](../type-aliases/Page.md)\>

Defined in: @sitecore-content-sdk/content/types/client/sitecore-client.d.ts:282

Get design library page details for Design Library mode of your app

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `designLibData` | `DesignLibraryRenderPreviewData` | preview data set in 'library' mode of the app |
| `fetchOptions?` | `FetchOptions` | Additional fetch fetch options to override GraphQL requests |

#### Returns

`Promise`\<[`Page`](../type-aliases/Page.md)\>

preview page for Design Library

#### Inherited from

`SitecoreClient.getDesignLibraryData`

***

### getDictionary()

> **getDictionary**(`routeOptions?`, `fetchOptions?`): `Promise`\<[`DictionaryPhrases`](../interfaces/DictionaryPhrases.md)\>

Defined in: @sitecore-content-sdk/content/types/client/sitecore-client.d.ts:261

Retrieves dictionary phrases for a given site and locale.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `routeOptions?` | `Partial`\<`RouteOptions`\> | Route options containing language and site name to load dictionary for |
| `fetchOptions?` | `FetchOptions` | Additional fetch fetch options to override GraphQL requests |

#### Returns

`Promise`\<[`DictionaryPhrases`](../interfaces/DictionaryPhrases.md)\>

A promise that resolves to the dictionary phrases.

#### Inherited from

`SitecoreClient.getDictionary`

***

### getErrorPage()

> **getErrorPage**(`code`, `pageOptions?`, `fetchOptions?`): `Promise`\<[`Page`](../type-aliases/Page.md) \| `null`\>

Defined in: @sitecore-content-sdk/content/types/client/sitecore-client.d.ts:290

Get error page details for a given error code

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `code` | [`ErrorPage`](../enumerations/ErrorPage.md) | The error code to get the error page for |
| `pageOptions?` | `Partial`\<`RouteOptions`\> | The page options to get the error page for |
| `fetchOptions?` | `FetchOptions` | Additional fetch fetch options to override GraphQL requests |

#### Returns

`Promise`\<[`Page`](../type-aliases/Page.md) \| `null`\>

A promise that resolves to the error page details or null if not found

#### Inherited from

`SitecoreClient.getErrorPage`

***

### getErrorPages()

> **getErrorPages**(`routeOptions?`, `fetchOptions?`): `Promise`\<[`ErrorPages`](../type-aliases/ErrorPages.md) \| `null`\>

Defined in: @sitecore-content-sdk/content/types/client/sitecore-client.d.ts:268

Retrieves error pages for a given site and locale.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `routeOptions?` | `RouteOptions` | Route options containing language and site name to load error pages |
| `fetchOptions?` | `FetchOptions` | Additional fetch fetch options to override GraphQL requests |

#### Returns

`Promise`\<[`ErrorPages`](../type-aliases/ErrorPages.md) \| `null`\>

A promise that resolves to the error pages or null if not found.

#### Inherited from

`SitecoreClient.getErrorPages`

***

### getGraphqlSitemapXMLService()

> `protected` **getGraphqlSitemapXMLService**(`siteName`): [`SitemapXmlService`](SitemapXmlService.md)

Defined in: @sitecore-content-sdk/content/types/client/sitecore-client.d.ts:319

Factory methods for creating dependencies
Subclasses can override these to provide custom implementations.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `siteName` | `string` |

#### Returns

[`SitemapXmlService`](SitemapXmlService.md)

#### Inherited from

`SitecoreClient.getGraphqlSitemapXMLService`

***

### getHeadLinks()

> **getHeadLinks**(`layoutData`, `options?`): [`HTMLLink`](../type-aliases/HTMLLink.md)[]

Defined in: @sitecore-content-sdk/content/types/client/sitecore-client.d.ts:251

Retrieves the head `<link>` elements for Sitecore styles and themes.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `layoutData` | [`LayoutServiceData`](../interfaces/LayoutServiceData.md) | The layout data containing styles and themes. |
| `options?` | \{ `enableStyles?`: `boolean`; `enableThemes?`: `boolean`; \} | Optional configuration for enabling styles and themes. |
| `options.enableStyles?` | `boolean` | Whether to include content styles. |
| `options.enableThemes?` | `boolean` | Whether to include theme styles. |

#### Returns

[`HTMLLink`](../type-aliases/HTMLLink.md)[]

An array of `<link>` elements for stylesheets.

#### Inherited from

`SitecoreClient.getHeadLinks`

***

### getPage()

> **getPage**(`path`, `pageOptions?`, `fetchOptions?`): `Promise`\<[`Page`](../type-aliases/Page.md) \| `null`\>

Defined in: [packages/nuxt/src/client/sitecore-nuxt-client.ts:82](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/506c0785c8d8cee7fc34f92cd6f25e430868b713/packages/nuxt/src/client/sitecore-nuxt-client.ts#L82)

Fetches page layout data for the given route path.

Automatically resolves the site name and personalization variant data
from the rewritten path before calling Sitecore.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` \| `string`[] | The route path from the Nuxt slug params |
| `pageOptions?` | `PageOptions` | Optional overrides for site, locale and personalization |
| `fetchOptions?` | `FetchOptions` | Optional fetch overrides |

#### Returns

`Promise`\<[`Page`](../type-aliases/Page.md) \| `null`\>

The page data, or null if the route is not found

#### Overrides

`SitecoreClient.getPage`

***

### getPagePaths()

> **getPagePaths**(`sites`, `languages?`, `fetchOptions?`): `Promise`\<[`StaticPath`](../type-aliases/StaticPath.md)[]\>

Defined in: @sitecore-content-sdk/content/types/client/sitecore-client.d.ts:298

Retrieves the static paths for pages based on the given languages.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `sites` | `string`[] | An array of site names to fetch routes for. |
| `languages?` | `string`[] | An optional array of language codes to generate paths for. |
| `fetchOptions?` | `FetchOptions` | Additional fetch options. |

#### Returns

`Promise`\<[`StaticPath`](../type-aliases/StaticPath.md)[]\>

A promise that resolves to an array of static paths.

#### Inherited from

`SitecoreClient.getPagePaths`

***

### getPreview()

> **getPreview**(`previewData`, `fetchOptions?`): `Promise`\<[`Page`](../type-aliases/Page.md) \| `null`\>

Defined in: @sitecore-content-sdk/content/types/client/sitecore-client.d.ts:275

Retrieves preview page and layout details

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `previewData` | `EditingPreviewData` \| `undefined` | The editing preview data for metadata mode. |
| `fetchOptions?` | `FetchOptions` | Additional fetch fetch options to override GraphQL requests |

#### Returns

`Promise`\<[`Page`](../type-aliases/Page.md) \| `null`\>

preview page details

#### Inherited from

`SitecoreClient.getPreview`

***

### getRobots()

> **getRobots**(`siteName`, `fetchOptions?`): `Promise`\<`string` \| `null`\>

Defined in: @sitecore-content-sdk/content/types/client/sitecore-client.d.ts:314

Retrieves the robots.txt content for a given site name.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `siteName` | `string` | The name of the site to retrieve the robots.txt for. |
| `fetchOptions?` | `FetchOptions` | Optional fetch options. |

#### Returns

`Promise`\<`string` \| `null`\>

A promise that resolves to the robots.txt content,
or null if no content is found.

#### Inherited from

`SitecoreClient.getRobots`

***

### getRobotsService()

> `protected` **getRobotsService**(`siteName`): [`RobotsService`](RobotsService.md)

Defined in: @sitecore-content-sdk/content/types/client/sitecore-client.d.ts:320

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `siteName` | `string` |

#### Returns

[`RobotsService`](RobotsService.md)

#### Inherited from

`SitecoreClient.getRobotsService`

***

### getSiteMap()

> **getSiteMap**(`reqOptions`, `fetchOptions?`): `Promise`\<`string`\>

Defined in: @sitecore-content-sdk/content/types/client/sitecore-client.d.ts:306

Retrieves sitemap XML content - either a specific sitemap or the index of all sitemaps.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `reqOptions` | `SitemapXmlOptions` | Options for sitemap retrieval |
| `fetchOptions?` | `FetchOptions` | Additional fetch options. |

#### Returns

`Promise`\<`string`\>

Promise resolving to the sitemap XML content as string

#### Throws

Throws 'REDIRECT_404' if requested sitemap is not found

#### Inherited from

`SitecoreClient.getSiteMap`

***

### getSiteNameFromPath()

> **getSiteNameFromPath**(`path`): `string`

Defined in: [packages/nuxt/src/client/sitecore-nuxt-client.ts:53](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/506c0785c8d8cee7fc34f92cd6f25e430868b713/packages/nuxt/src/client/sitecore-nuxt-client.ts#L53)

Resolves the site name from a rewritten path.
The `MultisiteMiddleware` rewrites paths to include the site segment (e.g. `/mysite/about`).
This method extracts the site name from that segment.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` \| `string`[] | The rewritten path from the Nuxt route |

#### Returns

`string`

The resolved site name, or the default site if not found

***

### parsePath()

> **parsePath**(`path`): `string`

Defined in: [packages/nuxt/src/client/sitecore-nuxt-client.ts:67](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/506c0785c8d8cee7fc34f92cd6f25e430868b713/packages/nuxt/src/client/sitecore-nuxt-client.ts#L67)

Normalizes a Nuxt route path by stripping multisite and personalization
rewrite segments added by the middleware chain.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` \| `string`[] | The raw path from the Nuxt route params |

#### Returns

`string`

The normalized path ready for Sitecore

#### Example

```ts
// '/mysite/_variantId_variant-1/about' → '/about'
```

#### Overrides

`SitecoreClient.parsePath`
