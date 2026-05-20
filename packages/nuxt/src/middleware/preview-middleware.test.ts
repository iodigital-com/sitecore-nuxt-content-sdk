import { describe, it, expect, afterEach, vi } from 'vitest';
import { mockEvent, H3Event } from 'h3';
import { PreviewMiddleware } from './preview-middleware';
import { PreviewCookies } from '../utils/editing-utils';

const createMockEvent = (
  headers: Record<string, string> = {},
  cookies: Record<string, string> = {},
  path: string = '/'
): H3Event => {
  const cookieHeader = Object.keys(cookies).length
    ? Object.entries(cookies)
        .map(([k, v]) => `${k}=${v}`)
        .join('; ')
    : undefined;

  return mockEvent(`http://localhost${path}`, {
    headers: {
      ...headers,
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
  });
};

describe('PreviewMiddleware', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should bypass cache when preview cookie is present', async () => {
    const middleware = new PreviewMiddleware({ sites: [] });
    const event = createMockEvent({}, { [PreviewCookies.PREVIEW]: 'true' });

    await middleware.handle(event);

    expect(event.res.headers.get('Cache-Control')).toBe('no-store, must-revalidate');
  });

  it('should not bypass cache when preview cookie is absent', async () => {
    const middleware = new PreviewMiddleware({ sites: [] });
    const event = createMockEvent();

    await middleware.handle(event);

    expect(event.res.headers.get('Cache-Control')).toBeNull();
  });

  it('should skip when path is an API route', async () => {
    const middleware = new PreviewMiddleware({ sites: [] });
    const event = createMockEvent({}, { [PreviewCookies.PREVIEW]: 'true' }, '/api/editing/config');

    await middleware.handle(event);

    expect(event.res.headers.get('Cache-Control')).toBeNull();
  });

  it('should skip when path is a Nuxt internal route', async () => {
    const middleware = new PreviewMiddleware({ sites: [] });
    const event = createMockEvent({}, { [PreviewCookies.PREVIEW]: 'true' }, '/_nuxt/webpack');

    await middleware.handle(event);

    expect(event.res.headers.get('Cache-Control')).toBeNull();
  });

  it('should skip when custom skip function returns true', async () => {
    const middleware = new PreviewMiddleware({
      sites: [],
      skip: (event: H3Event) => event.url.pathname === '/skip-me',
    });
    const event = createMockEvent({}, { [PreviewCookies.PREVIEW]: 'true' }, '/skip-me');

    await middleware.handle(event);

    expect(event.res.headers.get('Cache-Control')).toBeNull();
  });

  it('should catch errors and log them without throwing', async () => {
    const middleware = new PreviewMiddleware({ sites: [] });
    const consoleErrorStub = vi.spyOn(console, 'error');
    const event = createMockEvent({}, { [PreviewCookies.PREVIEW]: 'true' });

    vi.spyOn(middleware as any, 'bypassCache').mockImplementation(() => {
      throw new Error('Unexpected failure');
    });

    await middleware.handle(event);

    expect(consoleErrorStub).toHaveBeenCalled();
  });
});
