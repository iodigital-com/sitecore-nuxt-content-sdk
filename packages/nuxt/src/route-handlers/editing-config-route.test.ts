/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import { createEvent, H3Event } from 'h3';
import { IncomingMessage, ServerResponse } from 'http';
import { QUERY_PARAM_EDITING_SECRET } from '@sitecore-content-sdk/content/editing';
import { NuxtContentSdkComponent } from '../sharedTypes/component-props';
import { ComponentMap } from '@sitecore-content-sdk/vue';

chai.use(sinonChai);

const createMockEvent = (headers: Record<string, string> = {}, path: string = '/'): H3Event => {
  const req = new IncomingMessage(null as any);
  req.headers = headers;
  req.url = path;
  req.method = 'GET';
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
  const sandbox = sinon.createSandbox();
  let EditingConfigRouteModule: any;
  let getEditingSecretStub: sinon.SinonStub;
  let getEnforcedCorsHeadersStub: sinon.SinonStub;
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
    getEditingSecretStub = sandbox.stub().returns(secret);
    getEnforcedCorsHeadersStub = sandbox.stub().returns(corsHeaders);

    EditingConfigRouteModule = proxyquire('./editing-config-route', {
      '../utils/utils': { getEditingSecret: getEditingSecretStub },
      '@sitecore-content-sdk/core/tools': { getEnforcedCorsHeaders: getEnforcedCorsHeadersStub },
    });

    route = EditingConfigRouteModule.createEditingConfigRoute({
      components: componentsMap,
      metadata,
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('GET handler', () => {
    it('should return 401 for invalid origin', async () => {
      getEnforcedCorsHeadersStub.returns(null);
      const event = createMockEvent(
        { origin: allowedOrigin },
        `/?${QUERY_PARAM_EDITING_SECRET}=${secret}`
      );
      const bodyPromise = readBody(event);

      await route.handle(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).to.equal(401);
      expect(body).to.equal(JSON.stringify({ message: 'Invalid origin' }));
      expect(event.node.res.getHeader('Content-Type')).to.equal('application/json');
    });

    it('should return 401 for missing editing secret', async () => {
      const event = createMockEvent({ origin: allowedOrigin }, '/');
      const bodyPromise = readBody(event);

      await route.handle(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).to.equal(401);
      expect(body).to.equal(JSON.stringify({ message: 'Missing or invalid editing secret' }));
      expect(event.node.res.getHeader('Content-Type')).to.equal('application/json');
    });

    it('should return 401 for invalid editing secret', async () => {
      const event = createMockEvent(
        { origin: allowedOrigin },
        `/?${QUERY_PARAM_EDITING_SECRET}=wrong-secret`
      );
      const bodyPromise = readBody(event);

      await route.handle(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).to.equal(401);
      expect(body).to.equal(JSON.stringify({ message: 'Missing or invalid editing secret' }));
      expect(event.node.res.getHeader('Content-Type')).to.equal('application/json');
    });

    it('should return 200 with config data for valid request', async () => {
      const event = createMockEvent(
        { origin: allowedOrigin },
        `/?${QUERY_PARAM_EDITING_SECRET}=${secret}`
      );
      const bodyPromise = readBody(event);

      await route.handle(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).to.equal(200);
      expect(body).to.equal(JSON.stringify(expectedResult));
      expect(event.node.res.getHeader('Content-Type')).to.equal('application/json');
      expect(event.node.res.getHeader('Access-Control-Allow-Origin')).to.equal(allowedOrigin);
      expect(event.node.res.getHeader('Access-Control-Allow-Methods')).to.equal(
        corsHeaders['Access-Control-Allow-Methods']
      );
      expect(event.node.res.getHeader('Access-Control-Allow-Headers')).to.equal(
        corsHeaders['Access-Control-Allow-Headers']
      );
    });

    it('should call getEnforcedCorsHeaders with correct parameters', async () => {
      const event = createMockEvent(
        { origin: allowedOrigin },
        `/?${QUERY_PARAM_EDITING_SECRET}=${secret}`
      );

      await route.handle(event);

      expect(getEnforcedCorsHeadersStub).to.have.been.calledOnce;
      const args = getEnforcedCorsHeadersStub.firstCall.args[0];
      expect(args.requestMethod).to.equal('GET');
      expect(args.headers.get('origin')).to.equal(allowedOrigin);
    });

    it('should return 500 for unexpected errors', async () => {
      getEditingSecretStub.throws(new Error('Unexpected error'));
      const event = createMockEvent(
        { origin: allowedOrigin },
        `/?${QUERY_PARAM_EDITING_SECRET}=${secret}`
      );
      const bodyPromise = readBody(event);

      await route.handle(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).to.equal(500);
      expect(body).to.equal('Internal Server Error');
    });
  });

  describe('component map handling', () => {
    it('should convert components map to array correctly', async () => {
      const customComponents = new Map();
      customComponents.set('Component1', {});
      customComponents.set('Component2', {});
      customComponents.set('Component3', {});

      const customRoute = EditingConfigRouteModule.createEditingConfigRoute({
        components: customComponents,
        metadata,
      });

      const event = createMockEvent(
        { origin: allowedOrigin },
        `/?${QUERY_PARAM_EDITING_SECRET}=${secret}`
      );
      const bodyPromise = readBody(event);

      await customRoute.handle(event);
      const body = JSON.parse(await bodyPromise);

      expect(event.node.res.statusCode).to.equal(200);
      expect(body.components).to.deep.equal(['Component1', 'Component2', 'Component3']);
      expect(body.framework).to.equal('nuxt');
      expect(body.clientComponents).to.deep.equal([]);
    });

    it('should include clientComponents in response when provided', async () => {
      const clientComponentsMap: ComponentMap<NuxtContentSdkComponent> = new Map();
      clientComponentsMap.set('ClientComponent1', {} as NuxtContentSdkComponent);
      clientComponentsMap.set('ClientComponent2', {} as NuxtContentSdkComponent);

      const customRoute = EditingConfigRouteModule.createEditingConfigRoute({
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

      expect(event.node.res.statusCode).to.equal(200);
      expect(body.framework).to.equal('nuxt');
      expect(body.clientComponents).to.deep.equal(['ClientComponent1', 'ClientComponent2']);
    });

    it('should return empty clientComponents array when not provided', async () => {
      const event = createMockEvent(
        { origin: allowedOrigin },
        `/?${QUERY_PARAM_EDITING_SECRET}=${secret}`
      );
      const bodyPromise = readBody(event);

      await route.handle(event);
      const body = JSON.parse(await bodyPromise);

      expect(event.node.res.statusCode).to.equal(200);
      expect(body.framework).to.equal('nuxt');
      expect(body.clientComponents).to.deep.equal([]);
    });
  });
});
