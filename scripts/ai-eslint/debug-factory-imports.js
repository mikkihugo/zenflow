#!/usr/bin/env node

/**
 * Debug factory file import extraction
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

// Copy the exact extractDependencies method from the simple graph analyzer
function extractDependencies(content, filePath) {
  const dependencies = { imports: [], exports: [], dynamicImports: [] };

  // Static imports with multiline support using [\s\S]*?
  const importPatterns = [
    /import\s+[\s\S]*?from\s+['"](.*?)['"];?/g,  // Multiline imports
    /import\s*\(\s*['"](.*?)['"]\s*\)/g,         // Dynamic imports
    /require\s*\(\s*['"](.*?)['"]\s*\)/g,        // CommonJS requires
  ];

  for (const pattern of importPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const importPath = match[1];
      if (importPath.startsWith('.')) {
        dependencies.imports.push(importPath);
      }
    }
  }

  // Re-exports with multiline support
  const exportPattern = /export\s+[\s\S]*?from\s+['"](.*?)['"];?/g;
  let match;
  while ((match = exportPattern.exec(content)) !== null) {
    if (match[1].startsWith('.')) {
      dependencies.exports.push(match[1]);
    }
  }

  return dependencies;
}

// Copy the exact resolveImportPath method
function resolveImportPath(basePath, importPath) {
  if (!importPath.startsWith('.')) {
    return importPath; // External module
  }

  const baseDir = path.dirname(basePath);
  const resolved = path.resolve(baseDir, importPath);

  // Try common extensions
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  for (const ext of extensions) {
    const candidate = resolved + ext;
    if (fs.existsSync(candidate)) {
      // Normalize to absolute path to match fileNodes keys
      return path.normalize(path.resolve(candidate));
    }
  }

  // Try index files
  const indexExtensions = ['/index.ts', '/index.tsx', '/index.js'];
  for (const indexExt of indexExtensions) {
    const candidate = resolved + indexExt;
    if (fs.existsSync(candidate)) {
      // Normalize to absolute path to match fileNodes keys
      return path.normalize(path.resolve(candidate));
    }
  }

  // Default assumption with path normalization
  return path.normalize(path.resolve(resolved + '.ts'));
}

function main() {
  const factoryPath = path.resolve(repoRoot, 'src/interfaces/services/adapters/integration-service-factory.ts');
  const adapterPath = path.resolve(repoRoot, 'src/interfaces/services/adapters/integration-service-adapter.ts');
  
  console.log('🔍 Testing integration-service-factory import extraction');
  
  // Read the factory file
  const content = fs.readFileSync(factoryPath, 'utf8');
  
  console.log('\n📖 Factory file imports (raw content sample):');
  const lines = content.split('\n').slice(10, 25);
  lines.forEach((line, i) => {
    if (line.includes('import') || line.includes('from')) {
      console.log(`  ${10 + i + 1}: ${line.trim()}`);
    }
  });
  
  // Extract dependencies using our algorithm
  console.log('\n🧪 Extracted dependencies:');
  const deps = extractDependencies(content, factoryPath);
  console.log(`  Imports: ${JSON.stringify(deps.imports, null, 2)}`);
  
  // Resolve each import
  console.log('\n🔗 Resolving imports:');
  for (const importPath of deps.imports) {
    const resolved = resolveImportPath(factoryPath, importPath);
    console.log(`  "${importPath}" → ${resolved}`);
    console.log(`    Exists: ${fs.existsSync(resolved)}`);
    console.log(`    Matches adapter: ${resolved === adapterPath}`);
  }
  
  // Check if adapter path is what we expect
  console.log(`\n📄 Expected adapter path: ${adapterPath}`);
  console.log(`📄 Adapter file exists: ${fs.existsSync(adapterPath)}`);
}

main();