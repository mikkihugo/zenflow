/**
 * jscodeshift transformer for import path standardization
 * Converts relative imports to absolute imports based on TypeScript path mappings
 */

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const source = j(file.source);

  let hasChanges = false;

  // Path mapping rules
  const pathMappings = {
    '../../interfaces/': '@/interfaces/',
    '../interfaces/': '@/interfaces/',
    '../../core/': '@/core/',
    '../core/': '@/core/',
    '../../config/': '@/config/',
    '../config/': '@/config/',
    '../../utils/': '@/utils/',
    '../utils/': '@/utils/',
    '../../coordination/': '@/coordination/',
    '../coordination/': '@/coordination/',
    '../../database/': '@/database/',
    '../database/': '@/database/',
    '../../neural/': '@/neural/',
    '../neural/': '@/neural/',
  };

  // Transform import statements
  source.find(j.ImportDeclaration).forEach((path) => {
    const importPath = path.value.source.value;

    // Check if this is a relative import that should be converted
    for (const [relativePath, absolutePath] of Object.entries(pathMappings)) {
      if (importPath.includes(relativePath)) {
        const newPath = importPath.replace(relativePath, absolutePath);
        path.value.source.value = newPath;
        hasChanges = true;
        break;
      }
    }
  });

  // Transform require statements
  source
    .find(j.CallExpression, {
      callee: { name: 'require' },
    })
    .forEach((path) => {
      const arg = path.value.arguments[0];
      if (arg && arg.type === 'Literal' && typeof arg.value === 'string') {
        const importPath = arg.value;

        for (const [relativePath, absolutePath] of Object.entries(pathMappings)) {
          if (importPath.includes(relativePath)) {
            arg.value = importPath.replace(relativePath, absolutePath);
            hasChanges = true;
            break;
          }
        }
      }
    });

  return hasChanges ? source.toSource() : null;
};
