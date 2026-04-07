[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / useSitecoreClient

# Function: useSitecoreClient()

> **useSitecoreClient**(): [`SitecoreClient`](../classes/SitecoreClient.md)

Defined in: [nuxt/src/composables/useSitecoreClient.ts:13](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/fea536f819edb689aeb38530140c8bbd5b901091/packages/nuxt/src/composables/useSitecoreClient.ts#L13)

Composable that initializes and returns a `SitecoreNuxtClient` instance
using the Nuxt runtime config.

## Returns

[`SitecoreClient`](../classes/SitecoreClient.md)

## Example

```ts
const client = useSitecoreClient();
const page = await client.getPage(route.params.slug);
```
