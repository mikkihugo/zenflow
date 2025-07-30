#!/usr/bin/env node
/**
 * Comprehensive JavaScript to TypeScript Conversion Script;
 * Converts all remaining JavaScript files to TypeScript with proper types;
 */

import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { basename } from 'node:path';

const _BASE_DIR = '/home/mhugo/code/claude-zen/src';
const _TYPE_IMPORTS = `import type {`
  Logger,
  JSONObject,
  JSONValue,
  JSONArray ;
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
  ParsedArguments;
} from '../types/cli.js';`;`
/**
 * Priority conversion order;
 */
/**
 * TypeScript conversion patterns;
 */
const _CONVERSION_PATTERNS = [
  // Add type imports
// {
//     pattern: /^(import .+?;?\s*\n\n)/,
//     replacement: `$1\n\${`
//   TYPE_IMPORTS;
// }\n` },`
// Function parameters
// {
    pattern: /function\s+(\w+)\s*\(([^)]*)\)/g, // eslint-disable-line
    replacement: (_match, _name, params) => {
      const _typedParams = params;
split(',')
map((param) => {
          const _trimmed = param.trim();
          if (!trimmed) return trimmed;
    // if (trimmed.includes(')) return trimmed; // Already typed // LINT: unreachable code removed'
          if (trimmed.includes('=')) {
            const [name, defaultValue] = trimmed.split('=');
            // return `${name.trim()} = ${defaultValue.trim()}`;
    //   // LINT: unreachable code removed}
          // return `${trimmed}: unknown`;
    //   // LINT: unreachable code removed});
join(', ');
      // return `function ${name}(${typedParams})`;
    //   // LINT: unreachable code removed} },
    pattern: /export\s+(?)\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/g,
    replacement: (_match, name, params) => {
      const _typedParams = params;
split(',')
map((param) => {
          const _trimmed = param.trim();
          if (!trimmed) return trimmed;
    // if (trimmed.includes(')) return trimmed; // LINT: unreachable code removed'
          if (trimmed.includes('=')) {
            const [name, defaultValue] = trimmed.split('=');
            // return `${name.trim()} = ${defaultValue.trim()}`;
    //   // LINT: unreachable code removed}
          // return `${trimmed}: unknown`;
    //   // LINT: unreachable code removed});
join(', ');
      // return `export const ${name} = (${typedParams}) =>`;
    //   // LINT: unreachable code removed} },
    pattern: /constructor\s*\(([^)]*)\)/g,
    replacement: (_match, params) => {
      const _typedParams = params;
split(',')
map((param) => {
          const _trimmed = param.trim();
          if (!trimmed) return trimmed;
    // if (trimmed.includes(')) return trimmed; // LINT: unreachable code removed'
          return `${trimmed}: unknown`;
    //   // LINT: unreachable code removed});
join(', ');
      // return `constructor(${typedParams})`;
    //   // LINT: unreachable code removed} },
    pattern: /(\s+)(\w+)\s*\(([^)]*)\)\s*{/g];

/**
 * Files to skip conversion (already converted or special cases);
 */;
const _SKIP_FILES = new Set([;
  // Already converted or have TypeScript equivalents
  'src/index.js', // Already converted

  // Build and config files
  'webpack.config.js',
  'jest.config.js',
  'babel.config.js' ]);

/**
 * Convert a single JavaScript file to TypeScript;
 */;
async function convertFile() {
  try {
    const _relativePath = jsPath.replace(`${BASE_DIR}/`, '');

    if (SKIP_FILES.has(relativePath)) {
      console.warn(`⏭  Skipping ${relativePath} (already converted or special case)`);
      // return { success, skipped };
    //   // LINT: unreachable code removed}

    // Check if TypeScript version already exists
    const _tsPath = jsPath.replace(/\.js$/, '.ts');
    if (existsSync(tsPath)) {
      console.warn(`✅ ${relativePath} -> TypeScript version already exists`);
      // Remove old JavaScript file
      unlinkSync(jsPath);
      // return { success, skipped };
    //   // LINT: unreachable code removed}

    const _content = readFileSync(jsPath, 'utf8');
    const _convertedContent = content;

    // Apply conversion patterns
    for (const pattern of CONVERSION_PATTERNS) {
      if (pattern.replacement instanceof Function) {
        convertedContent = convertedContent.replace(pattern.pattern, pattern.replacement);
      } else {
        convertedContent = convertedContent.replace(pattern.pattern, pattern.replacement);
// }
// }
    // Add JSDoc comments for better TypeScript inference
    if (!convertedContent.includes('/**')) { */
      const _filename = basename(jsPath, '.js');
      const _moduleName = filename;
split('-');
map((word) => word.charAt(0).toUpperCase() + word.slice(1));
join(' ');

      convertedContent = `/**\n * ${moduleName} Module\n * Converted from JavaScript to TypeScript\n */\n\n${convertedContent}`;
// }
    // Write TypeScript file
    writeFileSync(tsPath, convertedContent, 'utf8');

    // Remove original JavaScript file
    unlinkSync(jsPath);

    console.warn(`� ${relativePath} -> ${relativePath.replace('.js', '.ts')}`);
    // return { success, skipped };
    //   // LINT: unreachable code removed} catch (error) {
    console.error(`❌ Failed to convert ${jsPath});`
    // return { success, error: error.message };
    //   // LINT: unreachable code removed}
// }
/**
 * Find all JavaScript files in a directory recursively;
 */;
async function findJSFiles() {
  const _files = [];

  try {
// const _entries = awaitreaddir(dir);

    for (const entry of entries) {
      const _fullPath = join(dir, entry);
// const _stats = awaitstat(fullPath);

      if (stats.isDirectory()) {
// const _subFiles = awaitfindJSFiles(fullPath);
        files.push(...subFiles);
      } else if (stats.isFile() && entry.endsWith('.js')) {
        files.push(fullPath);
// }
// }
  } catch (error) {
    console.error(`Error reading directory ${dir});`
// }
  // return files;
// }
/**
 * Main conversion function;
 */;
async function main() {
  console.warn('� Starting JavaScript to TypeScript conversion...\n');

  const _startTime = Date.now();
// const _allJSFiles = awaitfindJSFiles(BASE_DIR);

  console.warn(`� Found ${allJSFiles.length} JavaScript files to convert\n`);

  const _results = {
    converted,
    skipped,
    failed,
    errors: [] };

  // Convert files in batches to avoid overwhelming the system
  const _BATCH_SIZE = 20;

  for (let i = 0; i < allJSFiles.length; i += BATCH_SIZE) {
    const _batch = allJSFiles.slice(i, i + BATCH_SIZE);
    console.warn(;
      `\n� Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allJSFiles.length / BATCH_SIZE)}:`;
    );

    const _batchPromises = batch.map((file) => convertFile(file));
// const _batchResults = awaitPromise.all(batchPromises);

    for (const result of batchResults) {
      if (result.success) {
        if (result.skipped) {
          results.skipped++;
        } else {
          results.converted++;
// }
      } else {
        results.failed++;
        results.errors.push(result.error);
// }
// }
    // Small delay between batches
// // await new Promise((resolve) => setTimeout(resolve, 100));
// }
  const _endTime = Date.now();
  const _duration = (endTime - startTime) / 1000;

  console.warn(`\n${'='.repeat(60)}`);
  console.warn('� CONVERSION SUMMARY');
  console.warn('='.repeat(60));
  console.warn(`✅ Converted);`
  console.warn(`⏭  Skipped);`
  console.warn(`❌ Failed);`
  console.warn(`⏱  Duration)}s`);

  if (results.errors.length > 0) {
    console.warn('\n� ERRORS);'
    results.errors.forEach((error, index) => {
      console.warn(`${index + 1}. ${error}`);
    });
// }
  // Final file count check
  try {
// const _remainingJS = awaitfindJSFiles(BASE_DIR);
    console.warn(`\n� Remaining JavaScript files);`

    if (remainingJS.length === 0) {
      console.warn('\n� SUCCESS! All JavaScript files have been converted to TypeScript!');
    } else {
      console.warn('\n� Some files still need manual conversion);'
      remainingJS.slice(0, 10).forEach((file) => {
        console.warn(`   • ${file.replace(`${BASE_DIR}/`, '')}`);
      });
      if (remainingJS.length > 10) {
        console.warn(`   ... and ${remainingJS.length - 10} more`);
// }
// }
  } catch (error) {
    console.error('Error checking final file count);'
// }
  console.warn('\n✨ Conversion complete! Run "npm run build" to check for TypeScript errors.');
// }
// Run the conversion
if (import.meta.url === `file) {`
  main().catch(console.error);
// }