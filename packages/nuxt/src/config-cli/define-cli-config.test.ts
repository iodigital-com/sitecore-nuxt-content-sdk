import { describe, it, expect } from 'vitest';
import { defineCliConfig } from './define-cli-config';
import {
  SitecoreCliConfigInput,
  SitecoreCliConfig,
  ComponentTemplateType,
} from '@sitecore-content-sdk/content/config';
import chalk from 'chalk';

describe('defineCliConfig', () => {
  const mockConfig = {
    config: {},
    build: {
      commands: [async () => Promise.resolve()],
    },
  } as unknown as SitecoreCliConfigInput;

  const validateDefaultTemplate = (result: SitecoreCliConfig) => {
    expect(result.scaffold.templates[0].name).toBe(ComponentTemplateType.DEFAULT);

    const template = result.scaffold.templates[0].generateTemplate('ComponentName');
    expect(template).toContain(`@sitecore-content-sdk/vue`);
    expect(template).toContain('ComponentName');
    expect(template).toContain('<script setup lang="ts">');

    if (result.scaffold.templates[0].getNextSteps) {
      const componentPath = 'components/ComponentName.vue';
      expect(result.scaffold.templates[0].getNextSteps(componentPath)[0]).toContain(
        `* Implement the Vue component in ${chalk.green(componentPath)}`
      );
    }
  };

  it('should add default scaffold template', () => {
    const inputConfig: SitecoreCliConfigInput = {
      ...mockConfig,
      build: {
        commands: [async () => Promise.resolve()],
      },
      scaffold: {
        templates: [
          { name: 'existing template', fileExtension: 'vue', generateTemplate: () => 'test' },
        ],
      },
    };

    const result = defineCliConfig(inputConfig);
    expect(result.scaffold.templates).toHaveLength(2);

    validateDefaultTemplate(result);

    expect(result.scaffold.templates[1].name).toBe('existing template');
  });

  it('should initialize scaffold object if not present', () => {
    const inputConfig: SitecoreCliConfigInput = {
      ...mockConfig,
      build: {
        commands: [async () => Promise.resolve()],
      },
    };

    const result = defineCliConfig(inputConfig);
    expect(result.scaffold.templates).toHaveLength(1);

    validateDefaultTemplate(result);
  });

  it('should set default componentMap paths to components/', () => {
    const result = defineCliConfig({ ...mockConfig });
    expect(result.componentMap?.paths).toEqual(['components']);
  });

  it('should allow overriding componentMap paths', () => {
    const inputConfig: SitecoreCliConfigInput = {
      ...mockConfig,
      componentMap: {
        paths: ['src/custom-components'],
      },
    };
    const result = defineCliConfig(inputConfig);
    expect(result.componentMap?.paths).toEqual(['src/custom-components']);
  });
});
