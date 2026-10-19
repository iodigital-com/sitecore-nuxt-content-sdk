const fs = require('fs');
const path = require('path');

const refDocsRoot = path.join(__dirname, '..', 'ref-docs');

/**
 * TypeDoc records the file it opened. For re-exported Sitecore packages that file
 * is inside node_modules or the Vue package's emitted types. Published docs should
 * name the package instead of a local install path.
 * @param {string} location - The "Defined in" location, without the label.
 * @returns {string | undefined} Replacement location, or undefined when the line should stay.
 */
function normalizeLocation(location) {
  const plain = location.replace(/\\([_*`[\]])/g, '$1');

  const installedPackage = plain.match(
    /(?:^|.*\/)node_modules\/(@sitecore-content-sdk\/[a-z0-9-]+)\/(\S+)/
  );
  if (installedPackage) {
    return escapeUnderscores(`${installedPackage[1]}/${installedPackage[2]}`);
  }

  const vueTypes = plain.match(/(?:^|.*\/)vue\/types\/(\S+)/);
  if (vueTypes) {
    return escapeUnderscores(`@iodigital-com/sitecore-content-sdk-vue/types/${vueTypes[1]}`);
  }

  return undefined;
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeUnderscores(value) {
  return value.replace(/_/g, '\\_');
}

/**
 * @param {string} markdown
 * @returns {string}
 */
function normalizeMarkdown(markdown) {
  return markdown
    .split('\n')
    .map((line) => {
      const match = line.match(/^Defined in: (.+)$/);
      if (!match) {
        return line;
      }

      const normalized = normalizeLocation(match[1]);
      return normalized ? `Defined in: ${normalized}` : line;
    })
    .join('\n');
}

/**
 * @param {string} directory
 * @returns {string[]}
 */
function listMarkdownFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return listMarkdownFiles(entryPath);
    }
    return entry.name.endsWith('.md') ? [entryPath] : [];
  });
}

const files = listMarkdownFiles(refDocsRoot);
let changed = 0;

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  const normalized = normalizeMarkdown(original);
  if (normalized !== original) {
    fs.writeFileSync(file, normalized);
    changed += 1;
  }
}

console.log(`Normalized source locations in ${changed} reference files.`);
