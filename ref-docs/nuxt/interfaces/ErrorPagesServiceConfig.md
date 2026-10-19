[**@iodigital-com/sitecore-content-sdk-nuxt**](../README.md)

***

[@iodigital-com/sitecore-content-sdk-nuxt](../README.md) / ErrorPagesServiceConfig

# Interface: ErrorPagesServiceConfig

Defined in: @sitecore-content-sdk/content/types/site/error-pages-service.d.ts:9

Configuration for

## See

ErrorPagesService instances

## Extends

- `GraphQLServiceConfig`

## Properties

### clientFactory

> **clientFactory**: [`GraphQLRequestClientFactory`](../type-aliases/GraphQLRequestClientFactory.md)

Defined in: @sitecore-content-sdk/content/types/site/error-pages-service.d.ts:18

A GraphQL Request Client Factory is a function that accepts configuration and returns an instance of a GraphQLRequestClient.
This factory function is used to create and configure GraphQL clients for making GraphQL API requests.

#### Overrides

`GraphQLServiceConfig.clientFactory`

***

### debugger?

> `optional` **debugger**: `any`

Defined in: @sitecore-content-sdk/content/types/sitecore-service-base.d.ts:12

Optional debug logger override

#### Inherited from

`GraphQLServiceConfig.debugger`

***

### language

> **language**: `string`

Defined in: @sitecore-content-sdk/content/types/site/error-pages-service.d.ts:13

The language

***

### retries?

> `optional` **retries**: `object`

Defined in: @sitecore-content-sdk/content/types/config/models.d.ts:84

Retry configuration applied to Layout, Dictionary and ErrorPages services

#### count?

> `optional` **count**: `number`

Number of retries for the GraphQL client.

##### Default

```ts
3
```

#### retryStrategy?

> `optional` **retryStrategy**: [`RetryStrategy`](RetryStrategy.md)

Retry strategy for the client. By default, uses exponential
back-off factor of 2 for codes 429, 502, 503, 504, 520, 521, 522, 523, 524.

##### Default

```ts
DefaultRetryStrategy
```

#### Inherited from

`GraphQLServiceConfig.retries`
