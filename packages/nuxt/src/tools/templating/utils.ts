import { ComponentFileWithType, ComponentType } from '@sitecore-content-sdk/content/tools';
import * as glob from 'glob';
import * as fs from 'fs';

const componentNamePattern = /^[\/]*(.+[\/\\])*(.+)\.vue$/;
const componentPathPattern = /^([\/]*.+[\/\\].+)\..+$/;

/**
 * Extracts the content of the `<script>` or `<script setup>` block from a Vue SFC.
 * @param {string} content - Raw file content
 * @returns {string} Script block content, or empty string if not found
 * @internal
 */
function extractScriptContent(content: string): string {
  const match = content.match(/<script(?:\s[^>]*)?>([^]*?)<\/script>/);
  return match ? match[1] : '';
}

/**
 * Detects the component type from a `.vue` file by inspecting the `<script>` block
 * for an exported `componentType` constant.
 *
 * Defaults to `universal` when no explicit type is found.
 * @param {string} filePath - Path to the `.vue` component file
 * @returns {ComponentType} 'server', 'client', or 'universal'
 * @internal
 */
export function detectComponentType(filePath: string): ComponentType {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const script = extractScriptContent(content);

    const match = script.match(
      /export\s+const\s+componentType\s*=\s*['"`](server|client|universal)['"`]/
    );
    if (match) {
      return match[1] as ComponentType;
    }

    return 'universal';
  } catch (error) {
    console.warn(`Failed to parse component file ${filePath}, defaulting to universal:`, error);
    return 'universal';
  }
}

/**
 * Returns a list of `.vue` component files with detected component types.
 *
 * Only `.vue` files are included. Composables and utilities in `.ts`/`.js` are excluded.
 * Components that need a custom type must export `componentType` from their `<script>` block:
 * ```ts
 * export const componentType = 'client';
 * ```
 * @param {string[]} paths - Paths to search for components
 * @param {string[]} [exclude] - Glob patterns to exclude
 * @param {boolean} [includeVariants] - Whether to include variant components (e.g. ComponentName.Variant.vue)
 * @returns {ComponentFileWithType[]} Array of components with their detected types
 * @internal
 */
export function getComponentListWithTypes(
  paths: string[],
  exclude?: string[],
  includeVariants?: boolean
): ComponentFileWithType[] {
  const components = paths.reduce<ComponentFileWithType[]>((result, searchPath) => {
    const globPath =
      glob.hasMagic(searchPath, { magicalBraces: true }) || searchPath.match(componentNamePattern)
        ? searchPath
        : searchPath.replace(/\/$/, '').concat('/**/*.vue');

    return result.concat(
      glob
        .sync(globPath, { ignore: exclude, nodir: true })
        .filter((filePath: string) => filePath.match(componentNamePattern))
        .map((filePath: string) => {
          const name = filePath.match(componentNamePattern)![2];
          return {
            filePath,
            importPath: filePath.match(componentPathPattern)![1].replace(/\\/g, '/'),
            componentName: name,
            moduleName: name.replace(/[^\w]+/g, ''),
            componentType: detectComponentType(filePath),
          };
        })
    );
  }, []);

  return includeVariants
    ? components
    : components.filter((component) => !component.componentName.includes('.'));
}
