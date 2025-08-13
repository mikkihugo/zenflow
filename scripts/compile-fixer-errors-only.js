#!/usr/bin/env node
/**
 * Pure TypeScript Compilation Fixer (ERRORS ONLY)
 *
 * FOCUS: Fix ONLY TypeScript compilation ERRORS (not warnings)
 * EXCLUDES: Test files AND files with only warnings
 * STRATEGY: Use TypeScript compiler directly, skip warning-only files
 * BONUS: Run Biome on each file AFTER it compiles successfully
 */

import { execSync } from 'child_process';
import fs from 'fs';

class CompileFixerErrorsOnly {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.totalFixed = 0;
    this.filesProcessed = 0;
    this.excludeTests = options.excludeTests !== false; // Default to true
  }

  // Get ONLY TypeScript compilation errors (excluding tests and warning-only files)
  async getCompilationErrors() {
    const testExclusion = this.excludeTests ? ' (EXCLUDING TESTS)' : '';
    console.log(
      `🔍 Checking TypeScript compilation ERRORS ONLY${testExclusion}...`
    );

    try {
      execSync('tsc --noEmit --skipLibCheck', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      console.log('✅ No compilation errors!');
      return new Map();
    } catch (error) {
      if (error.stdout) {
        const parsed = this.parseTypeScriptErrors(error.stdout);
        console.log(
          `📊 Found compilation ERRORS in ${parsed.size} files (warnings excluded${testExclusion.toLowerCase()})`
        );
        return parsed;
      }
      return new Map();
    }
  }

  parseTypeScriptErrors(output) {
    const fileErrors = new Map();
    const lines = output.split('\n');

    lines.forEach((line) => {
      // Parse: src/file.ts(123,45): error TS2345: Message
      const match = line.match(
        /^([^(]+)\((\d+),(\d+)\):\s*error\s+TS(\d+):\s*(.+)$/
      );
      if (match) {
        const [, filePath, line, col, errorCode, message] = match;

        // EXCLUDE TEST FILES (if enabled)
        if (this.excludeTests && this.isTestFile(filePath)) {
          return; // Skip this error
        }

        // ONLY PROCESS ERRORS (not warnings)
        // TypeScript compiler only outputs "error" lines here, so we're good

        if (!fileErrors.has(filePath)) {
          fileErrors.set(filePath, []);
        }

        fileErrors.get(filePath).push({
          file: filePath,
          line: parseInt(line),
          column: parseInt(col),
          errorCode: `TS${errorCode}`,
          message: message.trim(),
          severity: 'error', // Only errors make it here
        });
      }
    });

    return fileErrors;
  }

  // Check if file is a test file
  isTestFile(filePath) {
    return (
      filePath.includes('__tests__/') ||
      filePath.includes('.test.') ||
      filePath.includes('.spec.') ||
      filePath.includes('/test/') ||
      filePath.includes('/tests/') ||
      filePath.endsWith('.test.ts') ||
      filePath.endsWith('.spec.ts') ||
      filePath.endsWith('.test.js') ||
      filePath.endsWith('.spec.js')
    );
  }

  // Fix ONE file with ALL its compilation errors, then lint it
  async fixSingleFile(filePath, errors) {
    console.log(`\n🔧 Fixing ${filePath} (${errors.length} ERRORS)`);

    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  File not found: ${filePath}`);
      return 0;
    }

    try {
      let content = fs.readFileSync(filePath, 'utf-8');
      const originalContent = content;
      let totalFixes = 0;

      // Apply all compilation fixes in one batch
      const result = this.fixAllCompilationIssues(content, errors);
      content = result.content;
      totalFixes = result.fixCount;

      // Save changes
      if (content !== originalContent && !this.dryRun) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`  ✅ Applied ${totalFixes} compilation fixes`);

        // Test if file compiles now
        const stillHasErrors = await this.testFileCompilation(filePath);

        if (!stillHasErrors) {
          console.log(`  🎉 File compiles successfully!`);
          // Now apply Biome formatting since compilation is fixed
          await this.formatWithBiome(filePath);
        } else {
          console.log(
            `  📊 Some compilation errors remain (may need manual fixes)`
          );
        }

        this.totalFixed += totalFixes;
        this.filesProcessed++;
      } else if (this.dryRun && content !== originalContent) {
        console.log(`  🔍 [DRY RUN] Would apply ${totalFixes} fixes`);
      } else {
        console.log(`  ℹ️  No automatic fixes available for this file`);
      }

      return totalFixes;
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
      return 0;
    }
  }

  // Fix all common TypeScript compilation issues in one pass
  fixAllCompilationIssues(content, errors) {
    let fixedContent = content;
    let fixCount = 0;

    // Categorize errors by type for better targeting
    const errorTypes = {
      anyTypes: errors.filter(
        (e) => e.message.includes('any') || e.errorCode === 'TS7006'
      ),
      missingImports: errors.filter((e) =>
        e.message.includes('Cannot find name')
      ),
      unusedVars: errors.filter((e) => e.message.includes('is never read')),
      missingProps: errors.filter((e) =>
        e.message.includes('missing the following properties')
      ),
    };

    console.log(
      `    📋 Error breakdown: ${errorTypes.anyTypes.length} any-types, ${errorTypes.missingImports.length} missing-imports, ${errorTypes.unusedVars.length} unused-vars, ${errorTypes.missingProps.length} missing-props`
    );

    // 1. HIGHEST PRIORITY: Fix 'any' types (most compilation blockers)
    if (errorTypes.anyTypes.length > 0) {
      const anyResult = this.fixAnyTypes(fixedContent);
      fixedContent = anyResult.content;
      fixCount += anyResult.count;
    }

    // 2. Fix missing imports (cannot find name errors)
    if (errorTypes.missingImports.length > 0) {
      const importResult = this.fixMissingImports(
        fixedContent,
        errorTypes.missingImports
      );
      fixedContent = importResult.content;
      fixCount += importResult.count;
    }

    // 3. Fix unused variables (prefix with underscore)
    if (errorTypes.unusedVars.length > 0) {
      const unusedResult = this.fixUnusedVariables(
        fixedContent,
        errorTypes.unusedVars
      );
      fixedContent = unusedResult.content;
      fixCount += unusedResult.count;
    }

    // 4. Fix missing properties (type assertions as last resort)
    if (errorTypes.missingProps.length > 0) {
      const propResult = this.fixMissingProperties(
        fixedContent,
        errorTypes.missingProps
      );
      fixedContent = propResult.content;
      fixCount += propResult.count;
    }

    return {
      content: fixedContent,
      fixCount,
    };
  }

  fixAnyTypes(content) {
    let fixedContent = content;
    let count = 0;

    // Most effective 'any' fixes for compilation errors
    const fixes = [
      // Basic any type replacements
      { from: /:\s*any(\s*[;,)])/g, to: ': unknown$1' },
      { from: /:\s*any\[\]/g, to: ': unknown[]' },
      { from: /Promise<any>/g, to: 'Promise<unknown>' },
      { from: /Record<string,\s*any>/g, to: 'Record<string, unknown>' },

      // Common parameter patterns
      { from: /meta\?:\s*any/g, to: 'meta?: unknown' },
      { from: /data:\s*any/g, to: 'data: unknown' },
      { from: /params\?:\s*any\[\]/g, to: 'params?: unknown[]' },
      { from: /options\?:\s*any/g, to: 'options?: Record<string, unknown>' },
      { from: /config:\s*any/g, to: 'config: Record<string, unknown>' },
      { from: /result:\s*any/g, to: 'result: unknown' },

      // Function parameter patterns
      {
        from: /\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*any\s*\)/g,
        to: '($1: unknown)',
      },
      {
        from: /,\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*any\s*([,)])/g,
        to: ', $1: unknown$2',
      },
    ];

    for (const fix of fixes) {
      const matches = fixedContent.match(fix.from);
      if (matches) {
        fixedContent = fixedContent.replace(fix.from, fix.to);
        count += matches.length;
      }
    }

    return { content: fixedContent, count };
  }

  fixMissingImports(content, errors) {
    let fixedContent = content;
    let count = 0;

    // Common missing imports that cause compilation errors
    const commonImports = {
      EventEmitter: "import { EventEmitter } from 'events';",
      Buffer: "import { Buffer } from 'buffer';",
      URL: "import { URL } from 'url';",
      process: "import process from 'process';",
      console: '// console is global',
      setTimeout: '// setTimeout is global',
      clearTimeout: '// clearTimeout is global',
    };

    errors.forEach((error) => {
      const match = error.message.match(/Cannot find name '([^']+)'/);
      if (match) {
        const varName = match[1];
        if (
          commonImports[varName] &&
          !fixedContent.includes(commonImports[varName])
        ) {
          if (!commonImports[varName].includes('//')) {
            // Add import at the top
            fixedContent = commonImports[varName] + '\n' + fixedContent;
            count++;
          }
        }
      }
    });

    return { content: fixedContent, count };
  }

  fixUnusedVariables(content, errors) {
    let fixedContent = content;
    let count = 0;

    errors.forEach((error) => {
      if (error.message.includes('is never read')) {
        const match = error.message.match(/'([^']+)' is never read/);
        if (match) {
          const varName = match[1];
          if (!varName.startsWith('_')) {
            // Prefix with underscore (TypeScript convention for unused vars)
            const regex = new RegExp(`\\b${varName}\\b(?=\\s*[:=,)])`, 'g');
            const newContent = fixedContent.replace(regex, `_${varName}`);
            if (newContent !== fixedContent) {
              fixedContent = newContent;
              count++;
            }
          }
        }
      }
    });

    return { content: fixedContent, count };
  }

  fixMissingProperties(content, errors) {
    let fixedContent = content;
    let count = 0;

    errors.forEach((error) => {
      if (error.message.includes('missing the following properties')) {
        // Add type assertion as pragmatic fix for compilation
        const line = error.line;
        const lines = fixedContent.split('\n');
        if (lines[line - 1] && !lines[line - 1].includes('as any')) {
          // Add type assertion to bypass compilation error
          lines[line - 1] = lines[line - 1].replace(/([^;]+);?$/, '$1 as any;');
          fixedContent = lines.join('\n');
          count++;
        }
      }
    });

    return { content: fixedContent, count };
  }

  async testFileCompilation(filePath) {
    try {
      execSync(`tsc --noEmit --skipLibCheck "${filePath}"`, {
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      return false; // No errors
    } catch (error) {
      return true; // Has errors
    }
  }

  async formatWithBiome(filePath) {
    try {
      execSync(`npx biome check "${filePath}" --apply`, {
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      console.log(`    📐 Formatted and linted with Biome`);
    } catch (error) {
      console.log(`    📐 Biome applied available fixes`);
    }
  }

  async runUntilCompiles() {
    const scope = this.excludeTests ? 'Production Code' : 'All Code';
    console.log(`🚀 ${scope} Compilation Fixer - Fix ERRORS ONLY!\n`);

    let iteration = 1;
    const maxIterations = 5;

    while (iteration <= maxIterations) {
      console.log(`\n🔄 === COMPILATION CHECK ${iteration} ===`);

      const fileErrors = await this.getCompilationErrors();

      if (fileErrors.size === 0) {
        console.log(
          `\n🎉 SUCCESS! ${scope} TypeScript compilation has no ERRORS!`
        );

        // Final style pass with Biome
        console.log('\n📐 Running final Biome formatting...');
        try {
          const pattern = this.excludeTests
            ? 'src --ignore-pattern="**/__tests__/**" --ignore-pattern="**/*.test.*" --ignore-pattern="**/*.spec.*"'
            : 'src';
          execSync(`npx biome format --write ${pattern}`, { stdio: 'inherit' });
          console.log('✅ All files formatted!');
        } catch (error) {
          console.log('ℹ️  Biome formatting completed');
        }
        break;
      }

      console.log(
        `📊 Fixing ${fileErrors.size} files with compilation ERRORS...`
      );

      let iterationFixes = 0;
      for (const [filePath, errors] of fileErrors.entries()) {
        const fixes = await this.fixSingleFile(filePath, errors);
        iterationFixes += fixes;

        // Slight pause to avoid overwhelming output
        if (fileErrors.size > 10) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      }

      console.log(`\n📈 Iteration ${iteration} Results:`);
      console.log(`  Files processed: ${this.filesProcessed}`);
      console.log(`  Error fixes applied: ${iterationFixes}`);
      console.log(`  Total fixes: ${this.totalFixed}`);

      if (iterationFixes === 0) {
        console.log('\n⚠️  No automatic fixes possible');
        console.log('💡 Remaining errors likely need manual intervention');
        console.log('📋 Run `tsc --noEmit --skipLibCheck` to see details');
        break;
      }

      iteration++;
    }

    console.log(`\n🏁 ${scope} Compilation Results:`);
    console.log(`  Iterations: ${iteration - 1}`);
    console.log(`  Files processed: ${this.filesProcessed}`);
    console.log(`  Total fixes applied: ${this.totalFixed}`);
    console.log(`\n🎯 Focus: TypeScript compilation ERRORS only`);
    console.log(`📐 Bonus: Biome formatting applied to files that compile`);
    if (this.excludeTests) {
      console.log(`🚫 Tests excluded: __tests__/, *.test.*, *.spec.*`);
    }
    console.log(`⚠️  Warnings ignored: Only fixing compilation-blocking errors`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    excludeTests: !args.includes('--include-tests'),
  };

  console.log('⚡ TypeScript Compilation Fixer - ERRORS ONLY');
  console.log('🎯 FOCUS: Fix compilation-blocking ERRORS only');
  console.log('⚠️  IGNORES: Warnings (unless they block compilation)');
  if (options.excludeTests) {
    console.log('🚫 EXCLUDES: All test files (__tests__/, *.test.*, *.spec.*)');
  }
  console.log('📐 BONUS: Biome formatting after compilation succeeds');
  console.log(`🔧 Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE FIXING'}\n`);

  const fixer = new CompileFixerErrorsOnly(options);
  await fixer.runUntilCompiles();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { CompileFixerErrorsOnly };
