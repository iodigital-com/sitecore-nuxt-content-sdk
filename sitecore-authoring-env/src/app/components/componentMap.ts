// app/components/componentMap.ts
import type { ComponentMap } from '@sitecore-content-sdk/nuxt';
import RichText from './RichText.vue';
import Image from './Image.vue';
import Container from './Container.vue';
import ColumnSplitter from './ColumnSplitter.vue';
import RowSplitter from './RowSplitter.vue';

const componentMap: ComponentMap = new Map([
  ['RichText', RichText],
  ['Image', Image],
  ['Container', Container],
  ['ColumnSplitter', ColumnSplitter],
  ['RowSplitter', RowSplitter],
]);

export default componentMap;
