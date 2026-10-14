[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / PlaceholderProps

# Interface: PlaceholderProps

Defined in: @sitecore-content-sdk/vue/types/components/Placeholder/models.d.ts:14

Base Placeholder props

## Properties

### componentMap?

> `optional` **componentMap**: [`ComponentMap`](../type-aliases/ComponentMap.md)

Defined in: @sitecore-content-sdk/vue/types/components/Placeholder/models.d.ts:85

Component Map will be used to map Sitecore component names to app implementation.
When rendered within a SitecoreProvider component, defaults to the context componentMap.

***

### errorComponent?

> `optional` **errorComponent**: `Component`\<`ErrorComponentProps`\>

Defined in: @sitecore-content-sdk/vue/types/components/Placeholder/models.d.ts:46

A component that is rendered in place of the placeholder when an error occurs rendering
the placeholder.

***

### fields?

> `optional` **fields**: `object`

Defined in: @sitecore-content-sdk/vue/types/components/Placeholder/models.d.ts:23

An object of field names/values that are aggregated and propagated through the component tree created by a placeholder.
Any component or placeholder rendered by a placeholder will have access to this data via `props.fields`.

#### Index Signature

\[`name`: `string`\]: [`Field`](Field.md)\<`GenericFieldValue`\> \| [`Item`](Item.md) \| [`Item`](Item.md)[]

***

### hiddenRenderingComponent?

> `optional` **hiddenRenderingComponent**: `Component`

Defined in: @sitecore-content-sdk/vue/types/components/Placeholder/models.d.ts:41

A component that is rendered in place of any components that are hidden.

***

### missingComponentComponent?

> `optional` **missingComponentComponent**: `Component`

Defined in: @sitecore-content-sdk/vue/types/components/Placeholder/models.d.ts:37

A component that is rendered in place of any components that are in this placeholder,
but do not have a definition in the componentMap (i.e. don't have a Vue implementation).

***

### modifyComponentProps()?

> `optional` **modifyComponentProps**: (`componentProps`) => `ChildComponentProps`

Defined in: @sitecore-content-sdk/vue/types/components/Placeholder/models.d.ts:72

Modify final props of component (before render) provided by rendering data.
Can be used in case when you need to insert additional data into the component.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `componentProps` | `ChildComponentProps` | component props to be modified |

#### Returns

`ChildComponentProps`

modified or initial props

***

### name

> **name**: `string`

Defined in: @sitecore-content-sdk/vue/types/components/Placeholder/models.d.ts:16

Name of the placeholder to render.

***

### page?

> `optional` **page**: [`Page`](../type-aliases/Page.md)

Defined in: @sitecore-content-sdk/vue/types/components/Placeholder/models.d.ts:51

Page data.
This data is passed by the SitecoreProvider.

***

### params?

> `optional` **params**: `object`

Defined in: @sitecore-content-sdk/vue/types/components/Placeholder/models.d.ts:30

An object of rendering parameter names/values that are aggregated and propagated through the component tree created by a placeholder.
Any component or placeholder rendered by a placeholder will have access to this data via `props.params`.

#### Index Signature

\[`name`: `string`\]: `string`

***

### passThroughComponentProps?

> `optional` **passThroughComponentProps**: `object`

Defined in: @sitecore-content-sdk/vue/types/components/Placeholder/models.d.ts:78

An alternative to `modifyComponentProps` that allows passing additional props to the component
without modifying the CSDK Placeholder props from Sitecore.
These props will be merged into the result of modifyComponentProps if you use both.

#### Index Signature

\[`key`: `string`\]: `unknown`

***

### render()?

> `optional` **render**: (`components`, `data`, `props`) => `VNode`\<`RendererNode`, `RendererElement`, \{\[`key`: `string`\]: `any`; \}\>[]

Defined in: @sitecore-content-sdk/vue/types/components/Placeholder/models.d.ts:65

Render function that enables control over the rendering of the components in the placeholder.
Useful for techniques like wrapping each child in a wrapper component.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `components` | `VNode`\<`RendererNode`, `RendererElement`, \{\[`key`: `string`\]: `any`; \}\>[] |
| `data` | [`ComponentRendering`](ComponentRendering.md)\<[`ComponentFields`](ComponentFields.md)\>[] |
| `props` | `PlaceholderProps` |

#### Returns

`VNode`\<`RendererNode`, `RendererElement`, \{\[`key`: `string`\]: `any`; \}\>[]

***

### renderEach()?

> `optional` **renderEach**: (`component`, `index`) => `VNode`

Defined in: @sitecore-content-sdk/vue/types/components/Placeholder/models.d.ts:60

Render function that is called for each non-system component added to the placeholder.
Mutually exclusive with `render`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `component` | `VNode` |
| `index` | `number` |

#### Returns

`VNode`

***

### renderEmpty()?

> `optional` **renderEmpty**: (`components`) => `VNode`\<`RendererNode`, `RendererElement`, \{\[`key`: `string`\]: `any`; \}\>[]

Defined in: @sitecore-content-sdk/vue/types/components/Placeholder/models.d.ts:55

Render function that is called when the placeholder contains no content components.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `components` | `VNode`\<`RendererNode`, `RendererElement`, \{\[`key`: `string`\]: `any`; \}\>[] |

#### Returns

`VNode`\<`RendererNode`, `RendererElement`, \{\[`key`: `string`\]: `any`; \}\>[]

***

### rendering

> **rendering**: [`ComponentRendering`](ComponentRendering.md)\<[`ComponentFields`](ComponentFields.md)\> \| [`RouteData`](RouteData.md)\<`Record`\<`string`, [`Field`](Field.md)\<`GenericFieldValue`\> \| [`Item`](Item.md) \| [`Item`](Item.md)[]\>\>

Defined in: @sitecore-content-sdk/vue/types/components/Placeholder/models.d.ts:18

Rendering data to be used when rendering the placeholder.
