import { describe, it, expect } from 'vitest';
import { defaultTemplate } from './default-component';
import chalk from 'chalk';

describe('default-component', () => {
  describe('generateTemplate', () => {
    it('should generate a template with the given component name', () => {
      const componentName = 'TestComponent';
      const template = defaultTemplate.generateTemplate(componentName);
      expect(template).toContain(`<p>${componentName} Component</p>`);
      expect(template).toContain(`interface Props`);
      expect(template).toContain(`@iodigital-com/sitecore-content-sdk-vue`);
    });
  });

  describe('getNextSteps', () => {
    it('should return an empty array if no componentOutputPath is provided', () => {
      const nextSteps = defaultTemplate.getNextSteps && defaultTemplate.getNextSteps('');
      expect(nextSteps).toEqual([]);
    });

    it('should return an array with next steps if componentOutputPath is provided', () => {
      const componentOutputPath = 'components/TestComponent.vue';
      const nextSteps =
        defaultTemplate.getNextSteps && defaultTemplate.getNextSteps(componentOutputPath);
      expect(nextSteps).toContain(
        `* Implement the Vue component in ${chalk.green(componentOutputPath)}`
      );
    });
  });
});
