#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverDir = join(__dirname, 'apps/claude-code-zen-server/src');

function fixImportStatements(content) {
  let fixed = content;
  
  // Fix double single quotes in import statements
  fixed = fixed.replace(/from\s+['"]([^'"]+)['"][''];/g, "from '$1';");
  fixed = fixed.replace(/from\s+['"]([^'"]+)['"]['"]/g, "from '$1'");
  
  // Fix unterminated string literals in general
  fixed = fixed.replace(/(['"]+)([^'"]*?)(['"]+)(['"])+/g, '$1$2$3');
  
  // Fix import statements with extra quotes
  fixed = fixed.replace(/import\s+([^'"]*)['"]([^'"]+)['"](['"];)/g, "import $1'$2';");
  
  // Fix basic string termination issues
  fixed = fixed.replace(/''/g, "'");
  fixed = fixed.replace(/""/g, '"');
  
  return fixed;
}

function walkDirectory(dir, callback) {
  try {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      
      if (entry === 'node_modules' || entry === 'dist' || entry === 'build') {
        continue;
      }
      
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        walkDirectory(fullPath, callback);
      } else if (entry.endsWith('.ts') && !entry.endsWith('.d.ts')) {
        callback(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
}

console.log('🔧 Fixing import statements and string literals...\n');

let fixedCount = 0;

walkDirectory(serverDir, (filePath) => {
  try {
    const content = readFileSync(filePath, 'utf8');
    const fixed = fixImportStatements(content);
    
    if (content !== fixed) {
      writeFileSync(filePath, fixed, 'utf8');
      console.log(`✅ Fixed: ${filePath.replace(__dirname, '.')}`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n✨ Fixed ${fixedCount} files with import/string issues.`);
console.log('🔍 Run ESLint again to check for remaining errors.');