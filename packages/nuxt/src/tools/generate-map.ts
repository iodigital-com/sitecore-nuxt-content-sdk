import {
  GenerateMapArgs,
  GenerateMapFunction,
  ComponentImport,
  ComponentMapEntry,
} from '@sitecore-content-sdk/content/tools';
import { getComponentListWithTypes } from './templating/utils';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Builds component map entries from the collected component files.
 * @param {ReturnType<typeof getComponentListWithTypes>} components - List of components with types
 * @param {boolean} includeVariants - Whether to include variant components
 * @returns {ComponentMapEntry[]} Array of map entries
 */
const prepareComponentsForMap = (
  components: ReturnType<typeof getComponentListWithTypes>,
  includeVariants: boolean
): ComponentMapEntry[] => {
  const groups = new Map<
    string,
    {
      dir: string;
      prefix: string;
      base?: (typeof components)[0];
      neighbors: (typeof components)[0][];
    }
  >();

  const getPrefix = (name: string) => {
    const index = name.indexOf('.');
    return index === -1 ? name : name.slice(0, index);
  };

  for (const file of components) {
    const dir = path.dirname(file.filePath).replace(/\\/g, '/');
    const prefix = getPrefix(file.componentName);
    const key = `${dir}::${prefix}`;

    let group = groups.get(key);
    if (!group) {
      group = { dir, prefix, neighbors: [] };
      groups.set(key, group);
    }

    if (file.componentName === prefix) group.base = file;
    else group.neighbors.push(file);
  }

  const entries: ComponentMapEntry[] = [];

  for (const group of groups.values()) {
    const imports: string[] = [];

    if (includeVariants) {
      const spreads: string[] = [];
      for (const neighbor of group.neighbors) {
        imports.push(`import * as ${neighbor.moduleName} from '${neighbor.importPath}.vue';`);
        spreads.push(`...${neighbor.moduleName}`);
      }
      if (group.base) {
        imports.push(`import * as ${group.base.moduleName} from '${group.base.importPath}.vue';`);
        spreads.push(`...${group.base.moduleName}`);
      }

      const valueExpr = spreads.length
        ? spreads.join(', ')
        : group.base
        ? group.base.moduleName
        : group.neighbors[0].moduleName;

      entries.push({ key: group.prefix, imports, valueExpr, annotateClient: false });
    } else {
      if (group.base) {
        imports.push(`import * as ${group.base.moduleName} from '${group.base.importPath}.vue';`);
        entries.push({
          key: group.prefix,
          imports,
          valueExpr: group.base.moduleName,
          annotateClient: false,
        });
      } else if (group.neighbors.length) {
        const first = group.neighbors[0];
        imports.push(`import * as ${first.moduleName} from '${first.importPath}.vue';`);
        entries.push({
          key: group.prefix,
          imports,
          valueExpr: first.moduleName,
          annotateClient: false,
        });
      }
    }
  }

  return entries;
};

/**
 * Builds the content of the `component-map.ts` file.
 * @param {ComponentMapEntry[]} entries - Prepared map entries
 * @param {ComponentImport[]} [componentImports] - Additional package imports
 * @returns {string} File content
 */
const buildMapContent = (
  entries: ComponentMapEntry[],
  componentImports?: ComponentImport[]
): string => {
  const wildcardImports: string[] = [];
  const namedImports: string[] = [];

  entries.forEach((e) => wildcardImports.push(...e.imports));

  componentImports?.forEach((pkg) => {
    if (pkg.importInfo.namedImports) {
      namedImports.push(
        `import { ${pkg.importInfo.namedImports.join(', ')} } from '${pkg.importInfo.importFrom}';`
      );
    } else {
      wildcardImports.push(`import * as ${pkg.importName} from '${pkg.importInfo.importFrom}';`);
    }
  });

  const importsSection = [...wildcardImports, ...namedImports].join('\n');

  const componentMapEntries: string[] = [];

  for (const e of entries) {
    const value = e.valueExpr.includes('...') ? `{ ${e.valueExpr} }` : e.valueExpr;
    componentMapEntries.push(`  ['${e.key}', ${value}],`);
  }

  componentImports?.forEach((pkg) => {
    if (pkg.importInfo.namedImports) {
      pkg.importInfo.namedImports.forEach((name: string) => {
        componentMapEntries.push(`  ['${name}', ${name}],`);
      });
    } else {
      componentMapEntries.push(`  ['${pkg.importName}', ${pkg.importName}],`);
    }
  });

  return `import type { ComponentMap } from '@iodigital-com/sitecore-content-sdk-vue';
${importsSection}

const componentMap: ComponentMap = new Map([
${componentMapEntries.join('\n')}
]);

export default componentMap;
`;
};

/**
 * Generates a `component-map.ts` file by scanning the provided paths for `.vue` components
 * and writing a typed `ComponentMap` to the destination folder.
 *
 * Components can declare their type explicitly in their `<script>` block:
 * ```ts
 * export const componentType = 'client';
 * ```
 * Without an explicit declaration, components default to `universal`.
 * @param {GenerateMapArgs} params - Configuration for map generation
 * @public
 */
export const generateMap: GenerateMapFunction = ({
  paths,
  destination = '.sitecore',
  exclude,
  componentImports,
  mapTemplate,
  includeVariants = true,
}: GenerateMapArgs) => {
  const components = getComponentListWithTypes(paths, exclude, includeVariants);

  for (const component of components) {
    console.debug(`Registering Content SDK component ${component.componentName}`);
  }

  const entries = prepareComponentsForMap(components, includeVariants);

  const content = mapTemplate
    ? mapTemplate(components, componentImports, {
        entries,
        includeVariants,
        isClientMap: false,
      })
    : buildMapContent(entries, componentImports);

  fs.writeFileSync(path.join(process.cwd(), destination, 'component-map.ts'), content, 'utf8');
};
