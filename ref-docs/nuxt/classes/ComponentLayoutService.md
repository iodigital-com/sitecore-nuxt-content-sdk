[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / ComponentLayoutService

# Class: ComponentLayoutService

Defined in: packages/content/types/editing/component-layout-service.d.ts:72

REST service that enables Design Library functionality.
Returns layout data for a single rendered component.

## Constructors

### Constructor

> **new ComponentLayoutService**(`config`): `ComponentLayoutService`

Defined in: packages/content/types/editing/component-layout-service.d.ts:74

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `config` | `ComponentLayoutServiceConfig` |

#### Returns

`ComponentLayoutService`

## Methods

### fetchComponentData()

> **fetchComponentData**(`params`, `fetchOptions?`): `Promise`\<[`LayoutServiceData`](../interfaces/LayoutServiceData.md)\>

Defined in: packages/content/types/editing/component-layout-service.d.ts:75

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `params` | `ComponentLayoutRequestParams` |
| `fetchOptions?` | `FetchOptions` |

#### Returns

`Promise`\<[`LayoutServiceData`](../interfaces/LayoutServiceData.md)\>

***

### getComponentFetchParams()

> `protected` **getComponentFetchParams**(`params`): `any`

Defined in: packages/content/types/editing/component-layout-service.d.ts:76

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `params` | `ComponentLayoutRequestParams` |

#### Returns

`any`
