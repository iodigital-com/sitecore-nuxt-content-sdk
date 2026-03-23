import { createApp, toNodeListener, defineEventHandler } from 'h3';
import { createServer } from 'node:http';
import { createEditingConfigRoute } from '../../src/route-handlers/editing-config-route';
import { ComponentMap } from '@sitecore-content-sdk/vue';
import { NuxtContentSdkComponent } from '../../src/sharedTypes/component-props';

process.env.SITECORE_EDITING_SECRET = 'dev-secret';
process.env.JSS_ALLOWED_ORIGINS = 'http://localhost:3333';

const componentsMap: ComponentMap<NuxtContentSdkComponent> = new Map();
componentsMap.set('TestComponent', {} as NuxtContentSdkComponent);
componentsMap.set('AnotherComponent', {} as NuxtContentSdkComponent);

const metadata = { packages: { '@sitecore-content-sdk/nuxt': '1.0.0' } };

const { handle } = createEditingConfigRoute({ components: componentsMap, metadata });

const app = createApp();
app.use('/api/editing/config', defineEventHandler(handle));

const server = createServer(toNodeListener(app));
server.listen(3333, () => {
  console.log('');
  console.log('  Route test server running at http://localhost:3333');
  console.log('');
  console.log('  GET http://localhost:3333/api/editing/config');
  console.log('    Required header:  origin: http://localhost:3333');
  console.log('    Required param:   ?secret=dev-secret');
  console.log('');
  console.log('  Full URL:');
  console.log('  http://localhost:3333/api/editing/config?secret=dev-secret');
  console.log('');
});
