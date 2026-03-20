[**@sitecore-content-sdk/nuxt**](../../README.md)

***

[@sitecore-content-sdk/nuxt](../../README.md) / [index](../README.md) / createEditingConfigRoute

# Function: createEditingConfigRoute()

> **createEditingConfigRoute**(`config`): `object`

Defined in: [route-handlers/editing-config-route.ts:51](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/3e9ab6412a8024198f4f7a02eed2152a06d94ee6/packages/nuxt/src/route-handlers/editing-config-route.ts#L51)

Creates a route handler for the editing config API route (e.g. /api/editing/config).
Provides configuration information to determine feature compatibility on the Sitecore Page Builder side.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `config` | `EditingConfigRouteConfig` | The configuration for the editing config route. |

## Returns

The route handler object with handle method.

### handle()

> **handle**: (`event`) => `Promise`\<`void`\>

Handles an incoming editing config request.
Validates the editing secret and CORS headers, then returns the list of
available components, packages and edit mode to the Sitecore Page Builder.

Returns 401 if the origin is not allowed or the editing secret is invalid.
Returns 500 if an unexpected error occurs.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` | The incoming H3 event |

#### Returns

`Promise`\<`void`\>

## Example

```ts
// server/api/editing/config.get.ts
import { createEditingConfigRoute } from '@sitecore-content-sdk/nuxt/editing';
import componentMap from '~/components/component-map';
import metadata from '~/package.json';

const { handle } = createEditingConfigRoute({ components: componentMap, metadata });

export default defineEventHandler(handle);
@public
```
