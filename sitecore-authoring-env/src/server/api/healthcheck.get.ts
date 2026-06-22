import { defineEventHandler } from 'h3';
import { createHealthcheckRoute } from '@sitecore-content-sdk/nuxt/monitoring';

const { handle } = createHealthcheckRoute();

export default defineEventHandler(handle);
