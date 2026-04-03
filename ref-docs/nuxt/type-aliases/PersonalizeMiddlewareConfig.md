[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / PersonalizeMiddlewareConfig

# Type Alias: PersonalizeMiddlewareConfig

> **PersonalizeMiddlewareConfig** = [`MiddlewareBaseConfig`](MiddlewareBaseConfig.md) & `SitecoreConfig`\[`"api"`\]\[`"edge"`\] & `SitecoreConfig`\[`"personalize"`\] & `object`

Defined in: [nuxt/src/middleware/personalize-middleware.ts:47](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/8963802a0d4f5d901b409afced72114460b0c2b1/packages/nuxt/src/middleware/personalize-middleware.ts#L47)

Configuration for the PersonalizeMiddleware.

Extends the base middleware config with Edge API settings and personalize options.
When `contextId` and `clientContextId` are omitted, the middleware initializes without
a personalize service and skips execution. This is expected in local container development.

## Type Declaration

### extractGeoDataCb()?

> `optional` **extractGeoDataCb**: (`event?`) => `Promise`\<`PersonalizeGeoData`\> \| `PersonalizeGeoData`

Optional callback to extract geolocation data from the request.
Can be synchronous or asynchronous.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event?` | `H3Event` | The incoming H3 event |

#### Returns

`Promise`\<`PersonalizeGeoData`\> \| `PersonalizeGeoData`

Geolocation data

### getExtraUtmParams()?

> `optional` **getExtraUtmParams**: (`event`) => `Partial`\<`ExperienceParams`\[`"utm"`\]\>

Optional callback to provide additional UTM parameters for the experience context.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` | The incoming H3 event |

#### Returns

`Partial`\<`ExperienceParams`\[`"utm"`\]\>

Additional UTM parameters to merge

### personalizeService?

> `optional` **personalizeService**: `PersonalizeService`

Optional override for the personalize service. When provided, the default
PersonalizeService is not instantiated.

## Example

```ts
const middleware = new PersonalizeMiddleware({
  enabled: true,
  contextId: 'my-context-id',
  clientContextId: 'my-client-context-id',
  edgeUrl: 'https://my-edge-url',
  edgeTimeout: 400,
  cdpTimeout: 400,
  sites: [{ name: 'my-site', hostName: 'my-site.com', language: 'en' }],
});
```
