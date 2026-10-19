import { defineEventHandler } from 'h3';
import { PreviewMiddleware } from '@iodigital-com/sitecore-content-sdk-nuxt/middleware';
import sites from '../../.sitecore/sites.json';

const middleware = new PreviewMiddleware({ sites });

export default defineEventHandler((event) => middleware.handle(event));
