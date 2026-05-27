import { defineEventHandler } from 'h3';
import { createEditingConfigRoute } from '@sitecore-content-sdk/nuxt/routes';
import { componentNames } from '../../../app/components/componentNames';
import metadata from './../../../.sitecore/metadata.json';

const { handleOptions } = createEditingConfigRoute({ components: componentNames, metadata });

export default defineEventHandler(handleOptions);
