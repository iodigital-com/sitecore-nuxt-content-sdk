[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / createEditingRenderRoute

# Function: createEditingRenderRoute()

> **createEditingRenderRoute**(`config`): `object`

Defined in: [route-handlers/editing-render-route.ts:71](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/687cd21a1a19d11600207468f41db199d3c9f00b/packages/nuxt/src/route-handlers/editing-render-route.ts#L71)

Creates a route handler for the editing render API route (e.g. '/api/editing/render').
Handles GET requests for page rendering and POST requests for server action proxying.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `config` | [`EditingRenderRouteConfig`](../type-aliases/EditingRenderRouteConfig.md) | The configuration for the route handler. |

## Returns

The route handler object with handleGet and handlePost methods.

### handleGet()

> **handleGet**: (`event`) => `Promise`\<`void`\>

Handles an incoming GET request for page rendering in editing mode.
Validates the editing secret and CORS headers, fetches the page HTML from Nuxt,
and returns it to the Sitecore Page Builder.

Returns 401 if the origin is not allowed or the editing secret is invalid.
Returns 400 if required query parameters are missing.
Returns 307 redirect if the page HTML fetch fails.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` | The incoming H3 event |

#### Returns

`Promise`\<`void`\>

### handlePost()

> **handlePost**: (`event`) => `Promise`\<`void`\>

Handles an incoming POST request for server action proxying in editing mode.
Proxies the request to the Nuxt application so server actions can be processed correctly.
Validates the editing secret and CORS headers before proxying.

Returns 401 if the origin is not allowed or the editing secret is invalid.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` | The incoming H3 event |

#### Returns

`Promise`\<`void`\>

## Examples

```ts
// server/api/editing/render.get.ts
import { createEditingRenderRoute } from '@sitecore-content-sdk/nuxt/editing';
import componentMap from '~/components/component-map';

const { handleGet } = createEditingRenderRoute();

export default defineEventHandler(handleGet);
```

```ts
// server/api/editing/render.post.ts
import { createEditingRenderRoute } from '@sitecore-content-sdk/nuxt/editing';

const { handlePost } = createEditingRenderRoute();

export default defineEventHandler(handlePost);
@public
```
