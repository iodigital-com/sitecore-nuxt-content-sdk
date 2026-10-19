[**@iodigital-com/sitecore-content-sdk-nuxt**](../README.md)

***

[@iodigital-com/sitecore-content-sdk-nuxt](../README.md) / RedirectsServiceConfig

# Type Alias: RedirectsServiceConfig

> **RedirectsServiceConfig** = [`CacheOptions`](../interfaces/CacheOptions.md) & `object`

Defined in: @sitecore-content-sdk/content/types/site/redirects-service.d.ts:33

Configuration for

## Type Declaration

### clientFactory

> **clientFactory**: [`GraphQLRequestClientFactory`](GraphQLRequestClientFactory.md)

A GraphQL Request Client Factory is a function that accepts configuration and returns an instance of a GraphQLRequestClient.
This factory function is used to create and configure GraphQL clients for making GraphQL API requests.

### fetch?

> `optional` **fetch**: *typeof* `fetch`

Override fetch method. Uses 'GraphQLRequestClient' default otherwise.

## See

RedirectsService instances
