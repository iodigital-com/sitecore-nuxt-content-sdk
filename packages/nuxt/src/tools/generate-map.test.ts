import path from 'path';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import { generateMap } from './generate-map';
import type { ComponentImport } from '@sitecore-content-sdk/content/tools';
import * as templatingUtils from './templating/utils';

vi.mock('fs');

describe('generateMap', () => {
  const abs = (p: string) => path.resolve(process.cwd(), p);

  const fakeComponents = [
    {
      componentName: 'Button',
      moduleName: 'Button',
      importPath: './src/components/Button',
      filePath: abs('src/components/Button.vue'),
      componentType: 'client' as const,
    },
    {
      componentName: 'Link',
      moduleName: 'Link',
      importPath: './src/components/Link',
      filePath: abs('src/components/Link.vue'),
      componentType: 'universal' as const,
    },
  ];

  const fakePackages: ComponentImport[] = [
    {
      importName: 'MyLib',
      importInfo: {
        importFrom: '@my/lib',
      },
    },
    {
      importName: 'OtherLib',
      importInfo: {
        importFrom: '@other/lib',
        namedImports: ['CompA', 'CompB'],
      },
    },
  ];

  beforeEach(() => {
    vi.spyOn(templatingUtils, 'getComponentListWithTypes').mockReturnValue(fakeComponents);
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should write component-map.ts with components from paths', () => {
    generateMap({ paths: ['src/components'] });

    expect(fs.writeFileSync).toHaveBeenCalledOnce();
    const [dest, content] = vi.mocked(fs.writeFileSync).mock.calls[0] as [string, string];
    expect(dest).toBe(path.join(process.cwd(), '.sitecore', 'component-map.ts'));

    expect(content).toContain("import * as Button from './src/components/Button.vue';");
    expect(content).toContain("import * as Link from './src/components/Link.vue';");
    expect(content).toContain('new Map');
    expect(content).toContain("['Button',");
    expect(content).toContain("['Link',");
    expect(content).toContain('export default componentMap');
  });

  it('should use custom mapTemplate when provided', () => {
    const customTemplate = vi.fn().mockReturnValue('// custom output');

    generateMap({ paths: ['src/components'], mapTemplate: customTemplate });

    expect(customTemplate).toHaveBeenCalledOnce();
    expect(customTemplate.mock.calls[0][0]).toEqual(fakeComponents);

    const [, content] = vi.mocked(fs.writeFileSync).mock.calls[0] as [string, string];
    expect(content).toBe('// custom output');
  });

  it('should generate an empty component map when no components are found', () => {
    vi.spyOn(templatingUtils, 'getComponentListWithTypes').mockReturnValue([]);

    generateMap({ paths: ['src/components'] });

    expect(fs.writeFileSync).toHaveBeenCalledOnce();
    const [, content] = vi.mocked(fs.writeFileSync).mock.calls[0] as [string, string];
    expect(content).toContain('import type { ComponentMap }');
    expect(content).toContain('new Map');
    expect(content).toContain('export default componentMap');
  });

  it('should handle multiple paths and merge their components', () => {
    const multiComponents = [
      ...fakeComponents,
      {
        componentName: 'Card',
        moduleName: 'Card',
        importPath: './src/other-components/Card',
        filePath: abs('src/other-components/Card.vue'),
        componentType: 'universal' as const,
      },
    ];

    vi.spyOn(templatingUtils, 'getComponentListWithTypes').mockReturnValue(multiComponents);

    generateMap({ paths: ['src/components', 'src/other-components'] });

    const [, content] = vi.mocked(fs.writeFileSync).mock.calls[0] as [string, string];
    expect(content).toContain("import * as Button from './src/components/Button.vue';");
    expect(content).toContain("import * as Link from './src/components/Link.vue';");
    expect(content).toContain("import * as Card from './src/other-components/Card.vue';");
    expect(content).toContain("['Card',");
  });

  it('should pass exclude param to getComponentListWithTypes', () => {
    const exclude = ['**/*.stories.vue', '**/*.test.vue'];
    const spy = vi.spyOn(templatingUtils, 'getComponentListWithTypes');

    generateMap({ paths: ['src/components'], exclude });

    expect(spy).toHaveBeenCalledWith(['src/components'], exclude, expect.anything());
  });

  it('should use custom destination when provided', () => {
    generateMap({ paths: ['src/components'], destination: 'custom/path' });

    const [dest] = vi.mocked(fs.writeFileSync).mock.calls[0] as [string, string];
    expect(dest).toBe(path.join(process.cwd(), 'custom/path', 'component-map.ts'));
  });

  it('should throw when destination cannot be written to', () => {
    vi.mocked(fs.writeFileSync).mockImplementation(() => {
      throw new Error('Disk full');
    });

    expect(() => generateMap({ paths: ['src/components'] })).toThrow('Disk full');
  });

  it('should include wildcard package imports', () => {
    generateMap({ paths: ['src/components'], componentImports: [fakePackages[0]] });

    const [, content] = vi.mocked(fs.writeFileSync).mock.calls[0] as [string, string];
    expect(content).toContain("import * as MyLib from '@my/lib';");
    expect(content).toContain("['MyLib', MyLib],");
  });

  it('should include named package imports', () => {
    generateMap({ paths: ['src/components'], componentImports: [fakePackages[1]] });

    const [, content] = vi.mocked(fs.writeFileSync).mock.calls[0] as [string, string];
    expect(content).toContain("import { CompA, CompB } from '@other/lib';");
    expect(content).toContain("['CompA', CompA],");
    expect(content).toContain("['CompB', CompB],");
  });

  it('should not fail when componentImports is undefined', () => {
    expect(() =>
      generateMap({ paths: ['src/components'], componentImports: undefined })
    ).not.toThrow();
  });

  it('should group variant components when includeVariants is true', () => {
    const withVariant = [
      {
        componentName: 'Button',
        moduleName: 'Button',
        importPath: './src/components/Button',
        filePath: abs('src/components/Button.vue'),
        componentType: 'universal' as const,
      },
      {
        componentName: 'Button.extra',
        moduleName: 'Buttonextra',
        importPath: './src/components/Button.extra',
        filePath: abs('src/components/Button.extra.vue'),
        componentType: 'universal' as const,
      },
    ];

    vi.spyOn(templatingUtils, 'getComponentListWithTypes').mockReturnValue(withVariant);

    generateMap({ paths: ['src/components'], includeVariants: true });

    const [, content] = vi.mocked(fs.writeFileSync).mock.calls[0] as [string, string];
    expect(content).toContain("import * as Button from './src/components/Button.vue';");
    expect(content).toContain("import * as Buttonextra from './src/components/Button.extra.vue';");
    expect(content.replace(/\s+/g, ' ')).toContain("['Button', { ...Buttonextra, ...Button }],");
  });

  it('should log component registration', () => {
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => undefined);

    generateMap({ paths: ['src/components'] });

    expect(debugSpy).toHaveBeenCalledWith('Registering Content SDK component Button');
    expect(debugSpy).toHaveBeenCalledWith('Registering Content SDK component Link');
  });
});
