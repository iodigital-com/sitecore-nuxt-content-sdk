[**@iodigital-com/sitecore-content-sdk-nuxt**](../README.md)

***

[@iodigital-com/sitecore-content-sdk-nuxt](../README.md) / SiteInfoService

# Class: SiteInfoService

Defined in: @sitecore-content-sdk/content/types/site/siteinfo-service.d.ts:35

Service to fetch site information

## Constructors

### Constructor

> **new SiteInfoService**(`config`): `SiteInfoService`

Defined in: @sitecore-content-sdk/content/types/site/siteinfo-service.d.ts:43

Creates an instance of graphQL service to retrieve site configuration list from Sitecore

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `config` | [`SiteInfoServiceConfig`](../type-aliases/SiteInfoServiceConfig.md) | instance |

#### Returns

`SiteInfoService`

## Accessors

### siteQuery

#### Get Signature

> **get** `protected` **siteQuery**(): `string`

Defined in: @sitecore-content-sdk/content/types/site/siteinfo-service.d.ts:47

site query is available on XM Cloud and XP 10.4+

##### Returns

`string`

## Methods

### fetchSiteInfo()

> **fetchSiteInfo**(`fetchOptions?`): `Promise`\<[`SiteInfo`](../type-aliases/SiteInfo.md)[]\>

Defined in: @sitecore-content-sdk/content/types/site/siteinfo-service.d.ts:48

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `fetchOptions?` | `FetchOptions` |

#### Returns

`Promise`\<[`SiteInfo`](../type-aliases/SiteInfo.md)[]\>

***

### getCacheClient()

> `protected` **getCacheClient**(): [`CacheClient`](../interfaces/CacheClient.md)\<[`SiteInfo`](../type-aliases/SiteInfo.md)[]\>

Defined in: @sitecore-content-sdk/content/types/site/siteinfo-service.d.ts:54

Gets cache client implementation
Override this method if custom cache needs to be used

#### Returns

[`CacheClient`](../interfaces/CacheClient.md)\<[`SiteInfo`](../type-aliases/SiteInfo.md)[]\>

CacheClient instance

***

### getGraphQLClient()

> `protected` **getGraphQLClient**(): `GraphQLClient`

Defined in: @sitecore-content-sdk/content/types/site/siteinfo-service.d.ts:61

Gets a GraphQL client that can make requests to the API. Uses graphql-request as the default
library for fetching graphql data (@see GraphQLRequestClient). Override this method if you
want to use something else.

#### Returns

`GraphQLClient`

implementation
