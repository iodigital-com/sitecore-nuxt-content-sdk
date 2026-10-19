import { defineCliConfig } from '@iodigital-com/sitecore-content-sdk-nuxt/config-cli';
import {
  generateSites,
  generateMetadata,
  generateMap,
  extractFiles,
} from '@iodigital-com/sitecore-content-sdk-nuxt/tools';
import scConfig from './sitecore.config';

export default defineCliConfig({
  config: scConfig,
  build: {
    commands: [generateMetadata(), generateSites(), generateMap(), extractFiles()],
  },
  componentMap: {
    paths: ['app/components'],
    exclude: ['app/components/content-sdk/*'],
  },
});
