/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import { createEvent, H3Event } from 'h3';
import { IncomingMessage, ServerResponse } from 'http';
import {
  EDITING_ALLOWED_ORIGINS,
  QUERY_PARAM_EDITING_SECRET,
  INVALID_SECRET_HTML_MESSAGE,
  DesignLibraryMode,
  PREVIEW_KEY,
} from '@sitecore-content-sdk/content/editing';
import { SITE_KEY } from '@sitecore-content-sdk/content/site';

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

const buildPath = (params: Record<string, string>) => {
  const searchParams = new URLSearchParams(params);
  return `/?${searchParams.toString()}`;
};

describe('createEditingRenderRoute', () => {
  const sandbox = sinon.createSandbox();
  let editingRenderRouteModule: any;
  let getEditingSecretStub: sinon.SinonStub;
  let getEnforcedCorsHeadersStub: sinon.SinonStub;
  let getEditingRequestHtmlStub: sinon.SinonStub;
  let resolveServerUrlStub: sinon.SinonStub;
  let getHeadersForPropagationStub: sinon.SinonStub;
  let getRequiredQueryParamsStub: sinon.SinonStub;
  let getCSPHeaderStub: sinon.SinonStub;
  let getAllowedQueryParamsStub: sinon.SinonStub;
  let getPreviewCookiesStub: sinon.SinonStub;
  let mapEditingParamsStub: sinon.SinonStub;
  let proxyRequestStub: sinon.SinonStub;
  let handlers: any;

  const allowedOrigin = 'https://allowed.com';
  const secret = 'secret1234';

  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE, PUT, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  const defaultQuery = {
    [QUERY_PARAM_EDITING_SECRET]: secret,
    mode: 'edit',
    route: '/styleguide',
    sc_itemid: '{11111111-1111-1111-1111-111111111111}',
    sc_lang: 'en',
    sc_site: 'website',
    sc_variant: 'dev',
    sc_version: 'latest',
    sc_layoutKind: 'shared',
  };

  beforeEach(() => {
    getEditingSecretStub = sandbox.stub().returns(secret);
    getEnforcedCorsHeadersStub = sandbox.stub().returns(corsHeaders);
    getEditingRequestHtmlStub = sandbox.stub().resolves('<div>some html</div>');
    resolveServerUrlStub = sandbox.stub().returns('http://localhost:3000');
    getHeadersForPropagationStub = sandbox.stub().returns({});
    getRequiredQueryParamsStub = sandbox.stub().returns(['sc_itemid', 'sc_lang', 'route', 'mode']);
    getCSPHeaderStub = sandbox
      .stub()
      .returns(`frame-ancestors 'self' ${allowedOrigin} ${EDITING_ALLOWED_ORIGINS.join(' ')}`);
    getAllowedQueryParamsStub = sandbox.stub().returns({
      missingAllowedParams: [],
      allowedQueryParams: {},
    });
    getPreviewCookiesStub = sandbox
      .stub()
      .returns([
        `${SITE_KEY}=website; Path=/; HttpOnly; SameSite=None; Secure`,
        `${PREVIEW_KEY}=true; Path=/; HttpOnly; SameSite=None; Secure`,
      ]);
    mapEditingParamsStub = sandbox.stub().callsFake((query: any) => ({
      itemId: query.sc_itemid,
      language: query.sc_lang,
      site: query.sc_site,
      mode: query.mode,
      variantIds: query.sc_variant,
      version: query.sc_version,
      layoutKind: query.sc_layoutKind,
    }));
    proxyRequestStub = sandbox.stub().callsFake(async (event: H3Event) => {
      event.node.res.end('');
    });

    editingRenderRouteModule = proxyquire('./editing-render-route', {
      '../utils/utils': { getEditingSecret: getEditingSecretStub },
      '@sitecore-content-sdk/core/tools': { getEnforcedCorsHeaders: getEnforcedCorsHeadersStub },
      '../utils/editing-utils': {
        getEditingRequestHtml: getEditingRequestHtmlStub,
        getHeadersForPropagation: getHeadersForPropagationStub,
        getRequiredEditingParamsList: getRequiredQueryParamsStub,
        getCSPHeader: getCSPHeaderStub,
        resolveServerUrl: resolveServerUrlStub,
        getAllowedQueryParams: getAllowedQueryParamsStub,
        getPreviewCookies: getPreviewCookiesStub,
        mapEditingParams: mapEditingParamsStub,
      },
      '@sitecore-content-sdk/core': {
        NativeDataFetcher: sandbox.stub().returns({}),
      },
      h3: {
        ...require('h3'),
        proxyRequest: proxyRequestStub,
      },
    });

    handlers = editingRenderRouteModule.createEditingRenderRoute({});
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('GET handler', () => {
    it('should return 401 for invalid origin', async () => {
      getEnforcedCorsHeadersStub.returns(null);
      const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));
      const bodyPromise = readBody(event);

      await handlers.handleGet(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).to.equal(401);
      expect(body).to.include('not allowed');
    });

    it('should return 401 for invalid editing secret', async () => {
      const event = createMockEvent(
        { origin: allowedOrigin },
        buildPath({ ...defaultQuery, [QUERY_PARAM_EDITING_SECRET]: 'wrong-secret' })
      );
      const bodyPromise = readBody(event);

      await handlers.handleGet(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).to.equal(401);
      expect(JSON.parse(body).html).to.equal(INVALID_SECRET_HTML_MESSAGE);
    });

    it('should return 401 for missing editing secret', async () => {
      const { [QUERY_PARAM_EDITING_SECRET]: _, ...queryWithoutSecret } = defaultQuery;
      const event = createMockEvent({ origin: allowedOrigin }, buildPath(queryWithoutSecret));
      const bodyPromise = readBody(event);

      await handlers.handleGet(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).to.equal(401);
      expect(JSON.parse(body).html).to.equal(INVALID_SECRET_HTML_MESSAGE);
    });

    it('should return 400 for missing required query parameters', async () => {
      const event = createMockEvent(
        { origin: allowedOrigin },
        buildPath({ [QUERY_PARAM_EDITING_SECRET]: secret, sc_site: 'website' })
      );
      const bodyPromise = readBody(event);

      await handlers.handleGet(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).to.equal(400);
      expect(JSON.parse(body).html).to.equal(
        '<html><body>Missing required query parameters: sc_itemid, sc_lang, route, mode</body></html>'
      );
    });

    it('should handle successful request', async () => {
      const mockHtml =
        '<html><head><title>Test Page</title></head><body><div>some html content</div></body></html>';
      getEditingRequestHtmlStub.resolves(mockHtml);

      const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));
      const bodyPromise = readBody(event);

      await handlers.handleGet(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).to.equal(200);
      expect(body).to.equal(mockHtml);
      expect(event.node.res.getHeader('Content-Type')).to.equal('text/html; charset=utf-8');
      expect(event.node.res.getHeader('Content-Security-Policy')).to.include('frame-ancestors');
    });

    it('should launch internal request and pass preview data as search params', async () => {
      const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));
      const bodyPromise = readBody(event);

      getHeadersForPropagationStub.returns({
        authorization: 'Bearer token123',
        cookie: 'test=value',
      });

      await handlers.handleGet(event);
      await bodyPromise;

      expect(getEditingRequestHtmlStub).to.have.been.calledOnce;

      const [requestUrl, propagatedQsParams, propagatedHeaders] =
        getEditingRequestHtmlStub.firstCall.args;

      expect(requestUrl).to.be.instanceOf(URL);
      expect(requestUrl.pathname).to.equal('/styleguide');
      expect(requestUrl.origin).to.equal('http://localhost:3000');

      expect(propagatedQsParams).to.deep.include({
        itemId: defaultQuery.sc_itemid,
        language: defaultQuery.sc_lang,
        site: defaultQuery.sc_site,
        mode: defaultQuery.mode,
        variantIds: defaultQuery.sc_variant,
        version: defaultQuery.sc_version,
        layoutKind: defaultQuery.sc_layoutKind,
      });

      expect(propagatedHeaders).to.deep.equal({
        authorization: 'Bearer token123',
        cookie: 'test=value',
      });
    });

    it('should construct request URL with route for internal request', async () => {
      const testRoute = '/products/category/item';
      resolveServerUrlStub.returns('https://my-app.example.com:8080');

      const event = createMockEvent(
        { origin: allowedOrigin },
        buildPath({ ...defaultQuery, route: testRoute })
      );
      const bodyPromise = readBody(event);

      await handlers.handleGet(event);
      await bodyPromise;

      const [requestUrl] = getEditingRequestHtmlStub.firstCall.args;
      expect(requestUrl.toString()).to.equal(
        'https://my-app.example.com:8080/products/category/item'
      );
      expect(requestUrl.protocol).to.equal('https:');
      expect(requestUrl.hostname).to.equal('my-app.example.com');
      expect(requestUrl.port).to.equal('8080');
      expect(requestUrl.pathname).to.equal(testRoute);
    });

    it('should use custom resolvePageUrl', async () => {
      handlers = editingRenderRouteModule.createEditingRenderRoute({
        resolvePageUrl: (itemPath: string) => `/custom/path${itemPath}`,
      });

      const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));
      const bodyPromise = readBody(event);

      await handlers.handleGet(event);
      await bodyPromise;

      const [requestUrl] = getEditingRequestHtmlStub.firstCall.args;
      expect(requestUrl.pathname).to.equal('/custom/path/styleguide');
    });

    it('should handle request with special characters in route', async () => {
      const event = createMockEvent(
        { origin: allowedOrigin },
        buildPath({ ...defaultQuery, route: '/Åbout' })
      );
      const bodyPromise = readBody(event);

      await handlers.handleGet(event);
      await bodyPromise;

      expect(event.node.res.statusCode).to.equal(200);
      const [requestUrl] = getEditingRequestHtmlStub.firstCall.args;
      expect(requestUrl.pathname).to.equal('/%C3%85bout');
    });

    it('should set preview cookies for preview mode', async () => {
      const event = createMockEvent(
        { origin: allowedOrigin },
        buildPath({ ...defaultQuery, mode: 'preview' })
      );
      const bodyPromise = readBody(event);

      await handlers.handleGet(event);
      await bodyPromise;

      expect(event.node.res.statusCode).to.equal(200);
      expect(getPreviewCookiesStub).to.have.been.calledWith('website');

      const [, , , cookies] = getEditingRequestHtmlStub.firstCall.args;
      expect(cookies).to.include(`${PREVIEW_KEY}=true; Path=/; HttpOnly; SameSite=None; Secure`);
      expect(cookies).to.include(`${SITE_KEY}=website; Path=/; HttpOnly; SameSite=None; Secure`);
    });

    it('should not set preview cookies for non-preview mode', async () => {
      const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));
      const bodyPromise = readBody(event);

      await handlers.handleGet(event);
      await bodyPromise;

      expect(getPreviewCookiesStub).to.not.have.been.called;
    });

    it('should handle request failure with redirect fallback', async () => {
      getEditingRequestHtmlStub.rejects(new Error('Request failed'));

      const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));
      const bodyPromise = readBody(event);

      await handlers.handleGet(event);
      await bodyPromise;

      expect(event.node.res.statusCode).to.equal(307);
      expect(event.node.res.getHeader('Location')).to.equal('/styleguide');
    });

    it('should set Content-Security-Policy header', async () => {
      const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));
      const bodyPromise = readBody(event);

      await handlers.handleGet(event);
      await bodyPromise;

      expect(getCSPHeaderStub).to.have.been.calledOnce;
      expect(event.node.res.getHeader('Content-Security-Policy')).to.equal(
        `frame-ancestors 'self' ${allowedOrigin} ${EDITING_ALLOWED_ORIGINS.join(' ')}`
      );
    });

    it('should set correct CORS headers', async () => {
      const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));
      const bodyPromise = readBody(event);

      await handlers.handleGet(event);
      await bodyPromise;

      expect(event.node.res.getHeader('Access-Control-Allow-Origin')).to.equal(allowedOrigin);
      expect(event.node.res.getHeader('Access-Control-Allow-Methods')).to.equal(
        corsHeaders['Access-Control-Allow-Methods']
      );
      expect(event.node.res.getHeader('Access-Control-Allow-Headers')).to.equal(
        corsHeaders['Access-Control-Allow-Headers']
      );
    });

    it('should call getEnforcedCorsHeaders with correct parameters', async () => {
      const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));
      const bodyPromise = readBody(event);

      await handlers.handleGet(event);
      await bodyPromise;

      expect(getEnforcedCorsHeadersStub).to.have.been.calledOnce;
      const args = getEnforcedCorsHeadersStub.firstCall.args[0];
      expect(args.requestMethod).to.equal('GET');
      expect(args.headers.get('origin')).to.equal(allowedOrigin);
      expect(args.allowedOrigins).to.deep.equal(EDITING_ALLOWED_ORIGINS);
    });

    describe('allowedQueryParams configuration', () => {
      it('should not include additional query params when allowedQueryParams is not configured', async () => {
        getAllowedQueryParamsStub.returns({
          missingAllowedParams: [],
          allowedQueryParams: {},
        });

        const event = createMockEvent(
          { origin: allowedOrigin },
          buildPath({ ...defaultQuery, customParam1: 'value1', customParam2: 'value2' })
        );
        const bodyPromise = readBody(event);

        await handlers.handleGet(event);
        await bodyPromise;

        expect(event.node.res.statusCode).to.equal(200);
        expect(getAllowedQueryParamsStub).to.have.been.called;
      });

      it('should include allowed query params when configured as array', async () => {
        handlers = editingRenderRouteModule.createEditingRenderRoute({
          allowedQueryParams: [{ name: 'customParam1' }, { name: 'customParam2' }, 'stringParam'],
        });

        getAllowedQueryParamsStub.returns({
          missingAllowedParams: [],
          allowedQueryParams: {
            customParam1: 'value1',
            customParam2: 'value2',
            stringParam: 'string-value',
          },
        });

        const event = createMockEvent(
          { origin: allowedOrigin },
          buildPath({ ...defaultQuery, customParam1: 'value1', customParam2: 'value2' })
        );
        const bodyPromise = readBody(event);

        await handlers.handleGet(event);
        await bodyPromise;

        expect(event.node.res.statusCode).to.equal(200);
        expect(getAllowedQueryParamsStub).to.have.been.calledWith(
          sinon.match.any,
          sinon.match.array
        );
      });

      it('should return 400 when required allowed query param is missing', async () => {
        handlers = editingRenderRouteModule.createEditingRenderRoute({
          allowedQueryParams: [{ name: 'customParam1', required: true }],
        });

        getAllowedQueryParamsStub.returns({
          missingAllowedParams: ['customParam1'],
          allowedQueryParams: {},
        });

        const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));
        const bodyPromise = readBody(event);

        await handlers.handleGet(event);
        const body = await bodyPromise;

        expect(event.node.res.statusCode).to.equal(400);
        expect(JSON.parse(body).html).to.equal(
          '<html><body>Missing required query parameters: customParam1</body></html>'
        );
      });

      it('should combine missing required editing params and missing required allowed params in error message', async () => {
        handlers = editingRenderRouteModule.createEditingRenderRoute({
          allowedQueryParams: [{ name: 'requiredAllowedParam', required: true }],
        });

        getAllowedQueryParamsStub.returns({
          missingAllowedParams: ['requiredAllowedParam'],
          allowedQueryParams: {},
        });

        const event = createMockEvent(
          { origin: allowedOrigin },
          buildPath({ [QUERY_PARAM_EDITING_SECRET]: secret, sc_site: 'website' })
        );
        const bodyPromise = readBody(event);

        await handlers.handleGet(event);
        const body = await bodyPromise;

        expect(event.node.res.statusCode).to.equal(400);
        const responseBody = JSON.parse(body);
        expect(responseBody.html).to.include('sc_itemid');
        expect(responseBody.html).to.include('sc_lang');
        expect(responseBody.html).to.include('route');
        expect(responseBody.html).to.include('mode');
        expect(responseBody.html).to.include('requiredAllowedParam');
      });

      it('should pass allowed query params to getEditingRequestHtml', async () => {
        handlers = editingRenderRouteModule.createEditingRenderRoute({
          allowedQueryParams: [{ name: 'customParam1' }, { name: 'customParam2' }],
        });

        getAllowedQueryParamsStub.returns({
          missingAllowedParams: [],
          allowedQueryParams: {
            customParam1: 'value1',
            customParam2: 'value2',
          },
        });

        const event = createMockEvent(
          { origin: allowedOrigin },
          buildPath({ ...defaultQuery, customParam1: 'value1', customParam2: 'value2' })
        );
        const bodyPromise = readBody(event);

        await handlers.handleGet(event);
        await bodyPromise;

        const [, propagatedQsParams] = getEditingRequestHtmlStub.firstCall.args;
        expect(propagatedQsParams).to.include({
          customParam1: 'value1',
          customParam2: 'value2',
        });
      });

      it('should use resolver function for allowedQueryParams', async () => {
        handlers = editingRenderRouteModule.createEditingRenderRoute({
          allowedQueryParams: (keys: string[]) => keys.filter((k) => k.startsWith('prefixed')),
        });

        getAllowedQueryParamsStub.returns({
          missingAllowedParams: [],
          allowedQueryParams: { prefixedParam1: 'value1' },
        });

        const event = createMockEvent(
          { origin: allowedOrigin },
          buildPath({ ...defaultQuery, prefixedParam1: 'value1' })
        );
        const bodyPromise = readBody(event);

        await handlers.handleGet(event);
        await bodyPromise;

        expect(getAllowedQueryParamsStub).to.have.been.calledWith(
          sinon.match.any,
          sinon.match.func
        );
      });
    });

    describe('Design Library handling', () => {
      it('should handle request with mode=library', async () => {
        const mockLibraryHtml =
          '<html><head><title>Design Library</title></head><body><div class="component-library">Library Content</div></body></html>';
        getEditingRequestHtmlStub.resolves(mockLibraryHtml);

        const event = createMockEvent(
          { origin: allowedOrigin },
          buildPath({
            [QUERY_PARAM_EDITING_SECRET]: secret,
            mode: DesignLibraryMode.Normal,
            sc_itemid: '{11111111-1111-1111-1111-111111111111}',
            sc_lang: 'en',
            sc_site: 'website',
            route: '/components',
            sc_renderingId: '123',
            sc_uid: '789',
          })
        );
        const bodyPromise = readBody(event);

        await handlers.handleGet(event);
        const body = await bodyPromise;

        expect(event.node.res.statusCode).to.equal(200);
        expect(body).to.equal(mockLibraryHtml);
        expect(body).to.include('Design Library');
        expect(body).to.include('component-library');
      });

      it('should handle request with mode=library-metadata', async () => {
        const mockMetadataHtml =
          '<html><head><title>Component Metadata</title></head><body><div class="metadata-view"></div></body></html>';
        getEditingRequestHtmlStub.resolves(mockMetadataHtml);

        const event = createMockEvent(
          { origin: allowedOrigin },
          buildPath({
            [QUERY_PARAM_EDITING_SECRET]: secret,
            mode: DesignLibraryMode.Metadata,
            sc_itemid: '{11111111-1111-1111-1111-111111111111}',
            sc_lang: 'en',
            sc_site: 'website',
            route: '/components',
            sc_renderingId: '123',
            sc_uid: '789',
          })
        );
        const bodyPromise = readBody(event);

        await handlers.handleGet(event);
        const body = await bodyPromise;

        expect(event.node.res.statusCode).to.equal(200);
        expect(body).to.equal(mockMetadataHtml);
        expect(body).to.include('Component Metadata');
      });
    });

    describe('multiple variant handling', () => {
      it('should handle multiple variant ids', async () => {
        const event = createMockEvent(
          { origin: allowedOrigin },
          buildPath({ ...defaultQuery, sc_variant: 'id-1,id-2,id-3' })
        );
        const bodyPromise = readBody(event);

        await handlers.handleGet(event);
        await bodyPromise;

        expect(event.node.res.statusCode).to.equal(200);
      });
    });

    describe('internal server request host resolution', () => {
      it('should use resolveServerUrl for making internal request', async () => {
        resolveServerUrlStub.returns('http://some-other-host:8080');

        const event = createMockEvent(
          { origin: allowedOrigin, host: 'some-other-host:8080' },
          buildPath(defaultQuery)
        );
        const bodyPromise = readBody(event);

        await handlers.handleGet(event);
        await bodyPromise;

        expect(resolveServerUrlStub).to.have.been.calledOnce;
        const [requestUrl] = getEditingRequestHtmlStub.firstCall.args;
        expect(requestUrl.origin).to.equal('http://some-other-host:8080');
      });
    });
  });

  describe('POST handler', () => {
    const defaultPostQuery = {
      [QUERY_PARAM_EDITING_SECRET]: secret,
      mode: 'edit',
      route: '/styleguide',
      sc_itemid: '{11111111-1111-1111-1111-111111111111}',
      sc_lang: 'en',
      sc_site: 'website',
      sc_variant: 'dev',
      sc_version: 'latest',
      sc_layoutKind: 'shared',
    };

    const createPostEvent = (headers: Record<string, string> = {}, path: string = '/'): H3Event => {
      const req = new IncomingMessage(null as any);
      req.headers = headers;
      req.url = path;
      req.method = 'POST';
      const res = new ServerResponse(req);
      return createEvent(req, res);
    };

    it('should return 401 for invalid origin', async () => {
      getEnforcedCorsHeadersStub.returns(null);

      const event = createPostEvent(
        { origin: allowedOrigin, host: 'some-other-host' },
        buildPath(defaultPostQuery)
      );
      const bodyPromise = readBody(event);

      await handlers.handlePost(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).to.equal(401);
      expect(body).to.include('not allowed');
    });

    it('should allow request when host is localhost', async () => {
      getEnforcedCorsHeadersStub.returns(null);

      const event = createPostEvent(
        { origin: allowedOrigin, host: 'localhost:3000' },
        buildPath(defaultPostQuery)
      );
      const bodyPromise = readBody(event);

      await handlers.handlePost(event);
      await bodyPromise;

      expect(proxyRequestStub).to.have.been.calledOnce;
    });

    it('should allow request when request host matches origin host', async () => {
      getEnforcedCorsHeadersStub.returns(null);

      const event = createPostEvent(
        { origin: 'https://some-url', host: 'some-url' },
        buildPath(defaultPostQuery)
      );
      const bodyPromise = readBody(event);

      await handlers.handlePost(event);
      await bodyPromise;

      expect(proxyRequestStub).to.have.been.calledOnce;
    });

    it('should return 401 for invalid editing secret', async () => {
      const event = createPostEvent(
        { origin: allowedOrigin, host: 'some-other-host' },
        buildPath({ ...defaultPostQuery, [QUERY_PARAM_EDITING_SECRET]: 'wrong-secret' })
      );
      const bodyPromise = readBody(event);

      await handlers.handlePost(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).to.equal(401);
      expect(JSON.parse(body).html).to.equal(INVALID_SECRET_HTML_MESSAGE);
    });

    it('should return 401 for missing editing secret', async () => {
      const { [QUERY_PARAM_EDITING_SECRET]: _, ...queryWithoutSecret } = defaultPostQuery;

      const event = createPostEvent(
        { origin: allowedOrigin, host: 'some-other-host' },
        buildPath(queryWithoutSecret)
      );
      const bodyPromise = readBody(event);

      await handlers.handlePost(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).to.equal(401);
      expect(JSON.parse(body).html).to.equal(INVALID_SECRET_HTML_MESSAGE);
    });

    it('should proxy POST request to correct target URL with mapped query params', async () => {
      const event = createPostEvent(
        { origin: allowedOrigin, host: 'some-other-host' },
        buildPath(defaultPostQuery)
      );
      const bodyPromise = readBody(event);

      await handlers.handlePost(event);
      await bodyPromise;

      expect(proxyRequestStub).to.have.been.calledOnce;

      const targetUrl = new URL(proxyRequestStub.firstCall.args[1]);
      expect(targetUrl.searchParams.get('itemId')).to.equal(defaultPostQuery.sc_itemid);
      expect(targetUrl.searchParams.get('language')).to.equal(defaultPostQuery.sc_lang);
      expect(targetUrl.searchParams.get('site')).to.equal(defaultPostQuery.sc_site);
      expect(targetUrl.searchParams.get('mode')).to.equal(defaultPostQuery.mode);
      expect(targetUrl.searchParams.get('variantIds')).to.equal(defaultPostQuery.sc_variant);
      expect(targetUrl.searchParams.get('version')).to.equal(defaultPostQuery.sc_version);
      expect(targetUrl.searchParams.get('layoutKind')).to.equal(defaultPostQuery.sc_layoutKind);
      expect(targetUrl.searchParams.get('timestamp')).to.not.be.null;
    });

    it('should set preview cookies on the request before proxying', async () => {
      const event = createPostEvent(
        { origin: allowedOrigin, host: 'some-other-host' },
        buildPath(defaultPostQuery)
      );
      const bodyPromise = readBody(event);

      await handlers.handlePost(event);
      await bodyPromise;

      expect(getPreviewCookiesStub).to.have.been.calledWith(defaultPostQuery.sc_site);
      expect(proxyRequestStub).to.have.been.calledOnce;
    });

    it('should append preview cookies to existing cookie header', async () => {
      const event = createPostEvent(
        { origin: allowedOrigin, host: 'some-other-host', cookie: 'existing=cookie' },
        buildPath(defaultPostQuery)
      );
      const bodyPromise = readBody(event);

      await handlers.handlePost(event);
      await bodyPromise;

      expect(proxyRequestStub).to.have.been.calledOnce;
      const cookieHeader = event.node.res.getHeader('cookie') as string;
      expect(cookieHeader).to.include('existing=cookie');
      expect(cookieHeader).to.include(PREVIEW_KEY);
      expect(cookieHeader).to.include(SITE_KEY);
    });

    it('should set Content-Security-Policy header', async () => {
      const event = createPostEvent(
        { origin: allowedOrigin, host: 'some-other-host' },
        buildPath(defaultPostQuery)
      );
      const bodyPromise = readBody(event);

      await handlers.handlePost(event);
      await bodyPromise;

      expect(getCSPHeaderStub).to.have.been.calledOnce;
      expect(event.node.res.getHeader('Content-Security-Policy')).to.equal(
        `frame-ancestors 'self' ${allowedOrigin} ${EDITING_ALLOWED_ORIGINS.join(' ')}`
      );
    });

    it('should set CORS headers on the response', async () => {
      const event = createPostEvent(
        { origin: allowedOrigin, host: 'some-other-host' },
        buildPath(defaultPostQuery)
      );
      const bodyPromise = readBody(event);

      await handlers.handlePost(event);
      await bodyPromise;

      expect(event.node.res.getHeader('Access-Control-Allow-Origin')).to.equal(allowedOrigin);
      expect(event.node.res.getHeader('Access-Control-Allow-Methods')).to.equal(
        corsHeaders['Access-Control-Allow-Methods']
      );
    });

    describe('allowedQueryParams for POST', () => {
      it('should include allowed query params in proxied target URL', async () => {
        handlers = editingRenderRouteModule.createEditingRenderRoute({
          allowedQueryParams: [{ name: 'customParam1' }, { name: 'customParam2' }],
        });

        getAllowedQueryParamsStub.returns({
          missingAllowedParams: [],
          allowedQueryParams: {
            customParam1: 'value1',
            customParam2: 'value2',
          },
        });

        const event = createPostEvent(
          { origin: allowedOrigin, host: 'some-other-host' },
          buildPath({ ...defaultPostQuery, customParam1: 'value1', customParam2: 'value2' })
        );
        const bodyPromise = readBody(event);

        await handlers.handlePost(event);
        await bodyPromise;

        expect(proxyRequestStub).to.have.been.calledOnce;
        const targetUrl = new URL(proxyRequestStub.firstCall.args[1]);
        expect(targetUrl.searchParams.get('customParam1')).to.equal('value1');
        expect(targetUrl.searchParams.get('customParam2')).to.equal('value2');
      });

      it('should use resolver function for allowedQueryParams in POST', async () => {
        handlers = editingRenderRouteModule.createEditingRenderRoute({
          allowedQueryParams: (keys: string[]) => keys.filter((k) => k.startsWith('prefixed')),
        });

        getAllowedQueryParamsStub.returns({
          missingAllowedParams: [],
          allowedQueryParams: { prefixedParam1: 'value1' },
        });

        const event = createPostEvent(
          { origin: allowedOrigin, host: 'some-other-host' },
          buildPath({ ...defaultPostQuery, prefixedParam1: 'value1' })
        );
        const bodyPromise = readBody(event);

        await handlers.handlePost(event);
        await bodyPromise;

        expect(getAllowedQueryParamsStub).to.have.been.calledWith(
          sinon.match.any,
          sinon.match.func
        );
      });

      it('should handle empty allowedQueryParams from resolver in POST', async () => {
        handlers = editingRenderRouteModule.createEditingRenderRoute({
          allowedQueryParams: () => [],
        });

        getAllowedQueryParamsStub.returns({
          missingAllowedParams: [],
          allowedQueryParams: {},
        });

        const event = createPostEvent(
          { origin: allowedOrigin, host: 'some-other-host' },
          buildPath(defaultPostQuery)
        );
        const bodyPromise = readBody(event);

        await handlers.handlePost(event);
        await bodyPromise;

        expect(proxyRequestStub).to.have.been.calledOnce;
      });
    });
  });

  describe('Design Library handling', () => {
    it('should handle request with mode=library', async () => {
      const mockLibraryHtml =
        '<html><head><title>Design Library</title></head><body><div class="component-library">Library Content</div></body></html>';
      getEditingRequestHtmlStub.resolves(mockLibraryHtml);

      const event = createMockEvent(
        { origin: allowedOrigin },
        buildPath({
          [QUERY_PARAM_EDITING_SECRET]: secret,
          mode: DesignLibraryMode.Normal,
          sc_itemid: '{11111111-1111-1111-1111-111111111111}',
          sc_lang: 'en',
          sc_site: 'website',
          route: '/components',
          sc_renderingId: '123',
          sc_uid: '789',
        })
      );
      const bodyPromise = readBody(event);

      await handlers.handleGet(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).to.equal(200);
      expect(body).to.equal(mockLibraryHtml);
      expect(body).to.include('Design Library');
      expect(body).to.include('component-library');
      expect(body).to.include('Library Content');
    });

    it('should handle request with mode=library-metadata', async () => {
      const mockMetadataHtml =
        '<html><head><title>Component Metadata</title></head><body><div class="metadata-view"><script type="application/json">{"componentId":"123","metadata":{}}</script></div></body></html>';
      getEditingRequestHtmlStub.resolves(mockMetadataHtml);

      const event = createMockEvent(
        { origin: allowedOrigin },
        buildPath({
          [QUERY_PARAM_EDITING_SECRET]: secret,
          mode: DesignLibraryMode.Metadata,
          sc_itemid: '{11111111-1111-1111-1111-111111111111}',
          sc_lang: 'en',
          sc_site: 'website',
          route: '/components',
          sc_renderingId: '123',
          sc_uid: '789',
        })
      );
      const bodyPromise = readBody(event);

      await handlers.handleGet(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).to.equal(200);
      expect(body).to.equal(mockMetadataHtml);
      expect(body).to.include('Component Metadata');
      expect(body).to.include('metadata-view');
      expect(body).to.include('componentId');
    });
  });

  describe('Sitecore Preview handling', () => {
    it('should handle preview request', async () => {
      const mockPreviewHtml =
        '<html><head><title>Preview Mode</title><meta name="preview" content="true"></head><body><div class="preview-content">Preview page content</div></body></html>';
      getEditingRequestHtmlStub.resolves(mockPreviewHtml);

      const event = createMockEvent(
        { origin: allowedOrigin },
        buildPath({
          [QUERY_PARAM_EDITING_SECRET]: secret,
          mode: 'preview',
          route: '/styleguide',
          sc_itemid: '{11111111-1111-1111-1111-111111111111}',
          sc_lang: 'en',
          sc_site: 'website',
          sc_variant: 'dev',
          sc_version: 'latest',
          sc_layoutKind: 'final',
        })
      );
      const bodyPromise = readBody(event);

      await handlers.handleGet(event);
      const body = await bodyPromise;

      expect(event.node.res.statusCode).to.equal(200);
      expect(body).to.equal(mockPreviewHtml);
      expect(event.node.res.getHeader('Content-Type')).to.equal('text/html; charset=utf-8');
      expect(getPreviewCookiesStub).to.have.been.calledWith('website');

      const [, , , cookies] = getEditingRequestHtmlStub.firstCall.args;
      expect(cookies).to.include(`${PREVIEW_KEY}=true; Path=/; HttpOnly; SameSite=None; Secure`);
      expect(cookies).to.include(`${SITE_KEY}=website; Path=/; HttpOnly; SameSite=None; Secure`);

      expect(body).to.include('Preview Mode');
      expect(body).to.include('name="preview"');
      expect(body).to.include('preview-content');
      expect(body).to.include('Preview page content');
    });
  });

  describe('internal server request host resolution', () => {
    it('should use resolveServerUrl for making internal request', async () => {
      resolveServerUrlStub.returns('http://some-other-host:8080');

      const event = createMockEvent(
        { origin: allowedOrigin, host: 'some-other-host:8080' },
        buildPath(defaultQuery)
      );
      const bodyPromise = readBody(event);

      await handlers.handleGet(event);
      await bodyPromise;

      expect(resolveServerUrlStub).to.have.been.calledOnce;
      const [requestUrl] = getEditingRequestHtmlStub.firstCall.args;
      expect(requestUrl.origin).to.equal('http://some-other-host:8080');
    });

    it('should use custom sitecoreInternalEditingHostUrl if provided', async () => {
      const customHost = 'http://custom-internal-host:9000';
      const customHandlers = editingRenderRouteModule.createEditingRenderRoute({
        sitecoreInternalEditingHostUrl: customHost,
      });

      resolveServerUrlStub.returns(customHost);

      const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));
      const bodyPromise = readBody(event);

      await customHandlers.handleGet(event);
      await bodyPromise;

      const [requestUrl] = getEditingRequestHtmlStub.firstCall.args;
      expect(requestUrl.origin).to.equal(customHost);
    });
  });

  describe('multiple variant handling', () => {
    it('should handle multiple variant ids', async () => {
      const event = createMockEvent(
        { origin: allowedOrigin },
        buildPath({ ...defaultQuery, sc_variant: 'id-1,id-2,id-3' })
      );
      const bodyPromise = readBody(event);

      await handlers.handleGet(event);
      await bodyPromise;

      expect(event.node.res.statusCode).to.equal(200);
    });
  });

  describe('CORS handling', () => {
    it('should set correct CORS headers on GET response', async () => {
      const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));
      const bodyPromise = readBody(event);

      await handlers.handleGet(event);
      await bodyPromise;

      expect(event.node.res.getHeader('Access-Control-Allow-Origin')).to.equal(allowedOrigin);
      expect(event.node.res.getHeader('Access-Control-Allow-Methods')).to.equal(
        corsHeaders['Access-Control-Allow-Methods']
      );
      expect(event.node.res.getHeader('Access-Control-Allow-Headers')).to.equal(
        corsHeaders['Access-Control-Allow-Headers']
      );
    });

    it('should handle multiple allowed origins', async () => {
      process.env.JSS_ALLOWED_ORIGINS = 'https://allowed.com,https://anotherallowed.com';
      getCSPHeaderStub.returns(
        `frame-ancestors 'self' https://allowed.com https://anotherallowed.com ${EDITING_ALLOWED_ORIGINS.join(
          ' '
        )}`
      );

      const event = createMockEvent({ origin: allowedOrigin }, buildPath(defaultQuery));
      const bodyPromise = readBody(event);

      await handlers.handleGet(event);
      await bodyPromise;

      expect(getCSPHeaderStub).to.have.been.calledOnce;
      expect(event.node.res.getHeader('Content-Security-Policy')).to.include(
        'https://anotherallowed.com'
      );

      delete process.env.JSS_ALLOWED_ORIGINS;
    });
  });
});
