[**@iodigital-com/sitecore-content-sdk-nuxt**](../README.md)

***

[@iodigital-com/sitecore-content-sdk-nuxt](../README.md) / createHealthcheckRoute

# Function: createHealthcheckRoute()

> **createHealthcheckRoute**(): `object`

Defined in: [packages/nuxt/src/monitoring/healthcheck-route.ts:16](https://github.com/iodigital-com/sitecore-nuxt-content-sdk/blob/4e1825ea844316bc3551dd4ba9c4c01dbd454c12/packages/nuxt/src/monitoring/healthcheck-route.ts#L16)

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
import { createHealthcheckRoute } from '@iodigital-com/sitecore-content-sdk-nuxt/routes';

const { handle } = createHealthcheckRoute();

export default defineEventHandler(handle);
```
