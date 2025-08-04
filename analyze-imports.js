#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const srcDir = './src';

// Track all imports and files
const importGraph = new Map();
const deepImports = [];
const _circularDeps = [];

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    const imports = [];
    const relativeImports = [];

    for (const line of lines) {
      // Match import statements
      const importMatch = line.match(/^import\s+.*?from\s+['"]([^'"]+)['"];?/);
      const exportMatch = line.match(/^export\s+.*?from\s+['"]([^'"]+)['"];?/);

      if (importMatch || exportMatch) {
        const importPath = (importMatch || exportMatch)[1];
        imports.push(importPath);

        // Check for deep relative imports (3+ levels)
        const relativeMatch = importPath.match(/^(\.\.\/){3,}/);
        if (relativeMatch) {
          const depth = (importPath.match(/\.\.\//g) || []).length;
          deepImports.push({
            file: filePath,
            import: importPath,
            depth: depth,
          });
        }

        // Track relative imports for circular dependency analysis
        if (importPath.startsWith('.')) {
          relativeImports.push({
            from: filePath,
            to: importPath,
            resolved: resolveImport(filePath, importPath),
          });
        }
      }
    }

    importGraph.set(filePath, imports);
    return relativeImports;
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
    return [];
  }
}

function resolveImport(fromFile, importPath) {
  const dir = path.dirname(fromFile);
  const resolved = path.resolve(dir, importPath);

  // Try different extensions
  const extensions = ['', '.ts', '.js', '.tsx', '.jsx'];
  for (const ext of extensions) {
    const withExt = resolved + ext;
    if (fs.existsSync(withExt)) {
      return withExt;
    }
  }

  // Try index files
  for (const ext of ['.ts', '.js']) {
    const indexFile = path.join(resolved, `index${ext}`);
    if (fs.existsSync(indexFile)) {
      return indexFile;
    }
  }

  return resolved; // Return as-is if can't resolve
}

function findCircularDependencies(graph) {
  const visited = new Set();
  const recursionStack = new Set();
  const cycles = [];

  function dfs(node, path = []) {
    if (recursionStack.has(node)) {
      // Found a cycle
      const cycleStart = path.indexOf(node);
      if (cycleStart !== -1) {
        cycles.push([...path.slice(cycleStart), node]);
      }
      return;
    }

    if (visited.has(node)) {
      return;
    }

    visited.add(node);
    recursionStack.add(node);

    const imports = graph.get(node) || [];
    for (const imp of imports) {
      if (imp.startsWith('.')) {
        const resolved = resolveImport(node, imp);
        if (graph.has(resolved)) {
          dfs(resolved, [...path, node]);
        }
      }
    }

    recursionStack.delete(node);
  }

  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      dfs(node);
    }
  }

  return cycles;
}

function walkDirectory(dir, callback) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (
      stat.isDirectory() &&
      !item.startsWith('.') &&
      item !== 'node_modules' &&
      item !== '__tests__'
    ) {
      walkDirectory(fullPath, callback);
    } else if (
      stat.isFile() &&
      (item.endsWith('.ts') || item.endsWith('.js')) &&
      !item.includes('.test.') &&
      !item.includes('.spec.')
    ) {
      callback(fullPath);
    }
  }
}

const allRelativeImports = [];
walkDirectory(srcDir, (filePath) => {
  const relativeImports = analyzeFile(filePath);
  allRelativeImports.push(...relativeImports);
});

// Find circular dependencies
const cycles = findCircularDependencies(importGraph);

if (deepImports.length > 0) {
  const sortedDeepImports = deepImports.sort((a, b) => b.depth - a.depth);

  for (const _imp of sortedDeepImports.slice(0, 20)) {
  }
}

if (cycles.length > 0) {
  for (let i = 0; i < cycles.length && i < 10; i++) {
    // Show top 10
    const cycle = cycles[i];
    for (let j = 0; j < cycle.length; j++) {
      if (j < cycle.length - 1) {
      }
    }
  }
}

const _moduleViolations = [];
const crossLayerImports = [];

for (const [file, imports] of importGraph) {
  for (const imp of imports) {
    // Check for cross-layer violations
    if (file.includes('/core/') && imp.includes('../coordination/')) {
      crossLayerImports.push(`Core importing Coordination: ${file} → ${imp}`);
    }
    if (file.includes('/utils/') && imp.includes('../coordination/')) {
      crossLayerImports.push(`Utils importing Coordination: ${file} → ${imp}`);
    }
    if (file.includes('/interfaces/') && imp.includes('../neural/')) {
      crossLayerImports.push(`Interface importing Neural: ${file} → ${imp}`);
    }
  }
}

if (crossLayerImports.length > 0) {
  for (const _violation of crossLayerImports.slice(0, 10)) {
  }
}
if (cycles.length > 0) {
}
if (deepImports.length > 0) {
}
if (crossLayerImports.length > 0) {
}
