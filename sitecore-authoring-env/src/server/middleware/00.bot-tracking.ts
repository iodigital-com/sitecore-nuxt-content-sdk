import { defineEventHandler } from 'h3';
import { BotTrackingMiddleware } from '@sitecore-content-sdk/nuxt/middleware';
import sites from '../../.sitecore/sites.json';

const middleware = new BotTrackingMiddleware({ sites });

export default defineEventHandler((event) => middleware.handle(event));
