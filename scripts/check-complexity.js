#!/usr/bin/env node

/**
 * @file Code complexity checker using escomplex and simple file size checks.
 * Replaces ESLint complexity rules with direct analysis.
 */

import escomplex from 'escomplex';
import { readdirSync, readFileSync, statSync } from 'fs';
import { extname, join } from 'path';

const MAX_CYCLOMATIC_COMPLEXITY = 15;
const MAX_LINES_PER_FILE = 500;
const MAX_LINES_PER_FUNCTION = 100;

/**
 * Get all TypeScript files in a directory recursively.
 */
function getTsFiles(dir) {
  const files = [];
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (
      stat.isDirectory() &&
      !['node_modules', 'dist', 'build', 'coverage', 'docs'].includes(item)
    ) {
      files.push(...getTsFiles(fullPath));
    } else if (
      stat.isFile() &&
      extname(item) === '.ts' &&
      !item.includes('.test.') &&
      !item.includes('.spec.')
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Check complexity of a single file.
 */
function checkFileComplexity(filepath) {
  try {
    const content = readFileSync(filepath, 'utf8');
    const lines = content.split('\n');
    const nonEmptyLines = lines.filter((line) => line.trim().length > 0).length;

    console.log(`📁 ${filepath}`);

    // File size check
    if (nonEmptyLines > MAX_LINES_PER_FILE) {
      console.log(
        `  🔴 File too large: ${nonEmptyLines} lines (max: ${MAX_LINES_PER_FILE})`
      );
    }

    // Try complexity analysis (may fail for some TS syntax)
    try {
      const report = escomplex.analyse(content, {
        logicalor: false,
        switchcase: false,
        forin: false,
        trycatch: true,
      });

      // Check cyclomatic complexity
      if (report.aggregate.cyclomatic > MAX_CYCLOMATIC_COMPLEXITY) {
        console.log(
          `  🔴 High cyclomatic complexity: ${report.aggregate.cyclomatic} (max: ${MAX_CYCLOMATIC_COMPLEXITY})`
        );
      }

      // Check function complexity
      for (const func of report.functions) {
        if (func.cyclomatic > MAX_CYCLOMATIC_COMPLEXITY) {
          console.log(
            `  🟡 Function "${func.name}" complexity: ${func.cyclomatic} (max: ${MAX_CYCLOMATIC_COMPLEXITY})`
          );
        }
        if (func.sloc.logical > MAX_LINES_PER_FUNCTION) {
          console.log(
            `  🟡 Function "${func.name}" too long: ${func.sloc.logical} lines (max: ${MAX_LINES_PER_FUNCTION})`
          );
        }
      }

      if (
        report.aggregate.cyclomatic <= MAX_CYCLOMATIC_COMPLEXITY &&
        nonEmptyLines <= MAX_LINES_PER_FILE
      ) {
        console.log(
          `  ✅ Complexity OK (cyclomatic: ${report.aggregate.cyclomatic}, lines: ${nonEmptyLines})`
        );
      }
    } catch (parseError) {
      // Simple line count for files that can't be parsed
      console.log(
        `  ⚠️  Parse error, checking line count only: ${nonEmptyLines} lines`
      );
    }

    console.log('');
  } catch (error) {
    console.error(`❌ Error checking ${filepath}:`, error.message);
  }
}

/**
 * Main function to run complexity checks.
 */
async function main() {
  console.log('🔍 Running Code Complexity Analysis...\n');

  const files = getTsFiles('src');
  console.log(`Found ${files.length} TypeScript files\n`);

  for (const file of files) {
    checkFileComplexity(file);
  }

  console.log('📊 Complexity analysis complete!');
  console.log(
    `\nLimits: Cyclomatic ≤ ${MAX_CYCLOMATIC_COMPLEXITY}, File lines ≤ ${MAX_LINES_PER_FILE}, Function lines ≤ ${MAX_LINES_PER_FUNCTION}`
  );
}

main().catch(console.error);
