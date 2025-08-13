#!/usr/bin/env node
/**
 * Batch Fix 'any' Types Script
 *
 * Systematically replaces 'any' types with proper TypeScript types
 * across the entire codebase in a prioritized manner.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Common 'any' type replacements
const REPLACEMENTS = [
  // Method parameters
  { from: /meta\?: any/g, to: 'meta?: unknown' },
  { from: /data: any/g, to: 'data: unknown' },
  { from: /params\?: any\[\]/g, to: 'params?: unknown[]' },
  { from: /options\?: any/g, to: 'options?: Record<string, unknown>' },
  { from: /config: any/g, to: 'config: Record<string, unknown>' },
  { from: /result: any/g, to: 'result: unknown' },
  { from: /value: any/g, to: 'value: unknown' },

  // Return types
  { from: /Promise<any>/g, to: 'Promise<unknown>' },
  { from: /: any\[\]/g, to: ': unknown[]' },
  { from: /Record<string, any>/g, to: 'Record<string, unknown>' },

  // Common interfaces
  { from: /rows: any\[\]/g, to: 'rows: Record<string, unknown>[]' },
  { from: /insertId\?: any/g, to: 'insertId?: string | number' },
  { from: /defaultValue\?: any/g, to: 'defaultValue?: unknown' },
];

// Files to prioritize (most impact)
const PRIORITY_PATTERNS = [
  'src/core/**/*.ts',
  'src/interfaces/**/*.ts',
  'src/di/**/*.ts',
  'src/coordination/**/*.ts',
  'src/knowledge/**/*.ts',
];

function findTypescriptFiles(dir, pattern) {
  try {
    const files = execSync(
      `find ${dir} -name "*.ts" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./build/*" -not -path "./zen-neural-stack/*"`,
      { encoding: 'utf-8' }
    )
      .split('\n')
      .filter((f) => f.length > 0);

    if (pattern) {
      return files.filter((f) => f.includes(pattern));
    }
    return files;
  } catch (error) {
    console.error('Error finding TypeScript files:', error.message);
    return [];
  }
}

function countAnyTypes(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const anyMatches = content.match(/: any\b|<any>|\bany\[\]/g);
    return anyMatches ? anyMatches.length : 0;
  } catch (error) {
    return 0;
  }
}

function fixAnyTypes(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changesMade = 0;

    for (const replacement of REPLACEMENTS) {
      const matches = content.match(replacement.from);
      if (matches) {
        content = content.replace(replacement.from, replacement.to);
        changesMade += matches.length;
      }
    }

    if (changesMade > 0) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Fixed ${changesMade} 'any' types in ${filePath}`);
    }

    return changesMade;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return 0;
  }
}

function main() {
  console.log("🚀 Starting batch 'any' type fixes...\n");

  // Find all TypeScript files and sort by 'any' type count
  const allFiles = findTypescriptFiles('src');
  const fileStats = allFiles
    .map((file) => ({
      path: file,
      anyCount: countAnyTypes(file),
    }))
    .filter((stat) => stat.anyCount > 0)
    .sort((a, b) => b.anyCount - a.anyCount);

  console.log(`📊 Found ${fileStats.length} files with 'any' types\n`);
  console.log("🎯 Top 10 files with most 'any' types:");
  fileStats.slice(0, 10).forEach((stat, i) => {
    console.log(`  ${i + 1}. ${stat.path} (${stat.anyCount} 'any' types)`);
  });
  console.log('');

  let totalFixed = 0;
  let filesModified = 0;

  // Process files in priority order
  for (const fileStat of fileStats) {
    const fixed = fixAnyTypes(fileStat.path);
    if (fixed > 0) {
      totalFixed += fixed;
      filesModified++;
    }
  }

  console.log(`\n✨ Batch fix complete!`);
  console.log(
    `📈 Fixed ${totalFixed} 'any' types across ${filesModified} files`
  );

  // Run linter to see improvement
  console.log('\n🔍 Running linter to check improvement...');
  try {
    execSync('npx biome check src --reporter=summary', { stdio: 'inherit' });
  } catch (error) {
    console.log('Linter found remaining issues (expected)');
  }
}

if (require.main === module) {
  main();
}
