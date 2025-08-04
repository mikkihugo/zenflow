/**
 * Custom Jest resolver to handle .js imports that should resolve to .ts files
 * Only applies to our source files, not node_modules
 */

const { resolve, dirname, join } = require('node:path');
const { existsSync } = require('node:fs');

module.exports = (request, options) => {
  // Only apply to relative imports ending with .js that are NOT in node_modules
  const isNodeModules =
    options.basedir.includes('node_modules') ||
    request.includes('node_modules') ||
    !request.startsWith('.');

  if (!isNodeModules && request.endsWith('.js')) {
    // Try to resolve the .ts equivalent
    const tsRequest = request.replace(/\.js$/, '.ts');
    const fullTsPath = resolve(options.basedir, tsRequest);

    // If the .ts file exists, return the request with .ts extension
    if (existsSync(fullTsPath)) {
      return tsRequest;
    }

    // Also try index.ts if it's a directory import
    const indexTsPath = resolve(options.basedir, request.replace(/\.js$/, '/index.ts'));
    if (existsSync(indexTsPath)) {
      return request.replace(/\.js$/, '/index.ts');
    }
  }

  // Fall back to default resolution
  return options.defaultResolver(request, options);
};
