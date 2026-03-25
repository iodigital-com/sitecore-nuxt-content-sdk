import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import { createEvent, H3Event } from 'h3';
import { IncomingMessage, ServerResponse } from 'http';
import { PreviewMiddleware } from './preview-middleware';
import { PreviewCookies } from '../utils/editing-utils';

chai.use(sinonChai);
const expect = chai.expect;

const createMockEvent = (
  headers: Record<string, string> = {},
  cookies: Record<string, string> = {},
  path: string = '/'
): H3Event => {
  const req = new IncomingMessage(null as any);
  req.headers = headers;
  req.url = path;

  if (Object.keys(cookies).length) {
    req.headers.cookie = Object.entries(cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  const res = new ServerResponse(req);
  return createEvent(req, res);
};

describe('PreviewMiddleware', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should bypass cache when preview cookie is present', async () => {
    const middleware = new PreviewMiddleware({ sites: [] });
    const event = createMockEvent({}, { [PreviewCookies.PREVIEW]: 'true' });

    await middleware.handle(event);

    expect(event.node.res.getHeader('Cache-Control')).to.equal('no-store, must-revalidate');
  });

  it('should not bypass cache when preview cookie is absent', async () => {
    const middleware = new PreviewMiddleware({ sites: [] });
    const event = createMockEvent();

    await middleware.handle(event);

    expect(event.node.res.getHeader('Cache-Control')).to.equal(undefined);
  });

  it('should skip when path is an API route', async () => {
    const middleware = new PreviewMiddleware({ sites: [] });
    const event = createMockEvent({}, { [PreviewCookies.PREVIEW]: 'true' }, '/api/editing/config');

    await middleware.handle(event);

    expect(event.node.res.getHeader('Cache-Control')).to.equal(undefined);
  });

  it('should skip when path is a Nuxt internal route', async () => {
    const middleware = new PreviewMiddleware({ sites: [] });
    const event = createMockEvent({}, { [PreviewCookies.PREVIEW]: 'true' }, '/_nuxt/webpack');

    await middleware.handle(event);

    expect(event.node.res.getHeader('Cache-Control')).to.equal(undefined);
  });

  it('should skip when custom skip function returns true', async () => {
    const middleware = new PreviewMiddleware({
      sites: [],
      skip: (event: H3Event) => event.path === '/skip-me',
    });
    const event = createMockEvent({}, { [PreviewCookies.PREVIEW]: 'true' }, '/skip-me');

    await middleware.handle(event);

    expect(event.node.res.getHeader('Cache-Control')).to.equal(undefined);
  });

  it('should catch errors and log them without throwing', async () => {
    const middleware = new PreviewMiddleware({ sites: [] });
    const consoleErrorStub = sandbox.stub(console, 'error');
    const event = createMockEvent({}, { [PreviewCookies.PREVIEW]: 'true' });

    sandbox.stub(middleware as any, 'bypassCache').throws(new Error('Unexpected failure'));

    await middleware.handle(event);

    expect(consoleErrorStub.called).to.equal(true);
  });
});
