import { defineEventHandler } from 'h3';
import { createEditingRenderRoute } from '@sitecore-content-sdk/nuxt/routes';

const { handlePost } = createEditingRenderRoute();

export default defineEventHandler(handlePost);
