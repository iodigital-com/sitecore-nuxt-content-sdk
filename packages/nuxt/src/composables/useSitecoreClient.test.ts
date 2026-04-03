import sinon from 'sinon';
import { expect } from 'chai';
import { describe, it, afterEach, vi } from 'vitest';
import { SitecoreNuxtClient } from '../client/sitecore-nuxt-client';

const mockConfig = {
  api: {
    edge: {
      contextId: 'test-context-id',
      clientContextId: 'client-context-id',
      edgeUrl: 'https://edge.example.com',
    },
  },
  defaultSite: 'default-site',
  defaultLanguage: 'en',
  retries: {
    count: 3,
    retryStrategy: undefined,
  },
  layout: {
    formatLayoutQuery: undefined,
  },
  dictionary: {
    caching: {
      enabled: false,
      timeout: 0,
    },
  },
} as any;

vi.mock('nuxt/app', () => ({
  useRuntimeConfig: () => ({ sitecore: mockConfig }),
}));

import { useSitecoreClient } from './useSitecoreClient';

describe('useSitecoreClient', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('returns a SitecoreNuxtClient instance', () => {
    const client = useSitecoreClient();
    expect(client).to.be.instanceOf(SitecoreNuxtClient);
  });

  it('initializes client with runtime config', () => {
    const client = useSitecoreClient();
    expect((client as any).initOptions.defaultSite).to.equal('default-site');
    expect((client as any).initOptions.defaultLanguage).to.equal('en');
  });
});
