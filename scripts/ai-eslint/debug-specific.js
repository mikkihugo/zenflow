#!/usr/bin/env node

/**
 * Debug specific path resolution issue
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

function testPathResolution(basePath, importPath) {
  console.log(`\n🧪 Testing path resolution:`);
  console.log(`  Base: ${basePath}`);
  console.log(`  Import: "${importPath}"`);
  
  const baseDir = path.dirname(basePath);
  const resolved = path.resolve(baseDir, importPath);
  
  console.log(`  BaseDir: ${baseDir}`);
  console.log(`  Resolved: ${resolved}`);
  
  // Try extensions
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  for (const ext of extensions) {
    const candidate = resolved + ext;
    const exists = fs.existsSync(candidate);
    const normalized = path.normalize(path.resolve(candidate));
    console.log(`  Try: ${candidate}`);
    console.log(`    Exists: ${exists}`);
    console.log(`    Normalized: ${normalized}`);
    if (exists) {
      return normalized;
    }
  }
  
  return path.normalize(path.resolve(resolved + '.ts'));
}

function main() {
  // Test the specific case: integration-service-factory importing integration-service-adapter
  const factoryPath = path.resolve(repoRoot, 'src/interfaces/services/adapters/integration-service-factory.ts');
  const importPath = './integration-service-adapter';
  
  console.log('🔍 Testing integration-service-factory → integration-service-adapter resolution');
  
  const resolvedPath = testPathResolution(factoryPath, importPath);
  
  console.log(`\n📊 Final result:`);
  console.log(`  Resolved to: ${resolvedPath}`);
  console.log(`  File exists: ${fs.existsSync(resolvedPath)}`);
  
  // Check what paths are actually in our file system
  console.log(`\n📁 Actual integration-service-adapter files:`);
  const find = require('child_process').spawnSync('find', ['src', '-name', '*integration-service-adapter*'], {
    cwd: repoRoot,
    encoding: 'utf8'
  });
  
  find.stdout.split('\n').forEach(file => {
    if (file.trim()) {
      const fullPath = path.resolve(repoRoot, file.trim());
      const normalized = path.normalize(fullPath);
      console.log(`  ${normalized}`);
      
      // Check if this matches our resolved path
      if (normalized === resolvedPath) {
        console.log(`    ✅ MATCHES resolved path!`);
      }
    }
  });
}

main();