import { debug as coreDebug } from '@sitecore-content-sdk/core';
import { debug as contentDebug } from '@sitecore-content-sdk/content';
// TODO: Add searchDebug when we have a search implementation in Nuxt/Vue

/**
 * Unified debug object containing all debug namespaces from referenced content-sdk packages.
 * @public
 */
const debug: Record<string, debug.Debugger> = {
  ...coreDebug,
  ...contentDebug,
  // search: searchDebug,
};

export default debug;
