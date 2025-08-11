#!/usr/bin/env node
/**
 * @file Simple JSDoc checker without ESLint - checks for basic documentation patterns.
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { extname, join } from 'path';

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
 * Check JSDoc documentation in a file.
 */
function checkJSDoc(filepath) {
  try {
    const content = readFileSync(filepath, 'utf8');
    const lines = content.split('\n');

    console.log(`📁 ${filepath}`);

    const issues = [];
    let publicFunctions = 0;
    let documentedFunctions = 0;

    // Simple regex patterns for detection
    const functionPattern =
      /^\s*(?:export\s+)?(?:async\s+)?(?:function\s+\w+|(?:const|let)\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>|class\s+\w+)/;
    const jsdocStartPattern = /^\s*\/\*\*/;
    const jsdocEndPattern = /^\s*\*\//;

    let inJSDoc = false;
    let hasJSDocBefore = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Track JSDoc blocks
      if (jsdocStartPattern.test(line)) {
        inJSDoc = true;
        hasJSDocBefore = true;
      } else if (jsdocEndPattern.test(line)) {
        inJSDoc = false;
      } else if (!inJSDoc && functionPattern.test(line)) {
        // Found a function/class definition
        publicFunctions++;

        if (hasJSDocBefore) {
          documentedFunctions++;
        } else {
          // Check if it's a public function (exported or in a class)
          const isExported = line.includes('export');
          const isPublic = !(
            line.includes('private') || line.includes('protected')
          );

          if (isExported || isPublic) {
            issues.push(
              `Line ${i + 1}: Missing JSDoc for public function/class`,
            );
          }
        }
        hasJSDocBefore = false;
      } else if (!(inJSDoc || line.trim())) {
        // Reset JSDoc flag on empty lines (simple heuristic)
        hasJSDocBefore = false;
      }
    }

    if (issues.length === 0) {
      console.log(
        `  ✅ JSDoc coverage: ${documentedFunctions}/${publicFunctions} functions documented`,
      );
    } else {
      console.log(`  🟡 JSDoc issues found:`);
      issues.forEach((issue) => console.log(`    ${issue}`));
      console.log(
        `  📊 Documentation coverage: ${documentedFunctions}/${publicFunctions} functions`,
      );
    }

    console.log('');
  } catch (error) {
    console.error(`❌ Error checking ${filepath}:`, error.message);
  }
}

/**
 * Main function to run JSDoc checks.
 */
async function main() {
  console.log('📚 Running Simple JSDoc Documentation Checks...\n');

  const files = getTsFiles('src');
  console.log(`Found ${files.length} TypeScript files\n`);

  for (const file of files) {
    checkJSDoc(file);
  }

  console.log('📊 JSDoc analysis complete!');
}

main().catch(console.error);
