// server/api/.../config.get.ts
import { defineEventHandler } from 'h3';
import { createEditingConfigRoute } from '@sitecore-content-sdk/nuxt/routes';
import { componentNames } from '../../../app/components/componentNames';
import metadata from '../../../.sitecore/metadata.json';

const { handle } = createEditingConfigRoute({ components: componentNames, metadata });

export default defineEventHandler((event) => {
  return handle(event);
});
