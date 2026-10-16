import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createEvent, H3Event } from 'h3';
import { IncomingMessage, ServerResponse } from 'http';
import { QUERY_PARAM_EDITING_SECRET } from '@sitecore-content-sdk/content/editing';
import { NuxtContentSdkComponent } from '../sharedTypes/component-props';
import { ComponentMap } from '@sitecore-content-sdk/vue';

vi.mock('../utils/utils', () => ({ getEditingSecret: vi.fn() }));
vi.mock('@sitecore-content-sdk/core/tools', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sitecore-content-sdk/core/tools')>();
  return {
    ...actual,
    getEnforcedCorsHeaders: vi.fn(),
  };
});

import { getEditingSecret } from '../utils/utils';
import { getEnforcedCorsHeaders } from '@sitecore-content-sdk/core/tools';
import { createEditingConfigRoute } from './editing-config-route';

const createMockEvent = (
  headers: Record<string, string> = {},
  path: string = '/',
  method: string = 'GET'
): H3Event => {
  const req = new IncomingMessage(null as any);
  req.headers = headers;
  req.url = path;
  req.method = method;
  const res = new ServerResponse(req);
  return createEvent(req, res);
};

const readBody = (event: H3Event): Promise<string> => {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];

    event.node.res.write = (chunk: any) => {
      chunks.push(Buffer.from(chunk));
      return true;
    };

    event.node.res.end = (chunk?: any) => {
      if (chunk) chunks.push(Buffer.from(chunk));
      resolve(Buffer.concat(chunks).toString());
      return event.node.res;
    };
  });
};

describe('createEditingConfigRoute', () => {
  let route: any;

  const allowedOrigin = 'https://allowed.com';
  const secret = 'jss-editing-secret-mock';

  const componentsMap: ComponentMap<NuxtContentSdkComponent> = new Map();
  componentsMap.set('TestComponentOne', {} as NuxtContentSdkComponent);
  componentsMap.set('TestComponentTwo', {} as NuxtContentSdkComponent);

  const metadata = { packages: { testPackageOne: '0.1.1' } };

  const expectedResult = {
    framework: 'nuxt',
    components: ['TestComponentOne', 'TestComponentTwo'],
    clientComponents: [],
    packages: { testPackageOne: '0.1.1' },
    editMode: 'metadata',
  };

  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE, PUT, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  beforeEach(() => {
    vi.mocked(getEditingSecret).mockReturnValue(secret);
    vi.mocked(getEnforcedCorsHeaders).mockReturnValue(corsHeaders);

    route = createEditingConfigRoute({ components: componentsMap, metadata });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('OPTIONS handler', () => {
    it('should return 401 for invalid origin', async () => {
      vi.mocked(getEnforcedCorsHeaders).mockReturnValue(null);

      const event = createMockEvent({ origin: allowedOrigin }, '/', 'OPTIONS');
      const bodyPromise = readBody(event);

      await route.handleOptions(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).toBe(401);
      expect(body).toBe(JSON.stringify({ message: 'Invalid origin' }));
      expect(event.node.res.getHeader('Content-Type')).toBe('application/json');
    });

    it('should return 204 for valid preflight request', async () => {
      const event = createMockEvent({ origin: allowedOrigin }, '/', 'OPTIONS');
      const bodyPromise = readBody(event);

      await route.handleOptions(event);
      await bodyPromise;

      expect(event.node.res.statusCode).toBe(204);
      expect(event.node.res.getHeader('Access-Control-Allow-Origin')).toBe(allowedOrigin);
      expect(event.node.res.getHeader('Access-Control-Allow-Methods')).toBe(
        corsHeaders['Access-Control-Allow-Methods']
      );
      expect(event.node.res.getHeader('Access-Control-Allow-Headers')).toBe(
        corsHeaders['Access-Control-Allow-Headers']
      );
    });

    it('should call getEnforcedCorsHeaders with correct parameters', async () => {
      const event = createMockEvent({ origin: allowedOrigin }, '/', 'OPTIONS');

      await route.handleOptions(event);

      expect(vi.mocked(getEnforcedCorsHeaders)).toHaveBeenCalledOnce();
      const args = vi.mocked(getEnforcedCorsHeaders).mock.calls[0][0];
      expect(args.requestMethod).toBe('OPTIONS');
      expect((args.headers as Headers).get('origin')).toBe(allowedOrigin);
    });

    it('should return 500 for unexpected errors', async () => {
      vi.mocked(getEnforcedCorsHeaders).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const event = createMockEvent({ origin: allowedOrigin }, '/', 'OPTIONS');
      const bodyPromise = readBody(event);

      await route.handleOptions(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).toBe(500);
      expect(body).toBe('Internal Server Error');
    });
  });

  describe('GET handler', () => {
    it('should return 401 for invalid origin', async () => {
      vi.mocked(getEnforcedCorsHeaders).mockReturnValue(null);
      const event = createMockEvent(
        { origin: allowedOrigin },
        `/?${QUERY_PARAM_EDITING_SECRET}=${secret}`
      );
      const bodyPromise = readBody(event);

      await route.handle(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).toBe(401);
      expect(body).toBe(JSON.stringify({ message: 'Invalid origin' }));
      expect(event.node.res.getHeader('Content-Type')).toBe('application/json');
    });

    it('should return 401 for missing editing secret', async () => {
      const event = createMockEvent({ origin: allowedOrigin }, '/');
      const bodyPromise = readBody(event);

      await route.handle(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).toBe(401);
      expect(body).toBe(JSON.stringify({ message: 'Missing or invalid editing secret' }));
      expect(event.node.res.getHeader('Content-Type')).toBe('application/json');
    });

    it('should return 401 for invalid editing secret', async () => {
      const event = createMockEvent(
        { origin: allowedOrigin },
        `/?${QUERY_PARAM_EDITING_SECRET}=wrong-secret`
      );
      const bodyPromise = readBody(event);

      await route.handle(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).toBe(401);
      expect(body).toBe(JSON.stringify({ message: 'Missing or invalid editing secret' }));
      expect(event.node.res.getHeader('Content-Type')).toBe('application/json');
    });

    it('should return 200 with config data for valid request', async () => {
      const event = createMockEvent(
        { origin: allowedOrigin },
        `/?${QUERY_PARAM_EDITING_SECRET}=${secret}`
      );
      const bodyPromise = readBody(event);

      await route.handle(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).toBe(200);
      expect(body).toBe(JSON.stringify(expectedResult));
      expect(event.node.res.getHeader('Content-Type')).toBe('application/json');
      expect(event.node.res.getHeader('Access-Control-Allow-Origin')).toBe(allowedOrigin);
      expect(event.node.res.getHeader('Access-Control-Allow-Methods')).toBe(
        corsHeaders['Access-Control-Allow-Methods']
      );
      expect(event.node.res.getHeader('Access-Control-Allow-Headers')).toBe(
        corsHeaders['Access-Control-Allow-Headers']
      );
    });

    it('should call getEnforcedCorsHeaders with correct parameters', async () => {
      const event = createMockEvent(
        { origin: allowedOrigin },
        `/?${QUERY_PARAM_EDITING_SECRET}=${secret}`
      );

      await route.handle(event);

      expect(vi.mocked(getEnforcedCorsHeaders)).toHaveBeenCalledOnce();
      const args = vi.mocked(getEnforcedCorsHeaders).mock.calls[0][0];
      expect(args.requestMethod).toBe('GET');
      expect((args.headers as Headers).get('origin')).toBe(allowedOrigin);
    });

    it('should return 500 for unexpected errors', async () => {
      vi.mocked(getEditingSecret).mockImplementation(() => {
        throw new Error('Unexpected error');
      });
      const event = createMockEvent(
        { origin: allowedOrigin },
        `/?${QUERY_PARAM_EDITING_SECRET}=${secret}`
      );
      const bodyPromise = readBody(event);

      await route.handle(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).toBe(500);
      expect(body).toBe('Internal Server Error');
    });
  });

  describe('component map handling', () => {
    it('should convert components map to array correctly', async () => {
      const customComponents = new Map();
      customComponents.set('Component1', {});
      customComponents.set('Component2', {});
      customComponents.set('Component3', {});

      const customRoute = createEditingConfigRoute({ components: customComponents, metadata });

      const event = createMockEvent(
        { origin: allowedOrigin },
        `/?${QUERY_PARAM_EDITING_SECRET}=${secret}`
      );
      const bodyPromise = readBody(event);

      await customRoute.handle(event);
      const body = JSON.parse(await bodyPromise);

      expect(event.node.res.statusCode).toBe(200);
      expect(body.components).toEqual(['Component1', 'Component2', 'Component3']);
      expect(body.framework).toBe('nuxt');
      expect(body.clientComponents).toEqual([]);
    });

    it('should include clientComponents in response when provided', async () => {
      const clientComponentsMap: ComponentMap<NuxtContentSdkComponent> = new Map();
      clientComponentsMap.set('ClientComponent1', {} as NuxtContentSdkComponent);
      clientComponentsMap.set('ClientComponent2', {} as NuxtContentSdkComponent);

      const customRoute = createEditingConfigRoute({
        components: componentsMap,
        clientComponents: clientComponentsMap,
        metadata,
      });

      const event = createMockEvent(
        { origin: allowedOrigin },
        `/?${QUERY_PARAM_EDITING_SECRET}=${secret}`
      );
      const bodyPromise = readBody(event);

      await customRoute.handle(event);
      const body = JSON.parse(await bodyPromise);

      expect(event.node.res.statusCode).toBe(200);
      expect(body.framework).toBe('nuxt');
      expect(body.clientComponents).toEqual(['ClientComponent1', 'ClientComponent2']);
    });

    it('should return empty clientComponents array when not provided', async () => {
      const event = createMockEvent(
        { origin: allowedOrigin },
        `/?${QUERY_PARAM_EDITING_SECRET}=${secret}`
      );
      const bodyPromise = readBody(event);

      await route.handle(event);
      const body = JSON.parse(await bodyPromise);

      expect(event.node.res.statusCode).toBe(200);
      expect(body.framework).toBe('nuxt');
      expect(body.clientComponents).toEqual([]);
    });
  });
});
