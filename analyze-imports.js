#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const srcDir = './src';

// Track all imports and files
const importGraph = new Map();
const deepImports = [];
const circularDeps = [];

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
    const indexFile = path.join(resolved, 'index' + ext);
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

// Main analysis
console.log('🔍 Analyzing import patterns in Claude Code Flow...\n');

const allRelativeImports = [];
walkDirectory(srcDir, (filePath) => {
  const relativeImports = analyzeFile(filePath);
  allRelativeImports.push(...relativeImports);
});

// Find circular dependencies
const cycles = findCircularDependencies(importGraph);

// Generate report
console.log('# Code Quality Analysis Report - Import Dependencies\n');

console.log('## Summary');
console.log(`- Total files analyzed: ${importGraph.size}`);
console.log(`- Files with deep relative imports (3+ levels): ${deepImports.length}`);
console.log(`- Circular dependency chains found: ${cycles.length}`);
console.log(`- Total relative imports: ${allRelativeImports.length}\n`);

if (deepImports.length > 0) {
  console.log('## Deep Relative Imports (3+ levels)\n');
  const sortedDeepImports = deepImports.sort((a, b) => b.depth - a.depth);

  for (const imp of sortedDeepImports.slice(0, 20)) {
    // Show top 20
    console.log(`- **${imp.file}** (${imp.depth} levels)`);
    console.log(`  \`${imp.import}\``);
  }
  console.log();
}

if (cycles.length > 0) {
  console.log('## Circular Dependencies\n');
  for (let i = 0; i < cycles.length && i < 10; i++) {
    // Show top 10
    const cycle = cycles[i];
    console.log(`### Cycle ${i + 1}`);
    for (let j = 0; j < cycle.length; j++) {
      console.log(`${j + 1}. ${cycle[j]}`);
      if (j < cycle.length - 1) {
        console.log('   ↓');
      }
    }
    console.log();
  }
}

// Identify problematic patterns
console.log('## Problematic Import Patterns\n');

const moduleViolations = [];
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
  console.log('### Cross-Layer Import Violations');
  for (const violation of crossLayerImports.slice(0, 10)) {
    console.log(`- ${violation}`);
  }
  console.log();
}

// Refactoring recommendations
console.log('## Refactoring Recommendations\n');

console.log('### Priority 1 (Critical)');
if (cycles.length > 0) {
  console.log(
    '- **Break circular dependencies** - These can cause runtime issues and make the code hard to test'
  );
  console.log('  - Consider dependency inversion or extracting shared interfaces');
}

console.log('\n### Priority 2 (High)');
if (deepImports.length > 0) {
  console.log(
    '- **Reduce deep relative imports** - Files with 4+ level imports suggest poor module organization'
  );
  console.log('  - Consider creating barrel exports (index.ts files)');
  console.log('  - Move commonly imported utilities to a shared location');
}

console.log('\n### Priority 3 (Medium)');
if (crossLayerImports.length > 0) {
  console.log('- **Fix cross-layer violations** - Core/Utils should not depend on domain modules');
  console.log('  - Use dependency injection or event-based communication');
  console.log('  - Move shared types to a common location');
}

console.log('\n### Priority 4 (Low)');
console.log('- **Create proper module boundaries** - Use barrel exports and clear interfaces');
console.log(
  '- **Consider path mapping** - Use TypeScript path mapping to avoid deep relative imports'
);

console.log('\n## Recommended Fix Order\n');
console.log('1. **Break circular dependencies** (if any) - Critical for system stability');
console.log('2. **Create barrel exports** - Add index.ts files to reduce import complexity');
console.log('3. **Fix cross-layer violations** - Maintain clean architecture boundaries');
console.log('4. **Implement path mapping** - Use TypeScript baseUrl and paths configuration');
console.log('5. **Standardize import patterns** - Establish consistent import conventions');
