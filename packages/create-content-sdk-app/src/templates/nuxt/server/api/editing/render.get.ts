import { defineEventHandler } from 'h3';
import { createEditingRenderRoute } from '@sitecore-content-sdk/nuxt/routes';

const { handleGet } = createEditingRenderRoute();

export default defineEventHandler(handleGet);
