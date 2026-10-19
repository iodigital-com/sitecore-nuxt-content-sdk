// app/components/componentMap.ts
import type { ComponentMap } from '@iodigital-com/sitecore-content-sdk-nuxt';
import { defineSitecoreComponent } from '@iodigital-com/sitecore-content-sdk-nuxt';

const componentMap: ComponentMap = new Map([
  ['Text', defineSitecoreComponent(() => import('./Text.vue'))],
]);

export default componentMap;
