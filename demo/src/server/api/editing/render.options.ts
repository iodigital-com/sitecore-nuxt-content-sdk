import { defineEventHandler } from 'h3';
import { createEditingRenderRoute } from '@iodigital-com/sitecore-content-sdk-nuxt/routes';

const { handleOptions } = createEditingRenderRoute();

export default defineEventHandler(handleOptions);
