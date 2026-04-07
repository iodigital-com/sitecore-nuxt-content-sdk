/* eslint-disable no-unused-expressions */
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import {
  COMPONENT_UPDATE_CACHE_KEY_PREFIX,
  COMPONENT_PREVIEW_CACHE_KEY_PREFIX,
} from '@sitecore-content-sdk/content/editing';
import type { ComponentRendering } from '@sitecore-content-sdk/content/layout';
import type {
  ServerComponentPreviewEventArgs,
  GeneratedComponentData,
} from '@sitecore-content-sdk/content/codegen';
import type { ComponentUpdateModel, PreviewEventModel } from './useDesignLibraryActions';

const {
  refreshNuxtDataStub,
  setCacheStub,
  debugEditingStub,
  fetchGeneratedComponentFromCacheStub,
} = vi.hoisted(() => ({
  refreshNuxtDataStub: vi.fn().mockResolvedValue(undefined),
  setCacheStub: vi.fn(),
  debugEditingStub: vi.fn(),
  fetchGeneratedComponentFromCacheStub: vi.fn(),
}));

vi.mock('nuxt/app', () => ({
  refreshNuxtData: refreshNuxtDataStub,
}));

vi.mock('@sitecore-content-sdk/core/tools', () => ({
  setCache: setCacheStub,
}));

vi.mock('@sitecore-content-sdk/content', () => ({
  debug: {
    editing: debugEditingStub,
  },
}));

vi.mock('@sitecore-content-sdk/content/codegen', () => ({
  fetchGeneratedComponentFromCache: fetchGeneratedComponentFromCacheStub,
}));

import { useDesignLibraryActions } from './useDesignLibraryActions';

describe('useDesignLibraryActions', () => {
  let updateComponent: ReturnType<typeof useDesignLibraryActions>['updateComponent'];
  let previewComponent: ReturnType<typeof useDesignLibraryActions>['previewComponent'];

  beforeEach(() => {
    const actions = useDesignLibraryActions();
    updateComponent = actions.updateComponent;
    previewComponent = actions.previewComponent;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('updateComponent', () => {
    it('should set cache with updated component rendering', async () => {
      const componentUpdate: ComponentUpdateModel = {
        uid: 'test-uid-123',
        rendering: {
          uid: 'test-uid-123',
          componentName: 'ContentBlock',
          fields: {
            heading: { value: 'Updated Heading' },
            content: { value: 'Updated Content' },
          },
          params: { variant: 'primary' },
        } as ComponentRendering,
      };

      await updateComponent(componentUpdate);

      expect(setCacheStub).toHaveBeenCalledOnce();
      expect(refreshNuxtDataStub).toHaveBeenCalledOnce();
      expect(setCacheStub).toHaveBeenCalledWith(
        `${COMPONENT_UPDATE_CACHE_KEY_PREFIX}test-uid-123`,
        componentUpdate
      );
      expect(debugEditingStub).toHaveBeenCalledWith(
        'Updating server component cache for Update Component: test-uid-123'
      );
      expect(fetchGeneratedComponentFromCacheStub).not.toHaveBeenCalled();
    });

    it('should set cache with generated component data', async () => {
      const generatedComponentData: GeneratedComponentData = {
        uid: 'test-uid-456',
        code: { type: 'function', content: 'const Component = () => <div>Generated</div>' },
        styles: {
          type: 'style-element',
          content: '.generated { color: blue; }',
          styleImport: { name: 'styles', content: {} },
        },
        imports: [],
      };

      const componentUpdate: ComponentUpdateModel = {
        uid: 'test-uid-456',
        generatedComponentData,
      };

      await updateComponent(componentUpdate);

      expect(setCacheStub).toHaveBeenCalledOnce();
      expect(refreshNuxtDataStub).toHaveBeenCalledOnce();
      expect(setCacheStub).toHaveBeenCalledWith(
        `${COMPONENT_UPDATE_CACHE_KEY_PREFIX}test-uid-456`,
        componentUpdate
      );
      expect(fetchGeneratedComponentFromCacheStub).not.toHaveBeenCalled();
    });
  });

  describe('previewComponent', () => {
    it('should fetch generated component data when args is provided', async () => {
      const args: ServerComponentPreviewEventArgs = {
        name: 'component:generation:component-preview',
        message: { cache: { id: 'cache-id-123', token: 'cache-token-456' } },
      };

      const fetchedGeneratedComponentData: GeneratedComponentData = {
        uid: 'test-uid-789',
        code: { type: 'function', content: 'const Component = () => <div>Fetched</div>' },
        styles: {
          type: 'style-element',
          content: '.fetched { color: green; }',
          styleImport: { name: 'styles', content: {} },
        },
        imports: [],
      };

      fetchGeneratedComponentFromCacheStub.mockResolvedValue(fetchedGeneratedComponentData);

      const previewEvent: PreviewEventModel = { uid: 'test-uid-789', args };

      await previewComponent(previewEvent, null, undefined);

      expect(fetchGeneratedComponentFromCacheStub).toHaveBeenCalledOnce();
      expect(fetchGeneratedComponentFromCacheStub).toHaveBeenCalledWith(
        'cache-id-123',
        'cache-token-456',
        undefined
      );
      expect(setCacheStub).toHaveBeenCalledOnce();
      expect(setCacheStub).toHaveBeenCalledWith(
        `${COMPONENT_PREVIEW_CACHE_KEY_PREFIX}test-uid-789`,
        {
          uid: 'test-uid-789',
          generatedComponentData: fetchedGeneratedComponentData,
          rendering: null,
          error: undefined,
        }
      );
      expect(refreshNuxtDataStub).toHaveBeenCalledOnce();
    });

    it('should set cache with undefined generatedComponentData when no args provided', async () => {
      const previewEvent: PreviewEventModel = {
        uid: 'test-uid-no-preview',
        args: undefined as any,
      };

      await previewComponent(previewEvent, null, undefined);

      expect(fetchGeneratedComponentFromCacheStub).not.toHaveBeenCalled();
      expect(setCacheStub).toHaveBeenCalledOnce();
      expect(setCacheStub).toHaveBeenCalledWith(
        `${COMPONENT_PREVIEW_CACHE_KEY_PREFIX}test-uid-no-preview`,
        {
          uid: 'test-uid-no-preview',
          generatedComponentData: undefined,
          rendering: null,
          error: 'No preview event arguments provided',
        }
      );
      expect(debugEditingStub).toHaveBeenCalledTimes(2);
      expect(debugEditingStub).toHaveBeenNthCalledWith(
        1,
        'Updating server component cache for Preview Component: test-uid-no-preview'
      );
      expect(debugEditingStub).toHaveBeenNthCalledWith(
        2,
        'No preview event arguments provided for Component: test-uid-no-preview'
      );
      expect(refreshNuxtDataStub).toHaveBeenCalledOnce();
    });

    it('should use custom edgeUrl when provided', async () => {
      const customEdgeUrl = 'https://custom-edge.example.com';

      const args: ServerComponentPreviewEventArgs = {
        name: 'component:generation:component-preview',
        message: { cache: { id: 'cache-id-env', token: 'cache-token-env' } },
      };

      fetchGeneratedComponentFromCacheStub.mockResolvedValue({
        uid: 'test-uid-env',
        code: { type: 'function', content: '' },
        styles: { type: 'style-element', content: '', styleImport: { name: 's', content: {} } },
        imports: [],
      });

      await previewComponent({ uid: 'test-uid-env', args }, null, customEdgeUrl);

      expect(fetchGeneratedComponentFromCacheStub).toHaveBeenCalledWith(
        'cache-id-env',
        'cache-token-env',
        customEdgeUrl
      );
    });

    it('should pass rendering to the cache when rendering is provided', async () => {
      const rendering: ComponentRendering = {
        uid: 'test-uid-rendering',
        componentName: 'TestComponent',
      };

      const args: ServerComponentPreviewEventArgs = {
        name: 'component:generation:component-preview',
        message: { cache: { id: 'cache-id-r', token: 'cache-token-r' } },
      };

      fetchGeneratedComponentFromCacheStub.mockResolvedValue({
        uid: 'test-uid-rendering',
        code: { type: 'function', content: '' },
        styles: { type: 'style-element', content: '', styleImport: { name: 's', content: {} } },
        imports: [],
      });

      await previewComponent({ uid: 'test-uid-rendering', args }, rendering, undefined);

      expect(setCacheStub).toHaveBeenCalledOnce();
      const cached = setCacheStub.mock.calls[0][1];
      expect(cached.rendering).toBe(rendering);
    });

    it('should handle fetch errors and set error in cache', async () => {
      const args: ServerComponentPreviewEventArgs = {
        name: 'component:generation:component-preview',
        message: { cache: { id: 'cache-id-error', token: 'cache-token-error' } },
      };

      const fetchError = new Error(
        'Failed to fetch generated component data from cache for id: cache-id-error. Response Status: 404, Response Status Text: Not Found'
      );
      fetchGeneratedComponentFromCacheStub.mockRejectedValue(fetchError);

      await previewComponent({ uid: 'test-uid-error', args }, null, undefined);

      expect(fetchGeneratedComponentFromCacheStub).toHaveBeenCalledOnce();
      expect(setCacheStub).toHaveBeenCalledOnce();
      expect(setCacheStub).toHaveBeenCalledWith(
        `${COMPONENT_PREVIEW_CACHE_KEY_PREFIX}test-uid-error`,
        {
          uid: 'test-uid-error',
          generatedComponentData: undefined,
          rendering: null,
          error: fetchError.message,
        }
      );
      expect(debugEditingStub).toHaveBeenCalledTimes(2);
      expect(debugEditingStub).toHaveBeenNthCalledWith(
        1,
        'Updating server component cache for Preview Component: test-uid-error'
      );
      expect(debugEditingStub).toHaveBeenNthCalledWith(
        2,
        'Error fetching generated component data from cache for Component: test-uid-error',
        fetchError
      );
      expect(refreshNuxtDataStub).toHaveBeenCalledOnce();
    });

    it('should handle non-Error fetch failures', async () => {
      const args: ServerComponentPreviewEventArgs = {
        name: 'component:generation:component-preview',
        message: { cache: { id: 'cache-id-string-error', token: 'cache-token-string-error' } },
      };

      const errorMessage = 'String error message';
      fetchGeneratedComponentFromCacheStub.mockRejectedValue(new Error(errorMessage));

      await previewComponent({ uid: 'test-uid-string-error', args }, null, undefined);

      expect(setCacheStub).toHaveBeenCalledOnce();
      expect(setCacheStub).toHaveBeenCalledWith(
        `${COMPONENT_PREVIEW_CACHE_KEY_PREFIX}test-uid-string-error`,
        {
          uid: 'test-uid-string-error',
          generatedComponentData: undefined,
          rendering: null,
          error: errorMessage,
        }
      );
      expect(debugEditingStub).toHaveBeenCalledTimes(2);
      expect(refreshNuxtDataStub).toHaveBeenCalledOnce();
    });
  });
});
