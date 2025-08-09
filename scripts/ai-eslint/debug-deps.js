#!/usr/bin/env node

/**
 * Debug dependency resolution for adapter files
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

// Find all files that should import integration-service-adapter
async function findAdapterImports() {
  console.log('🔍 Debugging adapter file imports...');
  
  // Search for files that import integration-service-adapter
  const grep = spawn('grep', [
    '-r', '--include=*.ts', '--include=*.tsx', 
    'integration-service-adapter', 
    'src/'
  ], {
    stdio: 'pipe',
    cwd: repoRoot
  });

  let stdout = '';
  grep.stdout.on('data', (data) => stdout += data.toString());
  
  return new Promise((resolve) => {
    grep.on('close', () => {
      const matches = stdout.trim().split('\n')
        .filter(line => line && line.includes('import'))
        .map(line => {
          const [filePath, importLine] = line.split(':', 2);
          return { filePath, importLine: importLine.trim() };
        });
      resolve(matches);
    });
  });
}

// Test path resolution
function testPathResolution(basePath, importPath) {
  console.log(`\n🧪 Testing path resolution:`);
  console.log(`  Base: ${basePath}`);
  console.log(`  Import: ${importPath}`);
  
  const baseDir = path.dirname(basePath);
  const resolved = path.resolve(baseDir, importPath);
  
  console.log(`  Resolved: ${resolved}`);
  
  // Try extensions
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  for (const ext of extensions) {
    const candidate = resolved + ext;
    const exists = fs.existsSync(candidate);
    const normalized = path.normalize(path.resolve(candidate));
    console.log(`  ${candidate} -> exists: ${exists}, normalized: ${normalized}`);
    if (exists) {
      return normalized;
    }
  }
  
  return path.normalize(path.resolve(resolved + '.ts'));
}

async function main() {
  const matches = await findAdapterImports();
  
  console.log(`\n📊 Found ${matches.length} files importing integration-service-adapter:`);
  
  matches.slice(0, 10).forEach((match, i) => {
    console.log(`\n${i + 1}. ${match.filePath}`);
    console.log(`   Import: ${match.importLine}`);
    
    // Extract import path from the import line
    const importMatch = match.importLine.match(/from\s+['"](.*?)['"]/);
    if (importMatch) {
      const importPath = importMatch[1];
      const fullPath = path.resolve(repoRoot, match.filePath);
      const resolvedPath = testPathResolution(fullPath, importPath);
      
      // Check if resolved path exists
      console.log(`   Final resolved path exists: ${fs.existsSync(resolvedPath)}`);
    }
  });
  
  // Also check what the actual integration-service-adapter path is
  const find = spawn('find', ['src', '-name', '*integration-service-adapter*'], {
    stdio: 'pipe',
    cwd: repoRoot
  });
  
  let findStdout = '';
  find.stdout.on('data', (data) => findStdout += data.toString());
  find.on('close', () => {
    console.log(`\n📁 Actual integration-service-adapter files:`);
    findStdout.trim().split('\n').forEach(file => {
      if (file) {
        const fullPath = path.resolve(repoRoot, file);
        const normalized = path.normalize(fullPath);
        console.log(`  ${normalized}`);
      }
    });
  });
}

main().catch(console.error);