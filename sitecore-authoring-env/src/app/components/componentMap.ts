// app/componentMap.ts
import type { ComponentMap } from '@sitecore-content-sdk/nuxt';
import { RichText } from '@sitecore-content-sdk/nuxt';

const componentMap: ComponentMap = new Map([['RichText', RichText]]);

export default componentMap;
