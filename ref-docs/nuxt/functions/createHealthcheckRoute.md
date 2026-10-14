[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / createHealthcheckRoute

# Function: createHealthcheckRoute()

> **createHealthcheckRoute**(): `object`

Defined in: [packages/nuxt/src/monitoring/healthcheck-route.ts:16](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/7a1e7de41f189807cf81c37cfd6c2421fef22a67/packages/nuxt/src/monitoring/healthcheck-route.ts#L16)

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
