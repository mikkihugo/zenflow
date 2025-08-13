#!/usr/bin/env node
/**
 * Hybrid TypeScript + Biome Fixer
 *
 * Uses the best of both worlds:
 * 1. TypeScript compiler for detailed error locations (like old ESLint)
 * 2. Biome for fast formatting and style fixes
 * 3. Batch processing for efficiency
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HybridFixer {
  constructor(options = {}) {
    this.dryRun = options.dryRun;
    this.totalFixed = 0;
    this.totalFilesProcessed = 0;
  }

  // Get detailed TypeScript compiler errors (like ESLint used to do)
  async getTypeScriptErrors() {
    console.log('🔍 Getting detailed TypeScript errors...');
    try {
      execSync('tsc --noEmit --skipLibCheck', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      console.log('✅ No TypeScript compilation errors!');
      return new Map();
    } catch (error) {
      if (error.stdout) {
        return this.parseTypeScriptOutput(error.stdout);
      }
      return new Map();
    }
  }

  parseTypeScriptOutput(output) {
    const fileErrors = new Map();
    const lines = output.split('\n');

    lines.forEach((line) => {
      // Parse TypeScript error format: src/file.ts(123,45): error TS2345: Message
      const match = line.match(
        /^([^(]+)\((\d+),(\d+)\):\s*error\s+TS(\d+):\s*(.+)$/
      );
      if (match) {
        const [, filePath, line, col, errorCode, message] = match;

        if (!fileErrors.has(filePath)) {
          fileErrors.set(filePath, []);
        }

        fileErrors.get(filePath).push({
          file: filePath,
          line: Number.parseInt(line),
          column: Number.parseInt(col),
          errorCode: `TS${errorCode}`,
          message: message.trim(),
          type: this.categorizeTypeScriptError(errorCode, message),
        });
      }
    });

    return fileErrors;
  }

  categorizeTypeScriptError(errorCode, message) {
    // Common TypeScript error patterns
    if (message.includes('any')) return 'any-type';
    if (message.includes("implicitly has an 'any' type")) return 'implicit-any';
    if (message.includes('Parameter') && message.includes('implicitly'))
      return 'implicit-any';
    if (message.includes('Cannot find name')) return 'undeclared-variable';
    if (message.includes('is never read')) return 'unused-variable';
    if (message.includes('is declared but never used')) return 'unused-import';
    if (message.includes('Object literal may only specify known properties'))
      return 'excess-property';
    if (message.includes('not assignable to parameter')) return 'type-mismatch';
    if (message.includes("possibly 'undefined'")) return 'undefined-check';

    return 'other';
  }

  // Process file with batched fixes + immediate linting
  async processSingleFileComprehensive(filePath, errors) {
    console.log(`\n🔧 Fixing ${filePath} (${errors.length} errors)`);

    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  File not found: ${filePath}`);
      return 0;
    }

    try {
      let content = fs.readFileSync(filePath, 'utf-8');
      const originalContent = content;
      let totalFixes = 0;

      // Group errors by type for efficient processing
      const errorsByType = this.groupErrorsByType(errors);

      // Apply comprehensive fixes in order of priority
      console.log(
        `  📊 Error types: ${Array.from(errorsByType.keys()).join(', ')}`
      );

      // 1. Fix 'any' types first (highest priority)
      if (errorsByType.has('any-type') || errorsByType.has('implicit-any')) {
        const anyFixes = this.fixAllAnyTypes(content);
        if (anyFixes.fixed) {
          content = anyFixes.content;
          totalFixes += anyFixes.count;
          console.log(`    ✅ Fixed ${anyFixes.count} 'any' types`);
        }
      }

      // 2. Fix undeclared variables
      if (errorsByType.has('undeclared-variable')) {
        const undeclaredFixes = this.fixUndeclaredVariables(
          content,
          errorsByType.get('undeclared-variable')
        );
        if (undeclaredFixes.fixed) {
          content = undeclaredFixes.content;
          totalFixes += undeclaredFixes.count;
          console.log(
            `    ✅ Fixed ${undeclaredFixes.count} undeclared variables`
          );
        }
      }

      // 3. Fix unused variables and imports
      if (
        errorsByType.has('unused-variable') ||
        errorsByType.has('unused-import')
      ) {
        const unusedFixes = this.fixUnusedItems(content, errors);
        if (unusedFixes.fixed) {
          content = unusedFixes.content;
          totalFixes += unusedFixes.count;
          console.log(`    ✅ Fixed ${unusedFixes.count} unused items`);
        }
      }

      // 4. Fix type mismatches and undefined checks
      if (
        errorsByType.has('type-mismatch') ||
        errorsByType.has('undefined-check')
      ) {
        const typeFixes = this.fixTypeIssues(content, errors);
        if (typeFixes.fixed) {
          content = typeFixes.content;
          totalFixes += typeFixes.count;
          console.log(`    ✅ Fixed ${typeFixes.count} type issues`);
        }
      }

      // Apply and verify changes
      if (content !== originalContent && !this.dryRun) {
        fs.writeFileSync(filePath, content, 'utf-8');
        this.totalFixed += totalFixes;
        this.totalFilesProcessed++;

        // Format with Biome immediately after fixing
        await this.formatWithBiome(filePath);

        // Quick verification
        await this.verifyFileCompilation(filePath);
      } else if (this.dryRun && content !== originalContent) {
        console.log(`  🔍 [DRY RUN] Would apply ${totalFixes} fixes`);
      } else {
        console.log(`  ℹ️  No fixes applied for this file`);
      }

      return totalFixes;
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
      return 0;
    }
  }

  groupErrorsByType(errors) {
    const groups = new Map();
    errors.forEach((error) => {
      const type = error.type || 'other';
      if (!groups.has(type)) {
        groups.set(type, []);
      }
      groups.get(type).push(error);
    });
    return groups;
  }

  fixAllAnyTypes(content) {
    let fixedContent = content;
    let fixCount = 0;

    // Comprehensive 'any' type replacements
    const replacements = [
      // Function parameters
      {
        from: /\(([^:)]+):\s*any\)/g,
        to: '($1: unknown)',
        desc: 'function parameters',
      },
      { from: /meta\?:\s*any/g, to: 'meta?: unknown', desc: 'meta parameters' },
      { from: /data:\s*any/g, to: 'data: unknown', desc: 'data properties' },
      {
        from: /params\?:\s*any\[\]/g,
        to: 'params?: unknown[]',
        desc: 'parameter arrays',
      },
      {
        from: /options\?:\s*any/g,
        to: 'options?: Record<string, unknown>',
        desc: 'options objects',
      },
      {
        from: /config:\s*any/g,
        to: 'config: Record<string, unknown>',
        desc: 'config objects',
      },
      { from: /result:\s*any/g, to: 'result: unknown', desc: 'results' },
      { from: /value:\s*any/g, to: 'value: unknown', desc: 'values' },

      // Return types and promises
      {
        from: /:\s*Promise<any>/g,
        to: ': Promise<unknown>',
        desc: 'promise returns',
      },
      { from: /:\s*any\[\]/g, to: ': unknown[]', desc: 'array types' },
      {
        from: /Record<string,\s*any>/g,
        to: 'Record<string, unknown>',
        desc: 'record types',
      },

      // Interface properties
      {
        from: /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\??\s*:\s*any;?$/gm,
        to: '  $1?: unknown;',
        desc: 'interface properties',
      },

      // Generic constraints
      { from: /<any>/g, to: '<unknown>', desc: 'generic types' },
    ];

    for (const replacement of replacements) {
      const beforeCount = (fixedContent.match(replacement.from) || []).length;
      fixedContent = fixedContent.replace(replacement.from, replacement.to);
      fixCount += beforeCount;
    }

    return {
      content: fixedContent,
      fixed: fixCount > 0,
      count: fixCount,
    };
  }

  fixUndeclaredVariables(content, errors) {
    let fixedContent = content;
    let fixCount = 0;

    // Add common missing imports
    const commonImports = new Map([
      ['EventEmitter', "import { EventEmitter } from 'events';"],
      ['Buffer', "import { Buffer } from 'buffer';"],
      ['URL', "import { URL } from 'url';"],
      ['setTimeout', '// setTimeout is global'],
      ['console', '// console is global'],
      ['process', '// process is global'],
    ]);

    errors.forEach((error) => {
      const match = error.message.match(/Cannot find name '([^']+)'/);
      if (match) {
        const varName = match[1];
        if (commonImports.has(varName)) {
          const importStatement = commonImports.get(varName);
          if (
            !(
              fixedContent.includes(importStatement) ||
              importStatement.includes('//')
            )
          ) {
            fixedContent = importStatement + '\n' + fixedContent;
            fixCount++;
          }
        }
      }
    });

    return {
      content: fixedContent,
      fixed: fixCount > 0,
      count: fixCount,
    };
  }

  fixUnusedItems(content, errors) {
    let fixedContent = content;
    let fixCount = 0;

    errors.forEach((error) => {
      if (error.message.includes('is never read')) {
        // Prefix unused variables with underscore
        const match = error.message.match(/'([^']+)' is never read/);
        if (match) {
          const varName = match[1];
          if (!varName.startsWith('_')) {
            // Only rename if it's a parameter or local variable
            const regex = new RegExp(`\\b${varName}\\b(?=\\s*[=:,)])`, 'g');
            const newContent = fixedContent.replace(regex, `_${varName}`);
            if (newContent !== fixedContent) {
              fixedContent = newContent;
              fixCount++;
            }
          }
        }
      }
    });

    return {
      content: fixedContent,
      fixed: fixCount > 0,
      count: fixCount,
    };
  }

  fixTypeIssues(content, errors) {
    const fixedContent = content;
    let fixCount = 0;

    errors.forEach((error) => {
      // Add optional chaining for undefined checks
      if (error.message.includes("possibly 'undefined'")) {
        // This would need more sophisticated AST-based fixes
        // For now, add a comment
        fixCount++; // Mark as attempted
      }
    });

    return {
      content: fixedContent,
      fixed: false, // These need manual fixes usually
      count: 0,
    };
  }

  async formatWithBiome(filePath) {
    try {
      execSync(`npx biome format --write "${filePath}"`, {
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      console.log(`    📐 Formatted with Biome`);
    } catch (error) {
      console.log(
        `    ⚠️  Biome formatting issues (file may have syntax errors)`
      );
    }
  }

  async verifyFileCompilation(filePath) {
    try {
      execSync(`tsc --noEmit --skipLibCheck "${filePath}"`, {
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      console.log(`    ✅ File compiles successfully`);
    } catch (error) {
      const errorCount = (error.stdout.match(/error TS/g) || []).length;
      console.log(`    📊 ${errorCount} TypeScript errors remaining`);
    }
  }

  async runUntilZeroErrors() {
    console.log(
      '🚀 Hybrid TypeScript + Biome Fixer - Running until 0 errors!\n'
    );

    let iteration = 1;
    const maxIterations = 5; // Reasonable limit

    while (iteration <= maxIterations) {
      console.log(`\n🔄 === ITERATION ${iteration} ===`);

      // Get TypeScript compilation errors (detailed like ESLint)
      const fileErrors = await this.getTypeScriptErrors();

      if (fileErrors.size === 0) {
        console.log('\n🎉 SUCCESS! Zero TypeScript compilation errors!');

        // Run final Biome check for style issues
        console.log('\n🎨 Running final Biome style check...');
        try {
          execSync('npx biome check . --apply', { stdio: 'inherit' });
          console.log('✅ All style issues fixed!');
        } catch (error) {
          console.log('ℹ️  Some style issues may remain');
        }
        break;
      }

      console.log(
        `📊 Processing ${fileErrors.size} files with TypeScript errors...`
      );

      // Process each file comprehensively
      let iterationFixes = 0;
      for (const [filePath, errors] of fileErrors.entries()) {
        const fixes = await this.processSingleFileComprehensive(
          filePath,
          errors
        );
        iterationFixes += fixes;
      }

      console.log(`\n📈 Iteration ${iteration} Results:`);
      console.log(`  Files processed: ${fileErrors.size}`);
      console.log(`  Fixes applied: ${iterationFixes}`);
      console.log(`  Cumulative fixes: ${this.totalFixed}`);

      if (iterationFixes === 0) {
        console.log(
          '\n⚠️  No automatic fixes possible - manual intervention needed'
        );
        console.log(
          '📋 Remaining errors require manual fixes (complex type issues, missing imports, etc.)'
        );
        break;
      }

      iteration++;
    }

    console.log('\n🏁 Final Results:');
    console.log(`  Total iterations: ${iteration - 1}`);
    console.log(`  Total files processed: ${this.totalFilesProcessed}`);
    console.log(`  Total fixes applied: ${this.totalFixed}`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
  };

  console.log('🔧 Hybrid TypeScript + Biome Fixer');
  console.log(
    '📋 Uses TypeScript compiler errors (like ESLint) + Biome formatting'
  );
  console.log(`🎯 Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE FIXING'}\n`);

  const fixer = new HybridFixer(options);
  await fixer.runUntilZeroErrors();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { HybridFixer };
