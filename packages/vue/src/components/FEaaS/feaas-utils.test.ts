import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { FEaaSComponentParams } from './models';

vi.mock('@sitecore-feaas/clientside', () => ({
  fetchComponent: vi.fn(),
  DataSettings: {
    fetch: vi.fn(),
  },
}));

import * as FEAAS from '@sitecore-feaas/clientside';
import { fetchFEaaSComponentServerProps, composeComponentEndpoint } from './feaas-utils';

const requiredParams: FEaaSComponentParams = {
  LibraryId: 'lib123',
  ComponentId: 'comp456',
  ComponentVersion: '1.0.0',
  ComponentRevision: 'published',
  ComponentHostName: 'https://example.com',
};

describe('feaas-utils', () => {
  beforeEach(() => {
    vi.mocked(FEAAS.fetchComponent).mockResolvedValue({ template: '<div>Test Component</div>' });
    vi.mocked(FEAAS.DataSettings.fetch).mockResolvedValue({ test: 'data' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchFEaaSComponentServerProps', () => {
    it('should call fetchComponent and DataSettings.fetch and return correct data and template', async () => {
      const result = await fetchFEaaSComponentServerProps(requiredParams, true);

      expect(result).toEqual({
        fetchedData: { test: 'data' },
        revisionFallback: 'published',
        template: '<div>Test Component</div>',
      });
    });

    it('should set revisionFallback to staged when isPageStateNormal is false', async () => {
      const params: FEaaSComponentParams = {
        LibraryId: 'lib123',
        ComponentId: 'comp456',
        ComponentVersion: '1.0.0',
        ComponentHostName: 'example.com',
      };

      const result = await fetchFEaaSComponentServerProps(params, false);

      expect(result?.revisionFallback).toBe('staged');
    });

    it('should set revisionFallback to published when isPageStateNormal is true', async () => {
      const params: FEaaSComponentParams = {
        LibraryId: 'lib123',
        ComponentId: 'comp456',
        ComponentVersion: '1.0.0',
        ComponentHostName: 'example.com',
      };

      const result = await fetchFEaaSComponentServerProps(params, true);

      expect(result?.revisionFallback).toBe('published');
    });

    it('should call fetchComponent with endpointOverride when provided', async () => {
      const customEndpoint = 'https://custom.endpoint.com/component';

      const result = await fetchFEaaSComponentServerProps(requiredParams, true, customEndpoint);

      expect(vi.mocked(FEAAS.fetchComponent)).toHaveBeenCalledWith(customEndpoint);
      expect(result).toEqual({
        fetchedData: { test: 'data' },
        revisionFallback: 'published',
        template: '<div>Test Component</div>',
      });
    });

    it('should return empty template and fetchedData when fetching fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      vi.mocked(FEAAS.fetchComponent).mockRejectedValue(
        new Error('Fetch FEAAS component template failed')
      );
      vi.mocked(FEAAS.DataSettings.fetch).mockRejectedValue(
        new Error('Fetch FEAAS component data settings failed')
      );

      const params: FEaaSComponentParams = {
        LibraryId: 'invalid',
        ComponentId: 'invalid',
        ComponentVersion: '1.0.0',
        ComponentHostName: 'invalid.endpoint.com',
      };

      const result = await fetchFEaaSComponentServerProps(params, true);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(result).toEqual({
        fetchedData: {},
        revisionFallback: 'published',
        template: '',
      });

      consoleErrorSpy.mockRestore();
    });

    it('should pass parsed ComponentDataOverride to DataSettings.fetch', async () => {
      const componentDataOverride = { source: 'api', params: { id: 123 } };
      const params: FEaaSComponentParams = {
        ...requiredParams,
        ComponentDataOverride: JSON.stringify(componentDataOverride),
      };

      await fetchFEaaSComponentServerProps(params, true);

      expect(vi.mocked(FEAAS.DataSettings.fetch)).toHaveBeenCalledWith(componentDataOverride);
    });

    it('should pass empty object to DataSettings.fetch when ComponentDataOverride is absent', async () => {
      await fetchFEaaSComponentServerProps(requiredParams, true);

      expect(vi.mocked(FEAAS.DataSettings.fetch)).toHaveBeenCalledWith({});
    });
  });

  describe('composeComponentEndpoint', () => {
    it('should build endpoint from params', () => {
      const params: FEaaSComponentParams = {
        LibraryId: 'myLibrary',
        ComponentId: 'myComponent',
        ComponentVersion: '2.1.0',
        ComponentRevision: 'published',
        ComponentHostName: 'https://feaas.example.com',
      };

      const endpoint = composeComponentEndpoint(params, 'staged');

      expect(endpoint).toBe(
        'https://feaas.example.com/components/myLibrary/myComponent/2.1.0/published'
      );
    });

    it('should use revisionFallback when ComponentRevision is absent', () => {
      const params: FEaaSComponentParams = {
        LibraryId: 'testLib',
        ComponentId: 'testComp',
        ComponentVersion: '1.0.0',
        ComponentHostName: 'feaas.test.com',
      };

      const endpoint = composeComponentEndpoint(params, 'staged');

      expect(endpoint).toBe('https://feaas.test.com/components/testLib/testComp/1.0.0/staged');
    });

    it('should add https:// prefix when hostname does not start with https://', () => {
      const params: FEaaSComponentParams = {
        LibraryId: 'lib',
        ComponentId: 'comp',
        ComponentVersion: '1.0.0',
        ComponentRevision: 'published',
        ComponentHostName: 'example.com',
      };

      const endpoint = composeComponentEndpoint(params, 'staged');

      expect(endpoint).toBe('https://example.com/components/lib/comp/1.0.0/published');
    });

    it('should handle numeric revision', () => {
      const params: FEaaSComponentParams = {
        LibraryId: 'numLib',
        ComponentId: 'numComp',
        ComponentVersion: '3.0.0',
        ComponentRevision: 42,
        ComponentHostName: 'https://numeric.example.com',
      };

      const endpoint = composeComponentEndpoint(params, 'published');

      expect(endpoint).toBe('https://numeric.example.com/components/numLib/numComp/3.0.0/42');
    });

    it('should handle saved revision', () => {
      const params: FEaaSComponentParams = {
        LibraryId: 'savedLib',
        ComponentId: 'savedComp',
        ComponentVersion: '1.5.0',
        ComponentRevision: 'saved',
        ComponentHostName: 'https://saved.example.com',
      };

      const endpoint = composeComponentEndpoint(params, 'published');

      expect(endpoint).toBe('https://saved.example.com/components/savedLib/savedComp/1.5.0/saved');
    });
  });
});
