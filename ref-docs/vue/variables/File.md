[**@sitecore-content-sdk/vue**](../README.md)

***

[@sitecore-content-sdk/vue](../README.md) / File

# Variable: File

> `const` **File**: `DefineComponent`\<\{ `field`: [`FileFieldValue`](../interfaces/FileFieldValue.md) \| [`FileField`](../interfaces/FileField.md); \}\>

Defined in: [vue/src/components/File.d.ts:37](https://github.com/weareyou/sitecore-nuxt-content-sdk/blob/0050a40ff8845ffcfa6529dc9043742e14fcc60d/packages/vue/src/components/File.d.ts#L37)

Renders a Sitecore File field as an anchor tag.
Falls back to `title` or `displayName` as link text when no slot content is provided.
Renders nothing when the field value is empty.

## Examples

```vue
<File :field="fields.file" />
```

// With custom link text via slot
```vue
<File :field="fields.file">Download PDF</File>
```
