[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / createRobotsRoute

# Function: createRobotsRoute()

> **createRobotsRoute**(`options`): `object`

Defined in: [nuxt/src/route-handlers/robots-route.ts:45](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/dd9a23232a2cc3068e1c232b739c5e5e2eaaeb29/packages/nuxt/src/route-handlers/robots-route.ts#L45)

Creates a route handler to serve the robots.txt file.
Fetches robots.txt content from Sitecore and serves it as plain text.
Resolves the correct site based on the incoming request hostname.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`RobotsRouteOptions`](../type-aliases/RobotsRouteOptions.md) | The options for the route handler. |

## Returns

The route handler object with handle method.

### handle()

> **handle**: (`event`) => `Promise`\<`void`\>

Handles an incoming robots.txt request.
Resolves the site by hostname, fetches the robots.txt content from Sitecore,
and sends it as a plain text response.
Returns 404 with a default disallow rule if no content is found.
Returns 500 if the Sitecore request fails.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` | The incoming H3 event |

#### Returns

`Promise`\<`void`\>

#### Throws

Will throw an error if the event's hostname cannot be found in the site resolver.

## Example

```ts
// server/routes/robots.txt.ts
import { createRobotsRoute } from '@sitecore-content-sdk/nuxt/routes';
import { client } from '../lib/sitecore-client';
import sites from '../../.sitecore/sites.json';

const { handle } = createRobotsRoute({ client, sites });

export default defineEventHandler(handle);
@public
```
