import { defineEventHandler } from 'h3';
import { createEditingRenderRoute } from '@sitecore-content-sdk/nuxt/routes';

const { handleOptions } = createEditingRenderRoute();

export default defineEventHandler(handleOptions);
