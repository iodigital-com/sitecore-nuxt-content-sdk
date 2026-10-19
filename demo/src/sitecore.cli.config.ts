import { defineCliConfig } from '@iodigital-com/sitecore-content-sdk-nuxt/config-cli';
import { generateSites, generateMetadata, extractFiles } from '@iodigital-com/sitecore-content-sdk-nuxt/tools';
import scConfig from './sitecore.config';

export default defineCliConfig({
  config: scConfig,
  build: {
    commands: [generateMetadata(), generateSites(), extractFiles()],
  },
  componentMap: {
    paths: ['components'],
    exclude: ['components/content-sdk/*'],
  },
});
