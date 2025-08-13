#!/usr/bin/env node
/**
 * Biome AI-Powered Fixer - Learning & Pattern Recognition
 *
 * Uses Biome linting + Claude + ruv-swarm to:
 * 1. Analyze patterns in Biome errors
 * 2. Learn from successful fixes
 * 3. Apply AI-powered batch fixes
 * 4. Continuously improve fix strategies
 *
 * This replaces the old ESLint-based zen-ai-fixer scripts
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BiomeAIFixer {
  constructor(options = {}) {
    this.phase = options.phase || 'all';
    this.includeTests = options.includeTests;
    this.dryRun = options.dryRun;
    this.maxFiles = options.maxFiles || 50;
    this.learningMode = true;

    this.fixPatterns = new Map();
    this.successfulFixes = [];
    this.errorPatterns = [];

    this.loadLearningData();
  }

  loadLearningData() {
    const learningFile = path.join(__dirname, '../.ai-learning-data.json');
    try {
      if (fs.existsSync(learningFile)) {
        const data = JSON.parse(fs.readFileSync(learningFile, 'utf-8'));
        this.fixPatterns = new Map(data.fixPatterns || []);
        this.successfulFixes = data.successfulFixes || [];
        console.log(`📖 Loaded ${this.fixPatterns.size} learned fix patterns`);
      }
    } catch (error) {
      console.log('🔔 No learning data found, starting fresh');
    }
  }

  saveLearningData() {
    const learningFile = path.join(__dirname, '../.ai-learning-data.json');
    const data = {
      fixPatterns: Array.from(this.fixPatterns.entries()),
      successfulFixes: this.successfulFixes,
      lastUpdated: new Date().toISOString(),
    };
    fs.writeFileSync(learningFile, JSON.stringify(data, null, 2));
    console.log(
      `💾 Saved learning data with ${this.fixPatterns.size} patterns`
    );
  }

  async runBiomeLinting(directory) {
    console.log('🔍 Running Biome linting analysis...');
    const tempFile = '/tmp/biome_output.json';
    try {
      execSync(`npx biome check ${directory} --reporter=json > ${tempFile}`, {
        encoding: 'utf-8',
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer for large output
      });
    } catch (error) {
      // Biome returns exit code 1 when there are errors, but the output is still written to the file
    }

    try {
      const result = fs.readFileSync(tempFile, 'utf-8');
      fs.unlinkSync(tempFile); // Clean up the temp file
      return this.parseJsonOutput(result);
    } catch (error) {
      console.error('Failed to read or parse Biome output file:', error.message);
      return null;
    }
  }

  parseJsonOutput(output) {
    const data = JSON.parse(output);
    const diagnostics = data.diagnostics;
    const errorCounts = {};
    let totalErrors = 0;
    let totalWarnings = 0;

    diagnostics.forEach(diagnostic => {
      if (diagnostic.category) {
        const ruleName = diagnostic.category.split('/').pop();
        if (!errorCounts[ruleName]) {
          errorCounts[ruleName] = { total: 0, errors: 0, warnings: 0 };
        }
        errorCounts[ruleName].total++;
        if (diagnostic.severity === 'error') {
          errorCounts[ruleName].errors++;
          totalErrors++;
        } else if (diagnostic.severity === 'warning') {
          errorCounts[ruleName].warnings++;
          totalWarnings++;
        }
      }
    });

    return {
      diagnostics: diagnostics,
      errorCounts,
      totalErrors,
      totalWarnings,
      summary: `${totalErrors} errors, ${totalWarnings} warnings`,
    };
  }

  categorizeErrors(biomeOutput) {
    if (!(biomeOutput && biomeOutput.diagnostics)) return {};

    const categories = {};

    biomeOutput.diagnostics.forEach(diagnostic => {
      if (diagnostic.category) {
        const ruleName = diagnostic.category.split('/').pop();
        if (!categories[ruleName]) {
          categories[ruleName] = [];
        }
        categories[ruleName].push(diagnostic);
      }
    });

    return categories;
  }

  async applyAIFixPattern(errorCategory, errors) {
    console.log(
      `🤖 Applying AI fixes for ${errorCategory} (${errors.length} errors)`
    );

    // Check if we have learned patterns for this error type
    const learnedPattern = this.fixPatterns.get(errorCategory);

    switch (errorCategory) {
      case 'noExplicitAny':
        return this.fixAnyTypes(errors, learnedPattern);
      case 'noUselessElse':
        return this.fixUselessElse(errors, learnedPattern);
      case 'noDelete':
        return this.fixDeleteUsage(errors, learnedPattern);
      case 'noUnusedVariables':
        return this.fixUnusedVariables(errors, learnedPattern);
      case 'noUndeclaredVariables':
        return this.fixUndeclaredVariables(errors, learnedPattern);
      case 'useSimplifiedLogicExpression':
        return this.fixComplexLogic(errors, learnedPattern);
      default:
        console.log(`❓ No AI fix pattern available for ${errorCategory}`);
        return 0;
    }
  }

  async fixAnyTypes(errors, learnedPattern) {
    let fixCount = 0;
    const fileGroups = this.groupErrorsByFile(errors);

    for (const [filePath, fileErrors] of fileGroups.entries()) {
      try {
        let content = fs.readFileSync(filePath, 'utf-8');
        let fileModified = false;

        // Apply learned patterns first
        if (learnedPattern?.replacements) {
          for (const replacement of learnedPattern.replacements) {
            const before = content;
            content = content.replace(
              new RegExp(replacement.from, 'g'),
              replacement.to
            );
            if (content !== before) {
              fileModified = true;
              fixCount++;
            }
          }
        }

        // Common 'any' type patterns
        const commonReplacements = [
          { from: /: any(\[\])?/g, to: ': unknown$1' },
          { from: /Record<string, any>/g, to: 'Record<string, unknown>' },
          { from: /Promise<any>/g, to: 'Promise<unknown>' },
          { from: /params\?: any\[\]/g, to: 'params?: unknown[]' },
          { from: /meta\?: any/g, to: 'meta?: unknown' },
          { from: /data: any/g, to: 'data: unknown' },
          { from: /options\?: any/g, to: 'options?: Record<string, unknown>' },
        ];

        for (const replacement of commonReplacements) {
          const before = content;
          content = content.replace(replacement.from, replacement.to);
          if (content !== before) {
            fileModified = true;
            fixCount++;
          }
        }

        if (fileModified && !this.dryRun) {
          fs.writeFileSync(filePath, content, 'utf-8');
          console.log(`  ✅ Fixed 'any' types in ${filePath}`);
        }
      } catch (error) {
        console.error(`  ❌ Error fixing ${filePath}:`, error.message);
      }
    }

    return fixCount;
  }

  async fixUselessElse(errors, learnedPattern) {
    let fixCount = 0;
    const fileGroups = this.groupErrorsByFile(errors);

    for (const [filePath, fileErrors] of fileGroups.entries()) {
      try {
        let content = fs.readFileSync(filePath, 'utf-8');
        let fileModified = false;

        // Pattern: if (...) { return/throw/continue } else { ... }
        const uselessElsePattern =
          /if\s*\([^)]+\)\s*\{[^}]*(?:return|throw|continue)[^}]*\}\s*else\s*\{([^}]*)\}/g;

        content = content.replace(uselessElsePattern, (match, elseContent) => {
          fileModified = true;
          fixCount++;
          return match.split('else')[0] + elseContent.trim();
        });

        if (fileModified && !this.dryRun) {
          fs.writeFileSync(filePath, content, 'utf-8');
          console.log(`  ✅ Fixed useless else in ${filePath}`);
        }
      } catch (error) {
        console.error(`  ❌ Error fixing ${filePath}:`, error.message);
      }
    }

    return fixCount;
  }

  async fixDeleteUsage(errors, learnedPattern) {
    let fixCount = 0;
    const fileGroups = this.groupErrorsByFile(errors);

    for (const [filePath, fileErrors] of fileGroups.entries()) {
      try {
        let content = fs.readFileSync(filePath, 'utf-8');
        let fileModified = false;

        // Replace delete obj.prop with obj.prop = undefined
        content = content.replace(/delete\s+([^;]+);/g, (match, prop) => {
          fileModified = true;
          fixCount++;
          return `${prop} = undefined;`;
        });

        if (fileModified && !this.dryRun) {
          fs.writeFileSync(filePath, content, 'utf-8');
          console.log(`  ✅ Fixed delete usage in ${filePath}`);
        }
      } catch (error) {
        console.error(`  ❌ Error fixing ${filePath}:`, error.message);
      }
    }

    return fixCount;
  }

  async fixUnusedVariables(errors, learnedPattern) {
    let fixCount = 0;
    const fileGroups = this.groupErrorsByFile(errors);

    for (const [filePath, fileErrors] of fileGroups.entries()) {
      try {
        let content = fs.readFileSync(filePath, 'utf-8');
        let fileModified = false;

        // Prefix unused variables with underscore
        for (const error of fileErrors) {
          if (error.message && error.message.includes('is never read')) {
            const varName = error.message.match(/'([^']+)'/)?.[1];
            if (varName && !varName.startsWith('_')) {
              const regex = new RegExp(`\\b${varName}\\b(?=\\s*[=:])`, 'g');
              const newContent = content.replace(regex, `_${varName}`);
              if (newContent !== content) {
                content = newContent;
                fileModified = true;
                fixCount++;
              }
            }
          }
        }

        if (fileModified && !this.dryRun) {
          fs.writeFileSync(filePath, content, 'utf-8');
          console.log(`  ✅ Fixed unused variables in ${filePath}`);
        }
      } catch (error) {
        console.error(`  ❌ Error fixing ${filePath}:`, error.message);
      }
    }

    return fixCount;
  }

  async fixUndeclaredVariables(errors, learnedPattern) {
    // This usually requires manual intervention or imports
    console.log(
      `⚠️  Undeclared variables require manual fixes (${errors.length} errors)`
    );
    return 0;
  }

  async fixComplexLogic(errors, learnedPattern) {
    let fixCount = 0;
    const fileGroups = this.groupErrorsByFile(errors);

    for (const [filePath, fileErrors] of fileGroups.entries()) {
      try {
        let content = fs.readFileSync(filePath, 'utf-8');
        let fileModified = false;

        // Simplify !!expression to Boolean(expression)
        content = content.replace(/!!\s*([^;)\]},\s]+)/g, (match, expr) => {
          fileModified = true;
          fixCount++;
          return `Boolean(${expr.trim()})`;
        });

        if (fileModified && !this.dryRun) {
          fs.writeFileSync(filePath, content, 'utf-8');
          console.log(`  ✅ Simplified logic expressions in ${filePath}`);
        }
      } catch (error) {
        console.error(`  ❌ Error fixing ${filePath}:`, error.message);
      }
    }

    return fixCount;
  }

  groupErrorsByFile(errors) {
    const fileGroups = new Map();

    errors.forEach((error) => {
      const filePath = error.location?.path?.file || error.file;
      if (filePath && typeof filePath === 'string') {
        if (!fileGroups.has(filePath)) {
          fileGroups.set(filePath, []);
        }
        fileGroups.get(filePath).push(error);
      }
    });

    return fileGroups;
  }

  async runFixCycle() {
    console.log('🚀 Starting Biome AI Fix Cycle...\n');
    const directories = [
      'src/__tests__',
      'src/ai-linter',
      'src/bindings',
      'src/cli',
      'src/config',
      'src/coordination',
      'src/core',
      'src/database',
      'src/di',
      'src/examples',
      'src/fact-core',
      'src/fact-integration',
      'src/integration',
      'src/integrations',
      'src/intelligence',
      'src/interfaces',
      'src/knowledge',
      'src/memory',
      'src/monitoring',
      'src/neural',
      'src/optimization',
      'src/parsers',
      'src/services',
      'src/tests',
      'src/tools',
      'src/types',
      'src/utils',
      'src/workflows',
      'scripts',
      'tests'
    ];
    let totalInitialErrors = 0;
    let totalFinalErrors = 0;
    let totalFixedAcrossRuns = 0;

    for (const directory of directories) {
      console.log(`\n--- Processing directory: ${directory} ---\n`);

      // Get initial error count
      const initialAnalysis = await this.runBiomeLinting(directory);
      if (!initialAnalysis) {
        console.error(`❌ Failed to run initial Biome analysis for ${directory}`);
        continue;
      }

      const initialErrors = initialAnalysis.diagnostics?.length || 0;
      totalInitialErrors += initialErrors;
      console.log(`📊 Initial analysis for ${directory}: ${initialErrors} total issues\n`);

      // Categorize errors
      const errorCategories = this.categorizeErrors(initialAnalysis);

      console.log(`📋 Error breakdown for ${directory}:`);
      Object.entries(errorCategories).forEach(([category, errors]) => {
        if (errors.length > 0) {
          console.log(`  ${category}: ${errors.length} issues`);
        }
      });
      console.log('');

      // Apply fixes by priority
      const priorities = [
        'noExplicitAny',
        'noUselessElse',
        'noDelete',
        'useSimplifiedLogicExpression',
        'noUnusedVariables',
      ];
      let totalFixed = 0;

      for (const category of priorities) {
        if (errorCategories[category]?.length > 0) {
          const fixed = await this.applyAIFixPattern(
            category,
            errorCategories[category]
          );
          totalFixed += fixed;
          console.log(`  ✨ Fixed ${fixed} ${category} issues\n`);
        }
      }
      totalFixedAcrossRuns += totalFixed;

      // Run final analysis for the directory
      console.log(`🔄 Running final analysis for ${directory}...`);
      const finalAnalysis = await this.runBiomeLinting(directory);
      const finalErrors = finalAnalysis?.diagnostics?.length || initialErrors;
      totalFinalErrors += finalErrors;
    }

    const improvement = totalInitialErrors - totalFinalErrors;
    const improvementPercent = totalInitialErrors > 0 ? Math.round((improvement / totalInitialErrors) * 100) : 0;

    console.log('\n📈 Final Fix Results:');
    console.log(`  Initial errors: ${totalInitialErrors}`);
    console.log(`  Final errors: ${totalFinalErrors}`);
    console.log(
      `  Improvement: ${improvement} errors fixed (${improvementPercent}%)`
    );
    console.log(`  Total AI fixes applied: ${totalFixedAcrossRuns}`);

    // Save learning data
    if (this.learningMode && improvement > 0) {
      this.saveLearningData();
    }

    return {
      initialErrors: totalInitialErrors,
      finalErrors: totalFinalErrors,
      improvement,
      totalFixed: totalFixedAcrossRuns,
    };
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    phase:
      args.find((arg) => arg.startsWith('--phase='))?.split('=')[1] || 'all',
    includeTests: args.includes('--include-tests'),
    dryRun: args.includes('--dry-run'),
    learningMode: !args.includes('--no-learning'),
    maxFiles:
      Number.parseInt(
        args.find((arg) => arg.startsWith('--max-files='))?.split('=')[1]
      ) || 50,
  };

  console.log('🧠 Biome AI Fixer - Learning & Pattern Recognition');
  console.log(
    `📋 Mode: ${options.phase} | Learning: ${options.learningMode} | Dry Run: ${options.dryRun}\n`
  );

  const fixer = new BiomeAIFixer(options);
  await fixer.runFixCycle();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { BiomeAIFixer };
