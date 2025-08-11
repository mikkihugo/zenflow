#!/usr/bin/env node
/**
 * Script to automatically fix common TypeScript errors
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Pattern fixes
const fixes = {
  // Fix unused parameters (prefix with underscore)
  unusedParams: {
    pattern: /\b(\w+)\s+is declared but (its value is )?never (read|used)/,
    fix: (content, match) => {
      const varName = match[1];
      if (!varName.startsWith('_')) {
        // Replace the parameter/variable with underscore prefix
        const regex = new RegExp(`\\b${varName}\\b`, 'g');
        return content.replace(regex, `_${varName}`);
      }
      return content;
    },
  },

  // Fix possibly undefined with optional chaining
  possiblyUndefined: {
    pattern: /Object is possibly 'undefined'/,
    fix: (content) => {
      // Add optional chaining where needed
      return content.replace(/(\w+)\.(\w+)(?!\?)/g, '$1?.$2');
    },
  },

  // Fix unknown error types
  unknownError: {
    pattern: /'error' is of type 'unknown'/,
    fix: (content) => {
      return content
        .replace(/catch\s*\(\s*error\s*\)/g, 'catch (error)')
        .replace(
          /\{ error \}/g,
          '{ error: error instanceof Error ? error.message : String(error) }',
        );
    },
  },

  // Fix type assignments with exactOptionalPropertyTypes
  exactOptionalProps: {
    pattern:
      /not assignable to type .* with 'exactOptionalPropertyTypes: true'/,
    fix: (content) => {
      // Add 'as Type | undefined' where needed
      return content;
    },
  },
};

async function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const [name, fixer] of Object.entries(fixes)) {
    const matches = content.match(fixer.pattern);
    if (matches) {
      const newContent = fixer.fix(content, matches);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
    return true;
  }

  return false;
}

async function main() {
  const files = glob.sync('src/**/*.ts', {
    cwd: process.cwd(),
    ignore: ['**/*.test.ts', '**/*.spec.ts', '**/node_modules/**'],
  });

  let fixedCount = 0;

  for (const file of files) {
    if (await fixFile(file)) {
      fixedCount++;
    }
  }

  console.log(`\nFixed ${fixedCount} files`);
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}
