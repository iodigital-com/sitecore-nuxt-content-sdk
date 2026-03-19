[**@sitecore-content-sdk/nuxt**](../../README.md)

***

[@sitecore-content-sdk/nuxt](../../README.md) / [index](../README.md) / EditingConfigRoute

# Class: EditingConfigRoute

Defined in: routes/editing-config-route.ts:49

Route handler for the editing config API route (e.g. /api/editing/config).
Provides configuration information to determine feature compatibility on the Sitecore Page Builder side.

## Example

```ts
// server/api/editing/config.get.ts
import { EditingConfigRoute } from '@sitecore-content-sdk/nuxt/editing';
import componentMap from '~/components/component-map';
import metadata from '~/package.json';

const route = new EditingConfigRoute({ components: componentMap, metadata });

export default defineEventHandler((event) => route.handle(event));
```

## Constructors

### Constructor

> **new EditingConfigRoute**(`config`): `EditingConfigRoute`

Defined in: routes/editing-config-route.ts:53

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `config` | [`EditingConfigRouteConfig`](../type-aliases/EditingConfigRouteConfig.md) | The configuration for the editing config route |

#### Returns

`EditingConfigRoute`

## Properties

### config

> `protected` **config**: [`EditingConfigRouteConfig`](../type-aliases/EditingConfigRouteConfig.md)

Defined in: routes/editing-config-route.ts:53

The configuration for the editing config route

## Methods

### handle()

> **handle**(`event`): `Promise`\<`void`\>

Defined in: routes/editing-config-route.ts:65

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
