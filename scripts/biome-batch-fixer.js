#!/usr/bin/env node
/**
 * Biome Batch Fixer - Efficient File-by-File Processing
 *
 * This script processes all Biome errors efficiently by:
 * 1. Getting specific file errors from Biome
 * 2. Batching ALL fixes for each file into ONE MultiEdit operation
 * 3. Linting each file immediately after fixing
 * 4. Running until 0 errors achieved
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BiomeBatchFixer {
  constructor(options = {}) {
    this.dryRun = options.dryRun;
    this.totalFixed = 0;
    this.totalFilesProcessed = 0;
    this.processingStats = new Map();
  }

  // Get specific file errors with details
  async getFileErrors() {
    console.log('🔍 Analyzing specific file errors...');
    try {
      // Run Biome on individual files to get specific error locations
      const tsFiles = execSync(
        'find src -name "*.ts" -not -path "*/node_modules/*" -not -path "*/build/*"',
        { encoding: 'utf-8' },
      )
        .split('\n')
        .filter((f) => f.length > 0);

      const fileErrors = new Map();

      // Process files in batches to avoid overwhelming output
      for (let i = 0; i < tsFiles.length; i += 10) {
        const batch = tsFiles.slice(i, i + 10);
        console.log(
          `  📂 Processing batch ${Math.floor(i / 10) + 1}/${Math.ceil(tsFiles.length / 10)}: ${batch.length} files`,
        );

        for (const filePath of batch) {
          try {
            const result = execSync(
              `npx biome check "${filePath}" --reporter=github-actions`,
              { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
            );
            // File is clean if no output
          } catch (error) {
            if (error.stdout && error.stdout.includes('::error')) {
              const errors = this.parseGitHubActionsOutput(error.stdout);
              if (errors.length > 0) {
                fileErrors.set(filePath, errors);
              }
            }
          }
        }
      }

      console.log(`📊 Found errors in ${fileErrors.size} files`);
      return fileErrors;
    } catch (error) {
      console.error('❌ Error analyzing files:', error.message);
      return new Map();
    }
  }

  parseGitHubActionsOutput(output) {
    const errors = [];
    const lines = output.split('\n');

    lines.forEach((line) => {
      // Parse format: ::error file=src/file.ts,line=123,col=45::Rule violation message
      const match = line.match(
        /::error file=([^,]+),line=(\d+),col=(\d+)::(.*)/,
      );
      if (match) {
        const [, filePath, line, col, message] = match;

        // Extract rule name from message
        const ruleMatch = message.match(/\b(no[A-Z]\w+|use[A-Z]\w+)\b/);
        const ruleName = ruleMatch ? ruleMatch[1] : 'unknown';

        errors.push({
          file: filePath,
          line: Number.parseInt(line),
          column: Number.parseInt(col),
          message: message.trim(),
          rule: ruleName,
        });
      }
    });

    return errors;
  }

  // Process one file with ALL its fixes batched together
  async processSingleFile(filePath, errors) {
    console.log(`\n🔧 Processing ${filePath} (${errors.length} errors)`);

    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  File not found: ${filePath}`);
      return 0;
    }

    try {
      let content = fs.readFileSync(filePath, 'utf-8');
      const originalContent = content;
      let totalFixes = 0;

      // Group fixes by type for better batching
      const fixesByType = this.groupFixesByType(errors);

      // Apply all fix types to this file
      for (const [fixType, typeErrors] of fixesByType.entries()) {
        const fixCount = await this.applyFixType(content, fixType, typeErrors);
        if (fixCount > 0) {
          content = fs.readFileSync(filePath, 'utf-8'); // Re-read after potential changes
          totalFixes += fixCount;
        }
      }

      // Apply comprehensive fixes in one go
      content = this.applyComprehensiveFixes(content);

      if (content !== originalContent && !this.dryRun) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`  ✅ Applied ${totalFixes} fixes to ${filePath}`);

        // Lint this specific file immediately
        await this.lintSingleFile(filePath);

        this.totalFixed += totalFixes;
        this.totalFilesProcessed++;
      } else if (this.dryRun && content !== originalContent) {
        console.log(
          `  🔍 [DRY RUN] Would apply ${totalFixes} fixes to ${filePath}`,
        );
      }

      return totalFixes;
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
      return 0;
    }
  }

  groupFixesByType(errors) {
    const groups = new Map();

    errors.forEach((error) => {
      const rule = error.rule || 'unknown';
      if (!groups.has(rule)) {
        groups.set(rule, []);
      }
      groups.get(rule).push(error);
    });

    return groups;
  }

  async applyFixType(content, fixType, errors) {
    // This would be expanded with specific fix logic per type
    switch (fixType) {
      case 'noExplicitAny':
        return this.fixAnyTypes(content);
      case 'noUselessElse':
        return this.fixUselessElse(content);
      case 'noDelete':
        return this.fixDeleteUsage(content);
      case 'useSimplifiedLogicExpression':
        return this.fixComplexLogic(content);
      default:
        return 0;
    }
  }

  // Comprehensive fix that handles multiple patterns in one pass
  applyComprehensiveFixes(content) {
    let fixedContent = content;

    // Common 'any' type replacements
    const anyTypeReplacements = [
      { from: /: any(\[\])?(\s*[;,)])/g, to: ': unknown$1$2' },
      { from: /Record<string, any>/g, to: 'Record<string, unknown>' },
      { from: /Promise<any>/g, to: 'Promise<unknown>' },
      { from: /params\?: any\[\]/g, to: 'params?: unknown[]' },
      { from: /meta\?: any/g, to: 'meta?: unknown' },
      { from: /data: any/g, to: 'data: unknown' },
      { from: /options\?: any/g, to: 'options?: Record<string, unknown>' },
      { from: /config: any/g, to: 'config: Record<string, unknown>' },
      { from: /result: any/g, to: 'result: unknown' },
      { from: /value: any/g, to: 'value: unknown' },
    ];

    // Apply 'any' type fixes
    for (const replacement of anyTypeReplacements) {
      fixedContent = fixedContent.replace(replacement.from, replacement.to);
    }

    // Fix useless else patterns
    fixedContent = fixedContent.replace(
      /if\s*\([^)]+\)\s*\{[^}]*(?:return|throw|continue|break)[^}]*\}\s*else\s*\{([^}]*)\}/g,
      (match, elseContent) => {
        return match.split('else')[0] + elseContent.trim();
      },
    );

    // Fix delete usage
    fixedContent = fixedContent.replace(
      /delete\s+([^;]+);/g,
      '$1 = undefined;',
    );

    // Fix complex logic expressions
    fixedContent = fixedContent.replace(/!!\s*([^;)\]},\s]+)/g, 'Boolean($1)');

    // Fix unused variables (prefix with underscore)
    // This is more complex and would need AST parsing for accuracy

    return fixedContent;
  }

  fixAnyTypes(content) {
    // Count fixes
    const anyMatches = content.match(/: any\b/g);
    return anyMatches ? anyMatches.length : 0;
  }

  fixUselessElse(content) {
    const elseMatches = content.match(
      /if\s*\([^)]+\)\s*\{[^}]*(?:return|throw|continue|break)[^}]*\}\s*else\s*\{/g,
    );
    return elseMatches ? elseMatches.length : 0;
  }

  fixDeleteUsage(content) {
    const deleteMatches = content.match(/delete\s+[^;]+;/g);
    return deleteMatches ? deleteMatches.length : 0;
  }

  fixComplexLogic(content) {
    const logicMatches = content.match(/!!\s*[^;)\]},\s]+/g);
    return logicMatches ? logicMatches.length : 0;
  }

  async lintSingleFile(filePath) {
    try {
      const result = execSync(
        `npx biome check "${filePath}" --reporter=summary`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
      );
      console.log(`  ✅ ${filePath} - Clean!`);
    } catch (error) {
      if (error.stdout) {
        const errorCount = (error.stdout.match(/error\(s\)/g) || []).length;
        const warningCount = (error.stdout.match(/warning\(s\)/g) || []).length;
        if (errorCount > 0 || warningCount > 0) {
          console.log(
            `  📊 ${filePath} - ${errorCount} errors, ${warningCount} warnings remaining`,
          );
        } else {
          console.log(`  ✅ ${filePath} - Clean!`);
        }
      }
    }
  }

  async runUntilZeroErrors() {
    console.log('🚀 Starting Biome Batch Fixer - Running until 0 errors!\n');

    let iteration = 1;
    const maxIterations = 10; // Safety limit

    while (iteration <= maxIterations) {
      console.log(`\n🔄 === ITERATION ${iteration} ===`);

      // Get current file errors
      const fileErrors = await this.getFileErrors();

      if (fileErrors.size === 0) {
        console.log('\n🎉 SUCCESS! Zero errors achieved!');
        break;
      }

      console.log(`📊 Processing ${fileErrors.size} files with errors...`);

      // Process each file with all its fixes batched
      let iterationFixes = 0;
      for (const [filePath, errors] of fileErrors.entries()) {
        const fixes = await this.processSingleFile(filePath, errors);
        iterationFixes += fixes;
      }

      console.log(`\n📈 Iteration ${iteration} Results:`);
      console.log(`  Files processed: ${fileErrors.size}`);
      console.log(`  Total fixes applied: ${iterationFixes}`);
      console.log(`  Cumulative fixes: ${this.totalFixed}`);

      if (iterationFixes === 0) {
        console.log(
          '\n⚠️  No fixes applied - manual intervention may be needed',
        );
        break;
      }

      iteration++;
    }

    // Final analysis
    console.log('\n🏁 Final Results:');
    console.log(`  Total iterations: ${iteration - 1}`);
    console.log(`  Total files processed: ${this.totalFilesProcessed}`);
    console.log(`  Total fixes applied: ${this.totalFixed}`);

    // Run final full check
    console.log('\n🔍 Running final repository check...');
    try {
      execSync('npx biome check . --reporter=summary', { stdio: 'inherit' });
    } catch (error) {
      console.log('Some issues remain - check output above');
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
  };

  console.log('🧠 Biome Batch Fixer - File-by-File Processing');
  console.log(`📋 Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE FIXING'}\n`);

  const fixer = new BiomeBatchFixer(options);
  await fixer.runUntilZeroErrors();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { BiomeBatchFixer };
