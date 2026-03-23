[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / createHealthcheckRoute

# Function: createHealthcheckRoute()

> **createHealthcheckRoute**(): `object`

Defined in: [monitoring/healthcheck-route.ts:16](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/2ebe9a4e8989b0dc5e5026e2ba2b8c152837d436/packages/nuxt/src/monitoring/healthcheck-route.ts#L16)

Creates a route handler for the healthcheck endpoint.
Returns a 200 "Healthy" response so monitoring tools can verify the application is reachable.

## Returns

The route handler object with handle method.

### handle()

> **handle**: (`event`) => `Promise`\<`void`\>

Handles an incoming healthcheck request.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` | The incoming H3 event |

#### Returns

`Promise`\<`void`\>

## Example

```ts
// server/routes/healthcheck.ts
import { createHealthcheckRoute } from '@sitecore-content-sdk/nuxt/routes';

const { handle } = createHealthcheckRoute();

export default defineEventHandler(handle);
```
