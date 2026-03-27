import { createApp, toNodeListener, defineEventHandler } from 'h3';
import { createServer, Server } from 'node:http';
import { AddressInfo } from 'node:net';
import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { QUERY_PARAM_EDITING_SECRET } from '@sitecore-content-sdk/content/editing';
import { createEditingConfigRoute } from '../../src/route-handlers/editing-config-route';
import { ComponentMap } from '@sitecore-content-sdk/vue';
import { NuxtContentSdkComponent } from '../../src/sharedTypes/component-props';

describe('EditingConfigRoute integration', () => {
  let server: Server;
  let baseUrl: string;

  const secret = 'integration-test-secret';
  const allowedOrigin = 'https://pages.sitecorecloud.io';

  const componentsMap: ComponentMap<NuxtContentSdkComponent> = new Map();
  componentsMap.set('TestComponent', {} as NuxtContentSdkComponent);

  const metadata = { packages: { '@sitecore-content-sdk/nuxt': '1.0.0' } };

  const fetchWithClose = (url: string, options: RequestInit = {}) =>
    fetch(url, {
      ...options,
      headers: { ...options.headers, Connection: 'close' },
    });

  beforeAll(async () => {
    process.env.SITECORE_EDITING_SECRET = secret;
    process.env.JSS_ALLOWED_ORIGINS = allowedOrigin;

    const { handle } = createEditingConfigRoute({ components: componentsMap, metadata });
    const app = createApp();
    app.use('/api/editing/config', defineEventHandler(handle));
    server = createServer(toNodeListener(app));

    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const { port } = server.address() as AddressInfo;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    delete process.env.SITECORE_EDITING_SECRET;
    delete process.env.JSS_ALLOWED_ORIGINS;
    await new Promise<void>((resolve) => {
      server.close(() => setTimeout(resolve, 100));
    });
  });

  it('should return 401 for missing editing secret', async () => {
    const res = await fetchWithClose(`${baseUrl}/api/editing/config`, {
      headers: { origin: allowedOrigin },
    });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.message).toBe('Missing or invalid editing secret');
  });

  it('should return 401 for invalid editing secret', async () => {
    const res = await fetchWithClose(
      `${baseUrl}/api/editing/config?${QUERY_PARAM_EDITING_SECRET}=wrong-secret`,
      { headers: { origin: allowedOrigin } }
    );
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.message).toBe('Missing or invalid editing secret');
  });

  it('should return 401 for invalid origin', async () => {
    const res = await fetchWithClose(
      `${baseUrl}/api/editing/config?${QUERY_PARAM_EDITING_SECRET}=${secret}`,
      { headers: { origin: 'https://not-allowed.com' } }
    );
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.message).toBe('Invalid origin');
  });

  it('should return 200 with config data for valid request', async () => {
    const res = await fetchWithClose(
      `${baseUrl}/api/editing/config?${QUERY_PARAM_EDITING_SECRET}=${secret}`,
      { headers: { origin: allowedOrigin } }
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/json');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin);
    const body = await res.json();
    expect(body.framework).toBe('nuxt');
    expect(body.components).toEqual(['TestComponent']);
    expect(body.clientComponents).toEqual([]);
    expect(body.editMode).toBe('metadata');
    expect(body.packages).toEqual({ '@sitecore-content-sdk/nuxt': '1.0.0' });
  });

  it('should include CORS headers in 200 response', async () => {
    const res = await fetchWithClose(
      `${baseUrl}/api/editing/config?${QUERY_PARAM_EDITING_SECRET}=${secret}`,
      { headers: { origin: allowedOrigin } }
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin);
  });
});
