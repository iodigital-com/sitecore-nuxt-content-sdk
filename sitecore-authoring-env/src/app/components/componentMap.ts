// app/components/componentMap.ts
import type { ComponentMap } from '@sitecore-content-sdk/nuxt';
import { defineSitecoreComponent } from '@sitecore-content-sdk/nuxt';

const componentMap: ComponentMap = new Map([
  ['RichText', defineSitecoreComponent(() => import('./RichText.vue'))],
  ['Text', defineSitecoreComponent(() => import('./Text.vue'))],
  ['Image', defineSitecoreComponent(() => import('./Image.vue'))],
  ['Container', defineSitecoreComponent(() => import('./Container.vue'))],
  ['ColumnSplitter', defineSitecoreComponent(() => import('./ColumnSplitter.vue'))],
  ['RowSplitter', defineSitecoreComponent(() => import('./RowSplitter.vue'))],
  ['Form', defineSitecoreComponent(() => import('./Form.vue'))],
  [
    'PartialDesignDynamicPlaceholder',
    defineSitecoreComponent(() => import('./PartialDesignDynamicPlaceholder.vue')),
  ],
  ['Link', defineSitecoreComponent(() => import('./Link.vue'))],
  ['MyGraphQLComponent', defineSitecoreComponent(() => import('./MyGraphQLComponent.vue'))],
  ['AsyncComponent', defineSitecoreComponent(() => import('./AsyncComponent.vue'))],
]);

export default componentMap;
