// app/components/componentMap.ts
import type { ComponentMap } from '@sitecore-content-sdk/nuxt';
import { defineSitecoreComponent } from '@sitecore-content-sdk/nuxt';

const componentMap: ComponentMap = new Map([
  ['Text', defineSitecoreComponent(() => import('./Text.vue'))],
]);

export default componentMap;
