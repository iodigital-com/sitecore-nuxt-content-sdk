import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'fs';
import { detectComponentType, getComponentListWithTypes } from './utils';

vi.mock('fs');

describe('Templating Utils', () => {
  describe('detectComponentType', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should detect client component from explicit export in script block', () => {
      vi.mocked(fs.readFileSync).mockReturnValue(`
<script setup lang="ts">
export const componentType = 'client';
</script>
<template><div>Client</div></template>
`);

      expect(detectComponentType('test.vue')).to.equal('client');
    });

    it('should detect server component from explicit export in script block', () => {
      vi.mocked(fs.readFileSync).mockReturnValue(`
<script setup lang="ts">
export const componentType = 'server';
</script>
<template><div>Server</div></template>
`);

      expect(detectComponentType('test.vue')).toEqual('server');
    });

    it('should detect universal component from explicit export in script block', () => {
      vi.mocked(fs.readFileSync).mockReturnValue(`
<script setup lang="ts">
export const componentType = 'universal';
</script>
<template><div>Universal</div></template>
`);

      expect(detectComponentType('test.vue')).toEqual('universal');
    });

    it('should default to universal when no componentType is exported', () => {
      vi.mocked(fs.readFileSync).mockReturnValue(`
<script setup lang="ts">
const message = 'hello';
</script>
<template><div>{{ message }}</div></template>
`);

      expect(detectComponentType('test.vue')).toEqual('universal');
    });

    it('should default to universal when there is no script block', () => {
      vi.mocked(fs.readFileSync).mockReturnValue(`
<template><div>No script</div></template>
`);

      expect(detectComponentType('test.vue')).toEqual('universal');
    });

    it('should not detect componentType from template block', () => {
      vi.mocked(fs.readFileSync).mockReturnValue(`
<template>
  <div>{{ componentType }}</div>
</template>
<script setup lang="ts">
const componentType = 'client';
</script>
`);

      // not exported, so should default to universal
      expect(detectComponentType('test.vue')).toEqual('universal');
    });

    it('should detect componentType with double quotes', () => {
      vi.mocked(fs.readFileSync).mockReturnValue(`
<script setup lang="ts">
export const componentType = "client";
</script>
<template><div>Client</div></template>
`);

      expect(detectComponentType('test.vue')).toEqual('client');
    });

    it('should detect componentType with backticks', () => {
      vi.mocked(fs.readFileSync).mockReturnValue(`
<script setup lang="ts">
export const componentType = \`client\`;
</script>
<template><div>Client</div></template>
`);

      expect(detectComponentType('test.vue')).toEqual('client');
    });

    it('should handle file read errors gracefully and default to universal', () => {
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('File not found');
      });

      expect(detectComponentType('nonexistent.vue')).toEqual('universal');
    });
  });

  describe('getComponentListWithTypes', () => {
    it('should return components with required properties and detected types', () => {
      const result = getComponentListWithTypes(['src/test-data/components/*.vue']);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);

      result.forEach((component) => {
        expect(component).toHaveProperty('filePath');
        expect(component).toHaveProperty('importPath');
        expect(component).toHaveProperty('moduleName');
        expect(component).toHaveProperty('componentName');
        expect(component).toHaveProperty('componentType');
        expect(['client', 'server', 'universal']).toContain(component.componentType);
      });
    });

    it('should exclude variant components when includeVariants is false', () => {
      const result = getComponentListWithTypes(['src/test-data/components/*.vue'], [], false);

      result.forEach((component) => {
        expect(component.componentName).not.toContain('.');
      });
    });

    it('should include variant components when includeVariants is true', () => {
      const withVariants = getComponentListWithTypes(['src/test-data/components/*.vue'], [], true);
      const withoutVariants = getComponentListWithTypes(
        ['src/test-data/components/*.vue'],
        [],
        false
      );

      expect(withVariants.length).toBeGreaterThanOrEqual(withoutVariants.length);
    });
  });
});
