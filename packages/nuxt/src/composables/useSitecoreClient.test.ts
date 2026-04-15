import { describe, it, afterEach, vi, expect } from 'vitest';
import { SitecoreNuxtClient } from '../client/sitecore-nuxt-client';

const mockClient = {
  getPage: vi.fn(),
  getPages: vi.fn(),
} as unknown as SitecoreNuxtClient;

vi.mock('nuxt/app', () => ({
  useNuxtApp: () => ({ $sitecoreClient: mockClient }),
}));

import { useSitecoreClient } from './useSitecoreClient';

describe('useSitecoreClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the sitecoreClient instance from the Nuxt app', () => {
    const client = useSitecoreClient();
    expect(client).toBe(mockClient);
  });
});
