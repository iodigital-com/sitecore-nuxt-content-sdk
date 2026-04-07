[**@sitecore-content-sdk/nuxt**](../README.md)

***

[@sitecore-content-sdk/nuxt](../README.md) / useSitecorePage

# Function: useSitecorePage()

> **useSitecorePage**(): `Promise`\<[`UseSitecorePageResult`](../type-aliases/UseSitecorePageResult.md)\>

Defined in: nuxt/src/composables/useSitecorePages.ts:55

Composable that fetches Sitecore page data for the current route.

Reads the slug from the route params, determines the correct fetch mode
(normal, preview, or Design Library), and fetches the layout data via
`useAsyncData` for SSR support.

Site and locale are resolved automatically — the multisite middleware
rewrites the path to include the site segment, and the locale middleware
sets the `x-sc-locale` response header. `SitecoreNuxtClient` handles both.

Head links (stylesheets, themes) are injected automatically via `useHead`.

Must be used in `[...slug].vue` or any catch-all route page.

## Returns

`Promise`\<[`UseSitecorePageResult`](../type-aliases/UseSitecorePageResult.md)\>

The reactive page result containing `page`, `error`, and `status`.

## Example

```ts
// pages/[...slug].vue
<script setup>
import { useSitecorePage } from '@sitecore-content-sdk/nuxt';

const { page, error } = await useSitecorePage();

if (!page.value) {
  throw createError({ statusCode: 404 });
}
</script>
```
