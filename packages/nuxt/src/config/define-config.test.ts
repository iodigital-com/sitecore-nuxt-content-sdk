import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
vi.mock('@sitecore-content-sdk/content/config', () => ({ defineConfig: vi.fn() }));

import { defineConfig as defineConfigCore } from '@sitecore-content-sdk/content/config';
import { defineConfig, SitecoreConfigInput } from './define-config';

describe('defineConfig', () => {
    const defaultConfig = () => ({
    api: {
      edge: { contextId: 'contextId' },
    },
    defaultLanguage: 'en',
  });

  beforeEach(() => {
    vi.mocked(defineConfigCore).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('config.api.edge.contextId', () => {
    describe('environment variable is not set', () => {
      it('should default to empty string', () => {
        defineConfig({
          api: { local: { apiHost: 'apihost', apiKey: 'apikey' } },
          defaultLanguage: 'en',
        });
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.api?.edge?.contextId).toBe('');
      });

      it('should use the value from the config', () => {
        defineConfig({ api: { edge: { contextId: 'custom-context-id' } }, defaultLanguage: 'en' });
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.api?.edge?.contextId).toBe('custom-context-id');
      });
    });

    describe('environment variable is set', () => {
      beforeAll(() => {
        process.env.NUXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID = 'nuxt-public-sitecore-edge-context-id';
      });

      afterAll(() => {
        delete process.env.NUXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID;
      });

      it('should use the value from the config if present', () => {
        defineConfig({ api: { edge: { contextId: 'custom-context-id' } }, defaultLanguage: 'en' });
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.api?.edge?.contextId).toBe('custom-context-id');
      });

      it('should NOT use the env var for server-side contextId', () => {
        defineConfig({
          api: { local: { apiHost: 'apihost', apiKey: 'apikey' } },
          defaultLanguage: 'en',
        });
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.api?.edge?.contextId).toBe('');
      });
    });
  });

  describe('config.api.edge.clientContextId', () => {
    describe('environment variable is not set', () => {
      it('should default to undefined', () => {
        defineConfig(defaultConfig());
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.api?.edge?.clientContextId).toBeUndefined();
      });

      it('should use the value from the config', () => {
        defineConfig({
          ...defaultConfig(),
          api: { edge: { contextId: 'context-id', clientContextId: 'client-context-id' } },
        });
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.api?.edge?.clientContextId).toBe('client-context-id');
      });
    });

    describe('environment variable is set', () => {
      beforeAll(() => {
        process.env.NUXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID = 'nuxt-public-sitecore-edge-context-id';
      });

      afterAll(() => {
        delete process.env.NUXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID;
      });

      it('should use the value from the config if present', () => {
        defineConfig({
          api: {
            edge: { contextId: 'custom-context-id', clientContextId: 'custom-client-context-id' },
          },
          defaultLanguage: 'en',
        });
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.api?.edge?.clientContextId).toBe('custom-client-context-id');
      });

      it('should use the env var for client-side contextId only', () => {
        defineConfig({
          api: { local: { apiHost: 'apihost', apiKey: 'apikey' } },
          defaultLanguage: 'en',
        });
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.api?.edge?.contextId).toBe('');
        expect(resultConfig.api?.edge?.clientContextId).toBe(
          'nuxt-public-sitecore-edge-context-id'
        );
      });
    });
  });

  describe('config.api.edge.edgeUrl', () => {
    describe('environment variable is not set', () => {
      it('should default to Edge Platform URL', () => {
        defineConfig(defaultConfig());
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.api?.edge?.edgeUrl).toBe('https://edge-platform.sitecorecloud.io');
      });

      it('should use the value from the config', () => {
        defineConfig({
          ...defaultConfig(),
          api: { edge: { contextId: 'context-id', edgeUrl: 'edgeUrl' } },
        });
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.api?.edge?.edgeUrl).toBe('edgeUrl');
      });
    });

    describe('environment variable is set', () => {
      beforeAll(() => {
        process.env.NUXT_PUBLIC_SITECORE_EDGE_PLATFORM_HOSTNAME = 'nuxt-public-sitecore-edgeUrl';
      });

      afterAll(() => {
        delete process.env.NUXT_PUBLIC_SITECORE_EDGE_PLATFORM_HOSTNAME;
      });

      it('should use the value from the config if present', () => {
        defineConfig({
          api: { edge: { contextId: 'custom-context-id', edgeUrl: 'custom-edgeUrl' } },
          defaultLanguage: 'en',
        });
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.api?.edge?.edgeUrl).toBe('custom-edgeUrl');
      });

      it('should use the env var if present', () => {
        defineConfig({
          api: { local: { apiHost: 'apihost', apiKey: 'apikey' } },
          defaultLanguage: 'en',
        });
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.api?.edge?.edgeUrl).toBe('nuxt-public-sitecore-edgeUrl');
      });
    });
  });

  describe('config.api.local', () => {
    describe('environment variables are not set', () => {
      it('should default to empty string', () => {
        defineConfig(defaultConfig());
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.api?.local?.apiKey).toBe('');
        expect(resultConfig.api?.local?.apiHost).toBe('');
      });

      it('should use the value from the config', () => {
        defineConfig({
          ...defaultConfig(),
          api: { local: { apiKey: 'apiKey', apiHost: 'apiHost' } },
        });
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.api?.local?.apiKey).toBe('apiKey');
        expect(resultConfig.api?.local?.apiHost).toBe('apiHost');
      });
    });

    describe('environment variables are set', () => {
      beforeAll(() => {
        process.env.NUXT_PUBLIC_SITECORE_API_KEY = 'nuxt-public-sitecore-api-key';
        process.env.NUXT_PUBLIC_SITECORE_API_HOST = 'nuxt-public-sitecore-api-host';
      });

      afterAll(() => {
        delete process.env.NUXT_PUBLIC_SITECORE_API_KEY;
        delete process.env.NUXT_PUBLIC_SITECORE_API_HOST;
      });

      it('should use the values from the config if present', () => {
        defineConfig({
          ...defaultConfig(),
          api: { local: { apiKey: 'apiKey', apiHost: 'apiHost' } },
        });
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.api?.local?.apiKey).toBe('apiKey');
        expect(resultConfig.api?.local?.apiHost).toBe('apiHost');
      });

      it('should use the env vars if present', () => {
        defineConfig(defaultConfig());
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.api?.local?.apiKey).toBe('nuxt-public-sitecore-api-key');
        expect(resultConfig.api?.local?.apiHost).toBe('nuxt-public-sitecore-api-host');
      });
    });
  });

  describe('config.defaultSite', () => {
    describe('environment variable is not set', () => {
      it('should default to empty string', () => {
        defineConfig(defaultConfig());
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.defaultSite).toBe('');
      });

      it('should use the value from the config', () => {
        defineConfig({ ...defaultConfig(), defaultSite: 'skate-park' });
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.defaultSite).toBe('skate-park');
      });
    });

    describe('environment variable is set', () => {
      beforeAll(() => {
        process.env.NUXT_PUBLIC_DEFAULT_SITE_NAME = 'nuxt-public-sitecore-site-name';
      });

      afterAll(() => {
        delete process.env.NUXT_PUBLIC_DEFAULT_SITE_NAME;
      });

      it('should use the value from the config if present', () => {
        defineConfig({ ...defaultConfig(), defaultSite: 'skate-park' });
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.defaultSite).toBe('skate-park');
      });

      it('should use the env var if config value not present', () => {
        defineConfig(defaultConfig());
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.defaultSite).toBe('nuxt-public-sitecore-site-name');
      });
    });
  });

  describe('config.defaultLanguage', () => {
    describe('environment variable is not set', () => {
      it('should default to en', () => {
        defineConfig({ api: { edge: { contextId: 'contextId' } } });
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.defaultLanguage).toBe('en');
      });

      it('should use the value from the config', () => {
        defineConfig(defaultConfig());
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.defaultLanguage).toBe('en');
      });
    });

    describe('environment variable is set', () => {
      beforeAll(() => {
        process.env.NUXT_PUBLIC_DEFAULT_LANGUAGE = 'de';
      });

      afterAll(() => {
        delete process.env.NUXT_PUBLIC_DEFAULT_LANGUAGE;
      });

      it('should use the value from the config if present', () => {
        defineConfig(defaultConfig());
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.defaultLanguage).toBe('en');
      });

      it('should use the env var if config value not present', () => {
        defineConfig({ api: { edge: { contextId: 'contextId' } } });
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.defaultLanguage).toBe('de');
      });
    });
  });

  describe('config.multisite', () => {
    describe('enabled', () => {
      it('should default to undefined', () => {
        defineConfig(defaultConfig());
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.multisite?.enabled).toBeUndefined();
      });

      it('should be able to override default value of enabled', () => {
        defineConfig({ ...defaultConfig(), multisite: { enabled: false } });
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.multisite?.enabled).toBe(false);
      });
    });

    describe('useCookieResolution', () => {
      it('should return default function', () => {
        defineConfig(defaultConfig());
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.multisite?.useCookieResolution).toBeTypeOf('function');

        if (resultConfig.multisite?.useCookieResolution) {
          process.env.NUXT_ENV = 'preview';
          expect(resultConfig.multisite.useCookieResolution()).toBe(true);
          delete process.env.NUXT_ENV;
          expect(resultConfig.multisite.useCookieResolution()).toBe(false);
        }
      });

      it('should be able to override cookie resolution function', () => {
        defineConfig({ ...defaultConfig(), multisite: { useCookieResolution: () => true } });
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(resultConfig.multisite?.useCookieResolution).toBeTypeOf('function');
        if (resultConfig.multisite?.useCookieResolution) {
          expect(resultConfig.multisite.useCookieResolution()).toBe(true);
        }
      });
    });
  });

  describe('config.personalize', () => {
    describe('scope', () => {
      describe('environment variable is not set', () => {
        it('should default to undefined', () => {
          defineConfig(defaultConfig());
          const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
          expect(resultConfig.personalize?.scope).toBeUndefined();
        });

        it('should use the value from the config', () => {
          defineConfig({ ...defaultConfig(), personalize: { scope: 'custom-scope' } });
          const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
          expect(resultConfig.personalize?.scope).toBe('custom-scope');
        });
      });

      describe('environment variable is set', () => {
        beforeAll(() => {
          process.env.NUXT_PUBLIC_PERSONALIZE_SCOPE = 'custom-env-scope';
        });

        afterAll(() => {
          delete process.env.NUXT_PUBLIC_PERSONALIZE_SCOPE;
        });

        it('should use the value from the config if present', () => {
          defineConfig({ ...defaultConfig(), personalize: { scope: 'custom-scope' } });
          const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
          expect(resultConfig.personalize?.scope).toBe('custom-scope');
        });

        it('should use the env var if config value not present', () => {
          defineConfig(defaultConfig());
          const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
          expect(resultConfig.personalize?.scope).toBe('custom-env-scope');
        });
      });
    });
  });

  describe('config.sitecoreInternalEditingHostUrl', () => {
    describe('environment variable is not set', () => {
      it('should default to undefined', () => {
        defineConfig(defaultConfig());
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect(
          (resultConfig as SitecoreConfigInput).sitecoreInternalEditingHostUrl
        ).toBeUndefined();
      });

      it('should use the value from the config', () => {
        defineConfig({
          sitecoreInternalEditingHostUrl: 'http://localhost:3000',
          ...defaultConfig(),
        });
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect((resultConfig as SitecoreConfigInput).sitecoreInternalEditingHostUrl).toBe(
          'http://localhost:3000'
        );
      });
    });

    describe('environment variable is set', () => {
      afterEach(() => {
        delete process.env.SITECORE_INTERNAL_EDITING_HOST_URL;
      });

      it('should use the env var if present', () => {
        process.env.SITECORE_INTERNAL_EDITING_HOST_URL = 'http://localhost:3000';
        defineConfig(defaultConfig());
        const resultConfig = vi.mocked(defineConfigCore).mock.calls[0][0];
        expect((resultConfig as SitecoreConfigInput).sitecoreInternalEditingHostUrl).toBe(
          'http://localhost:3000'
        );
      });
    });
  });
});
