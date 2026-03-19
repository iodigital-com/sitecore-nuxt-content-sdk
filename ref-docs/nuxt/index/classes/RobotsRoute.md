[**@sitecore-content-sdk/nuxt**](../../README.md)

***

[@sitecore-content-sdk/nuxt](../../README.md) / [index](../README.md) / RobotsRoute

# Class: RobotsRoute

Defined in: [routes/robots-route.ts:26](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/9f27831d38ed4ea4c87bdfb6922610bef950bdc1/packages/nuxt/src/routes/robots-route.ts#L26)

Route handler for robots.txt requests in a Nuxt application.
Fetches robots.txt content from Sitecore and serves it as plain text.
Resolves the correct site based on the incoming request hostname.

## Example

```ts
// server/routes/robots.txt.ts
import { RobotsRoute } from '@sitecore-content-sdk/nuxt/routes';
import { client } from '../lib/sitecore-client';
import sites from '../../.sitecore/sites.json';

const route = new RobotsRoute(client, sites);

export default defineEventHandler((event) => route.handle(event));
```

## Constructors

### Constructor

> **new RobotsRoute**(`client`, `sites`, `revalidate`): `RobotsRoute`

Defined in: [routes/robots-route.ts:35](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/9f27831d38ed4ea4c87bdfb6922610bef950bdc1/packages/nuxt/src/routes/robots-route.ts#L35)

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `client` | `SitecoreClient` | `undefined` | Sitecore client instance used to fetch robots.txt content |
| `sites` | `SiteInfo`[] | `undefined` | List of sites used for site resolution by hostname |
| `revalidate` | `number` \| `false` | `60` | Cache revalidation interval in seconds. Pass false to cache indefinitely. Defaults to 60. |

#### Returns

`RobotsRoute`

## Methods

### handle()

> **handle**(`event`): `Promise`\<`void`\>

Defined in: [routes/robots-route.ts:53](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/9f27831d38ed4ea4c87bdfb6922610bef950bdc1/packages/nuxt/src/routes/robots-route.ts#L53)

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
