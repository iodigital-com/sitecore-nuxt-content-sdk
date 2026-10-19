import { defineEventHandler } from 'h3';
import { createHealthcheckRoute } from '@iodigital-com/sitecore-content-sdk-nuxt/monitoring';

const { handle } = createHealthcheckRoute();

export default defineEventHandler(handle);
