#!/usr/bin/env node

/**
 * Claude Code Zen AI-Assisted ESLint Fixer - Batched Edition
 * ENOBUFS-Free version with intelligent batching
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ClaudeAIIntegration } from './claude-ai-integration.js';
import { ProcessLock } from './process-lock.js';
import { SimpleGraphESLintAnalyzer } from './zen-eslint-graph-simple.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class ZenAIFixerBatched {
  constructor() {
    this.analyzer = new SimpleGraphESLintAnalyzer();
    this.violations = [];
  }

  /**
   * Main execution with ENOBUFS-free batching
   */
  async run(mode = 'production') {
    console.log('🧘 Zen AI ESLint Fixer - Batched Edition');
    console.log('=====================================');

    // Acquire process lock
    const lock = new ProcessLock('zen-ai-fixer');
    try {
      lock.acquire();
    } catch (error) {
      console.error('❌', error.message);
      console.log('⏳ Another ESLint process is running. Please wait...');
      process.exit(1);
    }

    try {
      let violations;

      if (mode === 'quick' || process.argv.includes('--quick')) {
        violations = await this.runQuickAnalysis();
      } else if (mode === 'analyze' || process.argv.includes('--analyze-only')) {
        violations = await this.runAnalyzeOnly();
      } else {
        violations = await this.runFullAnalysis();
      }

      console.log(`\n📊 Analysis Complete: ${violations.length} violations found`);

      // Skip AI fixing if analyze-only mode
      if (mode === 'analyze' || process.argv.includes('--analyze-only')) {
        this.generateAnalysisReport(violations);
        return;
      }

      // Proceed with AI-assisted fixing
      if (violations.length > 0) {
        await this.performAIAssistedFixes(violations);
      } else {
        console.log('🎉 No violations found! Code is clean.');
      }
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Quick analysis - top priority files only (1-2 batches max)
   */
  async runQuickAnalysis() {
    console.log('🔍 Running quick analysis (top 5 priority files only)...');

    // Build dependency graph
    await this.analyzer.buildDependencyGraph();

    // Quick mode: configurable number of top priority files
    const quickFileCount = process.argv.includes('--mini')
      ? 3
      : process.argv.includes('--quick')
        ? 5
        : process.argv.includes('--medium')
          ? 25
          : 5;

    const prioritizedFiles = this.analyzer.prioritizeFilesByImpact().slice(0, quickFileCount);
    console.log(`🎯 Analyzing only top ${prioritizedFiles.length} priority files`);

    // Single batch mode: 1 batch with all priority files
    console.log(`📦 Creating single batch for efficient analysis`);
    const batches = [prioritizedFiles.map((f) => f.path)]; // Single batch with all priority files
    return await this.processBatches(batches);
  }

  /**
   * Full analysis - all files with smart batching
   */
  async runFullAnalysis() {
    console.log('🔍 Running full analysis (all files)...');

    // Build dependency graph
    await this.analyzer.buildDependencyGraph();

    // Get all prioritized files
    const prioritizedFiles = this.analyzer.prioritizeFilesByImpact();
    console.log(`📊 Analyzing all ${prioritizedFiles.length} files`);

    // Create small batches to prevent ENOBUFS
    const batches = this.analyzer.createIntelligentBatches(prioritizedFiles, 8);
    return await this.processBatches(batches);
  }

  /**
   * Analyze-only mode - comprehensive analysis without fixing
   */
  async runAnalyzeOnly() {
    console.log('📊 Running analysis-only mode...');
    return await this.runFullAnalysis();
  }

  /**
   * Process batches of files with ENOBUFS prevention
   */
  async processBatches(batches) {
    const allViolations = [];
    let processedFiles = 0;

    for (const [index, batch] of batches.entries()) {
      const progress = (((index + 1) / batches.length) * 100).toFixed(1);
      console.log(`📦 Batch ${index + 1}/${batches.length} (${batch.length} files, ${progress}%)`);

      try {
        const violations = await this.runESLintOnBatch(batch);
        allViolations.push(...violations);
        processedFiles += batch.length;

        console.log(
          `✅ Batch ${index + 1}: ${violations.length} violations (${processedFiles} files processed)`
        );

        // Brief pause to prevent system overload
        if (index < batches.length - 1) {
          await this.sleep(50);
        }
      } catch (error) {
        console.warn(`⚠️  Batch ${index + 1} failed: ${error.message}`);
        // Continue with next batch instead of failing completely
      }
    }

    return allViolations;
  }

  /**
   * Run ESLint on a batch with proper error handling
   */
  async runESLintOnBatch(files) {
    return new Promise((resolve, reject) => {
      const eslint = spawn('npx', ['eslint', ...files, '--format', 'json'], {
        stdio: 'pipe',
        cwd: path.resolve(__dirname, '../..'),
        env: {
          ...process.env,
          NODE_OPTIONS: '--max-old-space-size=2048',
          NODE_NO_WARNINGS: '1',
        },
      });

      let stdout = '';
      let stderr = '';

      eslint.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });

      eslint.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      eslint.on('close', (code) => {
        try {
          // ESLint returns non-zero for violations, which is expected
          const results = JSON.parse(stdout || '[]');
          const violations = results.flatMap((file) =>
            file.messages.map((msg) => ({
              file: file.filePath,
              line: msg.line,
              column: msg.column,
              rule: msg.ruleId,
              message: msg.message,
              severity: msg.severity,
              fixable: msg.fix !== undefined,
            }))
          );
          resolve(violations);
        } catch (parseError) {
          reject(new Error(`ESLint parse error: ${parseError.message}`));
        }
      });

      eslint.on('error', reject);

      // Timeout per batch
      setTimeout(() => {
        eslint.kill();
        reject(new Error('ESLint batch timeout'));
      }, 120000); // 2 minutes per batch
    });
  }

  /**
   * Generate analysis report
   */
  generateAnalysisReport(violations) {
    console.log('\n📋 Analysis Report:');

    // Group by rule
    const byRule = violations.reduce((acc, v) => {
      acc[v.rule] = (acc[v.rule] || 0) + 1;
      return acc;
    }, {});

    console.log('\n🔍 Top violation types:');
    Object.entries(byRule)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([rule, count]) => {
        console.log(`  • ${rule}: ${count} violations`);
      });

    // Group by file
    const byFile = violations.reduce((acc, v) => {
      acc[v.file] = (acc[v.file] || 0) + 1;
      return acc;
    }, {});

    console.log('\n🚨 Most problematic files:');
    Object.entries(byFile)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([file, count]) => {
        const fileName = path.basename(file);
        console.log(`  • ${fileName}: ${count} violations`);
      });

    // Count fixable violations
    const fixable = violations.filter((v) => v.fixable).length;
    console.log(
      `\n⚙️  Auto-fixable violations: ${fixable}/${violations.length} (${((fixable / violations.length) * 100).toFixed(1)}%)`
    );
  }

  /**
   * Perform REAL AI-assisted fixes using Claude CLI
   */
  async performAIAssistedFixes(violations) {
    console.log('\n🤖 Starting REAL Claude AI-assisted fixing...');

    // Test Claude CLI availability first
    console.log('🔍 Testing Claude CLI availability...');
    const claudeAvailable = await ClaudeAIIntegration.testClaudeAvailability();

    if (!claudeAvailable) {
      console.log('❌ Claude CLI not available. Cannot perform AI fixes.');
      console.log('💡 Install Claude CLI: npm install -g @anthropic/claude-cli');
      return this.generateAnalysisReport(violations);
    }

    console.log('✅ Claude CLI ready for AI-assisted fixing');

    // Group violations by priority for fixing
    const priorityGroups = this.categorizeViolations(violations);

    console.log(`\n📊 Violation categories:`);
    console.log(`  • High Priority: ${priorityGroups.high.length} violations`);
    console.log(`  • Medium Priority: ${priorityGroups.medium.length} violations`);
    console.log(`  • Low Priority: ${priorityGroups.low.length} violations`);

    // Use Claude AI integration for real fixes
    const claude = new ClaudeAIIntegration();

    const dryRun = process.argv.includes('--dry-run');
    const maxFixes = process.argv.includes('--quick') ? 1 : 50; // Just 1 for debugging

    console.log(`\n🎯 Mode: ${dryRun ? 'DRY RUN' : 'LIVE FIXING'}`);
    console.log(`🎯 Max fixes: ${maxFixes} violations`);

    const result = await claude.fixViolations(violations, {
      maxFixes,
      dryRun,
    });

    console.log('\n🎊 Real AI fixing complete!');
    return result;
  }

  /**
   * Categorize violations by priority
   */
  categorizeViolations(violations) {
    const high = [];
    const medium = [];
    const low = [];

    const highPriorityRules = [
      '@typescript-eslint/no-explicit-any',
      'jsdoc/require-file-overview',
      'jsdoc/require-description-complete-sentence',
      'security/detect-unsafe-regex',
      'security/detect-buffer-noassert',
    ];

    const mediumPriorityRules = [
      'jsdoc/require-param-description',
      'jsdoc/require-returns-description',
      'jsdoc/require-example',
      '@typescript-eslint/prefer-for-of',
    ];

    for (const violation of violations) {
      if (highPriorityRules.includes(violation.rule)) {
        high.push(violation);
      } else if (mediumPriorityRules.includes(violation.rule)) {
        medium.push(violation);
      } else {
        low.push(violation);
      }
    }

    return { high, medium, low };
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  const fixer = new ZenAIFixerBatched();

  const mode = process.argv.includes('--mini')
    ? 'quick'
    : process.argv.includes('--quick')
      ? 'quick'
      : process.argv.includes('--medium')
        ? 'quick'
        : process.argv.includes('--analyze-only')
          ? 'analyze'
          : 'production';

  await fixer.run(mode);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ZenAIFixerBatched };
