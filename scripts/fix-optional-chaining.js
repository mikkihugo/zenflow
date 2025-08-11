#!/usr/bin/env node

/**
 * Fix Optional Chaining Issues Script
 * Fixes systematic TS2779 "The left-hand side of an assignment expression may not be an optional property access" errors
 * Also fixes unnecessary optional chaining where objects are guaranteed to exist
 */

import fs from 'fs';
import { glob } from 'glob';
import path from 'path';

class OptionalChainingFixer {
  constructor() {
    this.baseDir = path.resolve(process.cwd(), 'src');
    this.fixedFiles = [];
  }

  async fix() {
    // console.log('🔧 Auto-Fixing Optional Chaining Issues...');

    // Find all TypeScript files
    const pattern = path.join(this.baseDir, '**/*.{ts,tsx}');
    const files = await glob(pattern, {
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.d.ts',
        '**/__tests__/**',
        '**/tests/**',
      ],
    });

    // console.log(`📁 Found ${files.length} TypeScript files to check`);

    // Process each file
    for (const filePath of files) {
      await this.fixOptionalChainingInFile(filePath);
    }

    // console.log(`\n✅ Optional chaining fixing complete:`);
    // console.log(`   📝 Fixed ${this.fixedFiles.length} files`);

    if (this.fixedFiles.length > 0) {
      // console.log(`\n📋 Fixed files:`);
      this.fixedFiles.forEach((file) => {
        const relative = path.relative(this.baseDir, file.path);
        // console.log(`   • ${relative} (${file.changes.join(', ')})`);
      });
    }
  }

  async fixOptionalChainingInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    const changes = [];

    // 1. Fix TS2779: Assignment to optional property access
    const beforeAssignment = updatedContent;
    updatedContent = this.fixOptionalAssignments(updatedContent);
    if (updatedContent !== beforeAssignment) {
      changes.push('optional assignments');
    }

    // 2. Fix unnecessary optional chaining on guaranteed objects
    const beforeChaining = updatedContent;
    updatedContent = this.fixUnnecessaryOptionalChaining(updatedContent);
    if (updatedContent !== beforeChaining) {
      changes.push('unnecessary chaining');
    }

    // 3. Fix array access optional chaining issues
    const beforeArrays = updatedContent;
    updatedContent = this.fixOptionalArrayAccess(updatedContent);
    if (updatedContent !== beforeArrays) {
      changes.push('array access');
    }

    // Write back if changed
    if (updatedContent !== content && changes.length > 0) {
      fs.writeFileSync(filePath, updatedContent);
      this.fixedFiles.push({
        path: filePath,
        changes,
      });
    }
  }

  fixOptionalAssignments(content) {
    // Fix patterns like: obj?.prop = value (TS2779 error)
    // Convert to: obj.prop = value (when obj is guaranteed to exist)

    const fixes = [
      // Common patterns where object is guaranteed to exist
      {
        // results?.files[key] = value -> results.files[key] = value
        pattern:
          /(\w+)\?\.(files|properties|items|data|config|options|params)\[/g,
        replacement: '$1.$2[',
        condition: (match, objName) => {
          // Only fix if object is initialized in same function/block
          const objPattern = new RegExp(
            `(const|let|var)\\s+${objName}\\s*=\\s*\\{`,
            'i',
          );
          return objPattern.test(content);
        },
      },
      {
        // obj?.prop = value -> obj.prop = value
        pattern: /(\w+)\?\.([\w$]+)\s*=/g,
        replacement: '$1.$2 =',
        condition: (match, objName) => {
          // Common guaranteed object names
          const guaranteedObjects = [
            'results',
            'config',
            'options',
            'data',
            'this',
            'ctx',
            'context',
          ];
          return guaranteedObjects.includes(objName.toLowerCase());
        },
      },
      {
        // this?.prop = value -> this.prop = value
        pattern: /this\?\.([\w$]+)\s*=/g,
        replacement: 'this.$1 =',
        condition: () => true, // 'this' is always guaranteed
      },
    ];

    let updatedContent = content;

    fixes.forEach((fix) => {
      updatedContent = updatedContent.replace(
        fix.pattern,
        (match, ...groups) => {
          if (fix.condition && !fix.condition(match, ...groups)) {
            return match; // Don't replace if condition fails
          }
          return fix.replacement.replace(
            /\$(\d+)/g,
            (_, num) => groups[Number.parseInt(num) - 1],
          );
        },
      );
    });

    return updatedContent;
  }

  fixUnnecessaryOptionalChaining(content) {
    // Fix optional chaining where it's not needed

    const fixes = [
      // Array methods that should not use optional chaining
      {
        pattern:
          /(\w+)\?\.(forEach|map|filter|reduce|find|some|every|slice|push|pop)\(/g,
        replacement: '$1.$2(',
        condition: (match, arrayName) => {
          // Check if array is initialized or is a known array type
          const arrayInitPattern = new RegExp(
            `(const|let|var)\\s+${arrayName}\\s*=\\s*\\[`,
          );
          const arrayTypePattern = new RegExp(`${arrayName}:\\s*\\w+\\[\\]`);
          return (
            arrayInitPattern.test(content) || arrayTypePattern.test(content)
          );
        },
      },

      // Object methods on guaranteed objects
      {
        pattern: /Object\?\.(keys|values|entries)\(/g,
        replacement: 'Object.$1(',
        condition: () => true, // Object is always available
      },

      // String methods
      {
        pattern:
          /(\w+)\?\.(length|substring|slice|toLowerCase|toUpperCase|trim|includes|startsWith|endsWith)/g,
        replacement: '$1.$2',
        condition: (match, varName) => {
          // Check if variable is typed as string or initialized as string
          const stringPattern = new RegExp(
            `${varName}:\\s*string|${varName}\\s*=\\s*['"']`,
          );
          return stringPattern.test(content);
        },
      },

      // Number methods
      {
        pattern: /(\w+)\?\.(toString|toFixed|toPrecision)\(/g,
        replacement: '$1.$2(',
        condition: (match, varName) => {
          // Check if variable is typed as number
          const numberPattern = new RegExp(`${varName}:\\s*number`);
          return numberPattern.test(content);
        },
      },
    ];

    let updatedContent = content;

    fixes.forEach((fix) => {
      updatedContent = updatedContent.replace(
        fix.pattern,
        (match, ...groups) => {
          if (fix.condition && !fix.condition(match, ...groups)) {
            return match;
          }
          return fix.replacement.replace(
            /\$(\d+)/g,
            (_, num) => groups[Number.parseInt(num) - 1],
          );
        },
      );
    });

    return updatedContent;
  }

  fixOptionalArrayAccess(content) {
    // Fix optional chaining with array access

    const fixes = [
      // arr?.[index] -> arr[index] when array is guaranteed
      {
        pattern: /(\w+)\?\.\[(\w+|\d+)\]/g,
        replacement: '$1[$2]',
        condition: (match, arrayName) => {
          // Check if array is initialized or guaranteed to exist
          const guaranteedArrays = [
            'Array',
            'arguments',
            'results',
            'items',
            'data',
          ];
          return guaranteedArrays.some((name) =>
            arrayName.toLowerCase().includes(name.toLowerCase()),
          );
        },
      },

      // Fix function call results that are arrays
      {
        pattern: /(\w+\(\))\?\.\[/g,
        replacement: '$1[',
        condition: (match, call) => {
          // Common functions that always return arrays
          const arrayFunctions = ['split', 'filter', 'map', 'slice', 'concat'];
          return arrayFunctions.some((fn) => call.includes(fn));
        },
      },
    ];

    let updatedContent = content;

    fixes.forEach((fix) => {
      updatedContent = updatedContent.replace(
        fix.pattern,
        (match, ...groups) => {
          if (fix.condition && !fix.condition(match, ...groups)) {
            return match;
          }
          return fix.replacement.replace(
            /\$(\d+)/g,
            (_, num) => groups[Number.parseInt(num) - 1],
          );
        },
      );
    });

    return updatedContent;
  }
}

// Main execution
async function main() {
  try {
    const fixer = new OptionalChainingFixer();
    await fixer.fix();

    // console.log('\n🎉 Optional chaining fixing complete!');
    // console.log('\n💡 Benefits:');
    // console.log('   • Fixed TS2779 "assignment to optional property access" errors');
    // console.log('   • Removed unnecessary optional chaining on guaranteed objects');
    // console.log('   • Improved code clarity and performance');

    // console.log('\n🔧 Next steps:');
    // console.log('   1. Run TypeScript compilation to verify fixes');
    // console.log('   2. Test functionality to ensure no runtime errors');
    // console.log('   3. Review any remaining optional chaining warnings');
  } catch (error) {
    // console.error('❌ Optional chaining fixing failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { OptionalChainingFixer };
