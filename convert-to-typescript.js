#!/usr/bin/env node

/**
 * Comprehensive JavaScript to TypeScript Conversion Script
 * Converts all remaining JavaScript files to TypeScript with proper types
 */

import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { basename, join } from 'node:path';

const BASE_DIR = '/home/mhugo/code/claude-zen/src';
const TYPE_IMPORTS = `import type { 
  Logger, 
  JSONObject, 
  JSONValue, 
  JSONArray 
} from '../types/core.js';
import type {
  CommandDefinition,
  CommandContext,
  CommandHandler,
  CommandResult,
  CommandFlag,
  CommandArgument,
  CommandOption,
  CommandRegistry,
  CliConfig,
  ParsedArguments
} from '../types/cli.js';`;

/**
 * Priority conversion order
 */

/**
 * TypeScript conversion patterns
 */
const CONVERSION_PATTERNS = [
  // Add type imports
  {
    pattern: /^(import .+?;?\s*\n)/,
    replacement: `$1\n${TYPE_IMPORTS}\n`,
  },

  // Function parameters
  {
    pattern: /function\s+(\w+)\s*\(([^)]*)\)/g,
    replacement: (_match, name, params) => {
      const typedParams = params
        .split(',')
        .map((param) => {
          const trimmed = param.trim();
          if (!trimmed) return trimmed;
          if (trimmed.includes(':')) return trimmed; // Already typed
          if (trimmed.includes('=')) {
            const [name, defaultValue] = trimmed.split('=');
            return `${name.trim()}: any = ${defaultValue.trim()}`;
          }
          return `${trimmed}: any`;
        })
        .join(', ');
      return `function ${name}(${typedParams})`;
    },
  },

  // Arrow function parameters
  {
    pattern: /export\s+(?:const|let)\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/g,
    replacement: (_match, name, params) => {
      const typedParams = params
        .split(',')
        .map((param) => {
          const trimmed = param.trim();
          if (!trimmed) return trimmed;
          if (trimmed.includes(':')) return trimmed;
          if (trimmed.includes('=')) {
            const [name, defaultValue] = trimmed.split('=');
            return `${name.trim()}: any = ${defaultValue.trim()}`;
          }
          return `${trimmed}: any`;
        })
        .join(', ');
      return `export const ${name} = (${typedParams}): any =>`;
    },
  },

  // Class constructor parameters
  {
    pattern: /constructor\s*\(([^)]*)\)/g,
    replacement: (_match, params) => {
      const typedParams = params
        .split(',')
        .map((param) => {
          const trimmed = param.trim();
          if (!trimmed) return trimmed;
          if (trimmed.includes(':')) return trimmed;
          return `${trimmed}: any`;
        })
        .join(', ');
      return `constructor(${typedParams})`;
    },
  },

  // Add return types to methods
  {
    pattern: /(\s+)(\w+)\s*\(([^)]*)\)\s*{/g,
    replacement: '$1$2($3): any {',
  },
];

/**
 * Files to skip conversion (already converted or special cases)
 */
const SKIP_FILES = new Set([
  // Already converted or have TypeScript equivalents
  'src/index.js', // Already converted

  // Build and config files
  'webpack.config.js',
  'jest.config.js',
  'babel.config.js',
]);

/**
 * Convert a single JavaScript file to TypeScript
 */
async function convertFile(jsPath) {
  try {
    const relativePath = jsPath.replace(`${BASE_DIR}/`, '');

    if (SKIP_FILES.has(relativePath)) {
      console.warn(`⏭️  Skipping ${relativePath} (already converted or special case)`);
      return { success: true, skipped: true };
    }

    // Check if TypeScript version already exists
    const tsPath = jsPath.replace(/\.js$/, '.ts');
    if (existsSync(tsPath)) {
      console.warn(`✅ ${relativePath} -> TypeScript version already exists`);
      // Remove old JavaScript file
      unlinkSync(jsPath);
      return { success: true, skipped: true };
    }

    const content = readFileSync(jsPath, 'utf8');
    let convertedContent = content;

    // Apply conversion patterns
    for (const pattern of CONVERSION_PATTERNS) {
      if (pattern.replacement instanceof Function) {
        convertedContent = convertedContent.replace(pattern.pattern, pattern.replacement);
      } else {
        convertedContent = convertedContent.replace(pattern.pattern, pattern.replacement);
      }
    }

    // Add JSDoc comments for better TypeScript inference
    if (!convertedContent.includes('/**')) {
      const filename = basename(jsPath, '.js');
      const moduleName = filename
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      convertedContent = `/**\n * ${moduleName} Module\n * Converted from JavaScript to TypeScript\n */\n\n${convertedContent}`;
    }

    // Write TypeScript file
    writeFileSync(tsPath, convertedContent, 'utf8');

    // Remove original JavaScript file
    unlinkSync(jsPath);

    console.warn(`🔄 ${relativePath} -> ${relativePath.replace('.js', '.ts')}`);
    return { success: true, skipped: false };
  } catch (error) {
    console.error(`❌ Failed to convert ${jsPath}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Find all JavaScript files in a directory recursively
 */
async function findJSFiles(dir) {
  const files = [];

  try {
    const entries = await readdir(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        const subFiles = await findJSFiles(fullPath);
        files.push(...subFiles);
      } else if (stats.isFile() && entry.endsWith('.js')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }

  return files;
}

/**
 * Main conversion function
 */
async function main() {
  console.warn('🚀 Starting JavaScript to TypeScript conversion...\n');

  const startTime = Date.now();
  const allJSFiles = await findJSFiles(BASE_DIR);

  console.warn(`📁 Found ${allJSFiles.length} JavaScript files to convert\n`);

  const results = {
    converted: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  // Convert files in batches to avoid overwhelming the system
  const BATCH_SIZE = 20;

  for (let i = 0; i < allJSFiles.length; i += BATCH_SIZE) {
    const batch = allJSFiles.slice(i, i + BATCH_SIZE);
    console.warn(
      `\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allJSFiles.length / BATCH_SIZE)}:`
    );

    const batchPromises = batch.map((file) => convertFile(file));
    const batchResults = await Promise.all(batchPromises);

    for (const result of batchResults) {
      if (result.success) {
        if (result.skipped) {
          results.skipped++;
        } else {
          results.converted++;
        }
      } else {
        results.failed++;
        results.errors.push(result.error);
      }
    }

    // Small delay between batches
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  console.warn(`\n${'='.repeat(60)}`);
  console.warn('📊 CONVERSION SUMMARY');
  console.warn('='.repeat(60));
  console.warn(`✅ Converted: ${results.converted} files`);
  console.warn(`⏭️  Skipped: ${results.skipped} files`);
  console.warn(`❌ Failed: ${results.failed} files`);
  console.warn(`⏱️  Duration: ${duration.toFixed(2)}s`);

  if (results.errors.length > 0) {
    console.warn('\n🚨 ERRORS:');
    results.errors.forEach((error, index) => {
      console.warn(`${index + 1}. ${error}`);
    });
  }

  // Final file count check
  try {
    const remainingJS = await findJSFiles(BASE_DIR);
    console.warn(`\n📈 Remaining JavaScript files: ${remainingJS.length}`);

    if (remainingJS.length === 0) {
      console.warn('\n🎉 SUCCESS! All JavaScript files have been converted to TypeScript!');
    } else {
      console.warn('\n📝 Some files still need manual conversion:');
      remainingJS.slice(0, 10).forEach((file) => {
        console.warn(`   • ${file.replace(`${BASE_DIR}/`, '')}`);
      });
      if (remainingJS.length > 10) {
        console.warn(`   ... and ${remainingJS.length - 10} more`);
      }
    }
  } catch (error) {
    console.error('Error checking final file count:', error.message);
  }

  console.warn('\n✨ Conversion complete! Run "npm run build" to check for TypeScript errors.');
}

// Run the conversion
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
