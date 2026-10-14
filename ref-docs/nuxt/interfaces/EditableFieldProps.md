[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / EditableFieldProps

# Interface: EditableFieldProps\<EmptyFieldEditingComponentProps\>

Defined in: @sitecore-content-sdk/vue/types/sharedTypes/props.d.ts:5

Shared editing field props

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `EmptyFieldEditingComponentProps` | `unknown` |

## Properties

### editable?

> `optional` **editable**: `boolean`

Defined in: @sitecore-content-sdk/vue/types/sharedTypes/props.d.ts:10

Can be used to explicitly disable inline editing.

#### Default

```ts
true
```

***

### emptyFieldEditingComponent?

> `optional` **emptyFieldEditingComponent**: `Component`\<`EmptyFieldEditingComponentProps`\>

Defined in: @sitecore-content-sdk/vue/types/sharedTypes/props.d.ts:14

Custom component to render in Pages in edit mode if field value is empty
