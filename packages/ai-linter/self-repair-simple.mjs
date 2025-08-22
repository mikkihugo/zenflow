#!/usr/bin/env node

/**
 * Simple AI Linter Self-Repair Script
 *
 * Fixes systematic syntax corruptions using simple regex replacements
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { execSync } from 'child_process';
import path from 'path';

const projectRoot = '/home/mhugo/code/claude-code-zen';
console.log('🤖 AI Linter Self-Repair');
console.log('Project root:', projectRoot);

// Repair patterns for common systematic errors
const repairPatterns = [
  // Fix malformed union types like 'a | b' instead of 'a' | 'b'
  {
    name: 'union_types_in_quotes',
    pattern: /'([^']*\s*\|\s*[^']*)'(\s*\|\s*'[^']*')*/g,
    replacement: (match) => {
      // Split on | and wrap each part in quotes
      const parts = match.replace(/^'|'$/g, '').split(/\s*\|\s*/);
      return parts.map(part => `'${part.trim()}'`).join(' | ');
    },
  },
  // Fix import statements ending with );
  {
    name: 'import_parentheses',
    pattern: /} from (['"][^'"]+['"])\);/g,
    replacement: '} from $1;',
  },
  // Fix status assignments with extra parentheses
  {
    name: 'status_parentheses',
    pattern: /(\w+\.status = ['"][^'"]+['"]\));/g,
    replacement: '$1;',
  },
  // Fix function calls with extra parentheses
  {
    name: 'function_call_parentheses',
    pattern: /(\w+\([^)]*\));(?=\s*$)/gm,
    replacement: '$1;',
  },
];

let totalFiles = 0;
let totalFixes = 0;

async function repairFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    const originalContent = content;
    let fileFixes = 0;

    // Apply proven repair patterns
    content = content
      // Fix specific union type corruption: string' | 'symbol -> string | symbol
      .replace(/string'\s*\|\s*'symbol/g, 'string | symbol')
      // Fix malformed union types in function parameters: (event: string' | 'symbol
      .replace(/(\w+:\s*)(\w+)'\s*\|\s*'(\w+)/g, '$1$2 | $3')
      // Fix complex conditional corruption like: process.env.DEBUG_AUTH' | '' | 'process.env.NODE_ENV
      .replace(/(\w+\.\w+)'\s*\|\s*''\s*\|\s*'(\w+\.\w+)/g, '$1 || $2')
      // Fix return value corruption: return projectConfig.auth' | '' | '{};
      .replace(/(\w+\.\w+)'\s*\|\s*''\s*\|\s*'\{/g, '$1 || {')
      // Fix simple OR operator corruption: ' | '' | '
      .replace(/'\s*\|\s*''\s*\|\s*'/g, ' || ')
      // Fix template literal corruption: ${data.error_description'' | '''' | ''data.error}
      .replace(/\$\{([^}]+)''\s*\|\s*''\s*\|\s*''([^}]+)\}/g, '${$1 || $2}')
      // Fix string literal corruption: process.env.ZEN_SERVER_HOST'' | '''' | '''localhost'
      .replace(/(\w+(?:\.\w+)*)'\s*\|\s*''\s*\|\s*'''([^']*)/g, "$1 || '$2'")
      // Fix template string inside template: ${var'' | '''' | ''other}
      .replace(/(\w+)'\s*\|\s*''\s*\|\s*''(\w+)/g, '$1 || $2')
      // Fix import statements
      .replace(/} from (['"][^'"]+['"])\);/g, '} from $1;')
      // Fix function calls with extra parentheses
      .replace(/(\w+\(\)\));/g, '$1();');

    if (content !== originalContent) {
      writeFileSync(filePath, content, 'utf-8');
      const lines1 = originalContent.split('\n').length;
      const lines2 = content.split('\n').length;
      fileFixes = Math.abs(lines1 - lines2) + 1;
      console.log(`🔧 Fixed ${fileFixes} issues in ${path.relative(projectRoot, filePath)}`);
      totalFixes += fileFixes;
    }

    totalFiles++;
  } catch (error) {
    console.warn(`⚠️ Could not process ${filePath}:`, error.message);
  }
}

async function main() {
  console.log('🔍 Finding TypeScript files...');

  const files = await glob(`${projectRoot}/**/*.ts`, {
    ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
  });

  console.log(`📁 Found ${files.length} files to process\n`);

  for (const file of files) {
    await repairFile(file);
  }

  console.log('\n✅ Self-repair completed:');
  console.log(`   Files processed: ${totalFiles}`);
  console.log(`   Issues fixed: ${totalFixes}`);

  // Test TypeScript compilation
  console.log('\n🔍 Testing TypeScript compilation...');
  try {
    execSync('npx tsc --noEmit', {
      cwd: projectRoot,
      stdio: 'pipe',
    });
    console.log('✅ TypeScript compilation successful!');
  } catch (error) {
    console.log('❌ Some TypeScript errors remain');
    // Show first few errors
    try {
      const result = execSync('npx tsc --noEmit 2>&1 | head -10', {
        cwd: projectRoot,
        encoding: 'utf-8',
      });
      console.log('First few errors:');
      console.log(result);
    } catch {}
  }
}

main().catch(console.error);