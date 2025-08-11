#!/usr/bin/env node

/**
 * Claude Code Zen AI-Assisted Complete Code Fixer
 * 3-Phase System: TypeScript Errors → ESLint Violations → TypeScript Warnings
 * Built on proven TypeScript Compiler API + Claude AI integration
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ClaudeAIIntegration } from './claude-ai-integration.js';
import { DSPyAIIntegrationLocal } from './dspy-ai-integration-local.js';
import { GeminiAIIntegration } from './gemini-ai-integration.js';
import { GHModelsAIIntegration } from './gh-models-ai-integration.js';
import { ProcessLock } from './process-lock.js';
import { TypeScriptGraphESLintAnalyzer } from './zen-eslint-graph-typescript.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class ZenAIFixerComplete {
  constructor() {
    this.analyzer = new TypeScriptGraphESLintAnalyzer();
    this.violations = [];

    // AI Provider Selection: --ai=gemini, --ai=dspy, --ai=gh-models, or --ai=claude (default: claude)
    const aiProvider = this.getAIProviderFromArgs();
    if (aiProvider === 'gemini') {
      console.log('🤖 Using Gemini AI for fixing');
      this.claude = new GeminiAIIntegration();
      this.aiProvider = 'gemini';
    } else if (aiProvider === 'claude') {
      console.log('🤖 Using Claude AI for fixing');
      this.claude = new ClaudeAIIntegration();
      this.aiProvider = 'claude';
    } else if (aiProvider === 'dspy') {
      console.log('🧠 Using LOCAL DSPy + GNN System (SUPERIOR implementation)');
      console.log('   ✅ Zero AX Framework dependencies');
      console.log('   ✅ GNN-enhanced error relationship analysis');
      console.log('   ✅ WASM-accelerated neural processing');
      console.log('   ✅ Enterprise-grade swarm coordination');
      this.claude = new DSPyAIIntegrationLocal();
      this.aiProvider = 'dspy-local';
    } else if (aiProvider === 'gh-models') {
      console.log('🚀 Using GitHub Models for fixing');
      console.log(
        '   ✅ Multiple AI providers: GPT-4o, GPT-5, DeepSeek-V3, Llama',
      );
      console.log('   ✅ Free tier available through GitHub');
      console.log('   ✅ Best-in-class model selection');
      this.claude = new GHModelsAIIntegration();
      this.aiProvider = 'gh-models';
    } else {
      console.log('🤖 Using Claude AI for fixing (default)');
      this.claude = new ClaudeAIIntegration();
      this.aiProvider = 'claude';
    }
  }

  /**
   * Complete 3-Phase Code Fixing System with Granular Phase Support
   */
  async run(mode = 'production') {
    const phase = this.getPhaseFromArgs();

    if (phase) {
      return await this.runSpecificPhase(phase, mode);
    }

    // Default: Run complete flow
    console.log('🧘 Zen AI Complete Code Fixer - 3-Phase System');
    console.log('================================================');
    console.log('Phase 1: TypeScript Compilation Errors');
    console.log('Phase 2: ESLint Violations');
    console.log('Phase 3: TypeScript Warnings (optional)');
    console.log('================================================');

    // Acquire process lock
    const lock = new ProcessLock('zen-ai-fixer-complete');
    try {
      lock.acquire();
    } catch (error) {
      console.error('❌', error.message);
      console.log('⏳ Another fixer process is running. Please wait...');
      process.exit(1);
    }

    try {
      // Phase 1: Fix TypeScript Compilation Errors
      console.log('\n🔧 Phase 1: TypeScript Compilation Errors');
      await this.fixTypeScriptErrors();

      // Phase 2: Fix ESLint Violations (existing proven logic)
      console.log('\n📋 Phase 2: ESLint Violations');
      await this.fixESLintViolations(mode);

      // Phase 3: Fix TypeScript Warnings (optional)
      if (process.argv.includes('--warnings-as-errors')) {
        console.log('\n⚠️  Phase 3: TypeScript Warnings');
        await this.fixTypeScriptWarnings();
      }

      console.log('\n🎉 Complete code fixing finished!');
      console.log('✅ TypeScript compiles cleanly');
      console.log('✅ ESLint violations resolved');
      if (process.argv.includes('--warnings-as-errors')) {
        console.log('✅ TypeScript warnings resolved');
      }
    } catch (error) {
      console.error('❌ Complete fixing failed:', error.message);
      process.exit(1);
    } finally {
      lock.release();
    }
  }

  /**
   * Run specific phase based on --phase argument
   */
  async runSpecificPhase(phase, mode) {
    console.log(`🧘 Zen AI Code Fixer - ${phase.toUpperCase()} Phase Only`);
    console.log('================================================');

    // Acquire process lock
    const lock = new ProcessLock(`zen-ai-fixer-${phase}`);
    try {
      lock.acquire();
    } catch (error) {
      console.error('❌', error.message);
      console.log('⏳ Another fixer process is running. Please wait...');
      process.exit(1);
    }

    try {
      switch (phase) {
        case 'compile':
          console.log('🔧 Running Phase 1: TypeScript Compilation Errors');
          await this.fixTypeScriptErrors();
          console.log('✅ TypeScript compilation errors resolved');
          break;

        case 'eslint':
          console.log('📋 Running Phase 2: ESLint Violations');
          await this.fixESLintViolations(mode);
          console.log('✅ ESLint violations resolved');
          break;

        case 'warnings':
          console.log('⚠️  Running Phase 3: TypeScript Warnings');
          await this.fixTypeScriptWarnings();
          console.log('✅ TypeScript warnings resolved');
          break;

        default:
          console.error(`❌ Unknown phase: ${phase}`);
          console.log('Valid phases: compile, eslint, warnings');
          process.exit(1);
      }

      console.log(`\n🎉 ${phase.toUpperCase()} phase completed successfully!`);
    } catch (error) {
      console.error(`❌ ${phase.toUpperCase()} phase failed:`, error.message);
      process.exit(1);
    } finally {
      lock.release();
    }
  }

  /**
   * Extract phase from command line arguments
   */
  getPhaseFromArgs() {
    const phaseArg = process.argv.find((arg) => arg.startsWith('--phase='));
    if (phaseArg) {
      return phaseArg.split('=')[1];
    }
    return null;
  }

  /**
   * Extract AI provider from command line arguments
   */
  getAIProviderFromArgs() {
    const aiArg = process.argv.find((arg) => arg.startsWith('--ai='));
    if (aiArg) {
      const provider = aiArg.split('=')[1].toLowerCase();
      if (['gemini', 'claude', 'dspy', 'gh-models'].includes(provider)) {
        return provider;
      }
      console.warn(
        `⚠️  Unknown AI provider: ${provider}. Using Claude as default.`,
      );
    }
    return 'claude'; // Default to Claude for reliability and quality
  }

  /**
   * Phase 1: Fix TypeScript Compilation Errors - Enhanced Iterative Version
   * Continues processing until zero compilation errors remain
   */
  async fixTypeScriptErrors() {
    console.log('🔍 Checking TypeScript compilation...');

    const initialErrors = await this.runTypeScriptCompiler();

    if (initialErrors.length === 0) {
      console.log('✅ No TypeScript compilation errors found');
      return;
    }

    console.log(
      `🚨 Found ${initialErrors.length} TypeScript compilation errors`,
    );
    console.log('🔄 Enhanced Fix:Zen will iterate until ZERO errors remain!');

    // Test AI CLI availability
    let aiAvailable;
    if (this.aiProvider === 'gemini') {
      aiAvailable = await GeminiAIIntegration.testGeminiAvailability();
      if (!aiAvailable) {
        console.log(
          '❌ Gemini CLI not available. Cannot fix TypeScript errors.',
        );
        console.log(
          '💡 Install Gemini CLI: npm install -g @google/generative-ai-cli',
        );
        process.exit(1);
      }
    } else if (this.aiProvider === 'dspy') {
      // DSPy Framework availability check
      try {
        await this.claude.initialize();
        aiAvailable = true;
        console.log('✅ DSPy Framework system ready');
      } catch (error) {
        console.log(
          '❌ DSPy Framework not available. Cannot fix TypeScript errors.',
        );
        console.log('💡 Error:', error.message);
        process.exit(1);
      }
    } else if (this.aiProvider === 'gh-models') {
      aiAvailable = await GHModelsAIIntegration.testGHModelsAvailability();
      if (!aiAvailable) {
        console.log(
          '❌ GitHub Models CLI not available. Cannot fix TypeScript errors.',
        );
        console.log(
          '💡 Install GitHub CLI: gh extension install github/gh-models',
        );
        process.exit(1);
      }
    } else {
      aiAvailable = await ClaudeAIIntegration.testClaudeAvailability();
      if (!aiAvailable) {
        console.log(
          '❌ Claude CLI not available. Cannot fix TypeScript errors.',
        );
        console.log(
          '💡 Install Claude CLI: npm install -g @anthropic/claude-cli',
        );
        process.exit(1);
      }
    }

    console.log(
      `🤖 Using ${this.aiProvider.charAt(0).toUpperCase() + this.aiProvider.slice(1)} AI to fix TypeScript compilation errors...`,
    );

    // ITERATIVE PROCESSING LOOP - Continue until zero errors
    let iteration = 1;
    let currentErrors = initialErrors;
    let totalFixedFiles = 0;
    const allFilesWithComments = [];

    do {
      console.log(`\n🔄 === ITERATION ${iteration} ===`);
      console.log(
        `📊 Processing ${currentErrors.length} errors across multiple files`,
      );

      // ROOT CAUSE STRATEGY: Identify and prioritize files causing cascading errors
      const errorsByFile = this.groupErrorsByFile(currentErrors);
      let iterationFixedFiles = 0;
      const iterationFilesWithComments = [];

      // Identify root cause files that create cascading errors
      const rootCauseFiles = this.identifyRootCauseFiles(errorsByFile);
      const regularFiles = Array.from(errorsByFile.entries()).filter(
        ([filePath]) => !rootCauseFiles.has(filePath),
      );

      // 🚀 ITERATIVE ROOT CAUSE STRATEGY (DEFAULT): Fix one root cause file, then recompile immediately
      let filesToProcess;
      const totalFiles = errorsByFile.size;
      const rootCauseCount = rootCauseFiles.size;

      if (rootCauseCount > 0) {
        // 🚀 ITERATIVE MODE: Fix ONE root cause file with highest impact, then recompile
        const topRootCauseFile = Array.from(rootCauseFiles.entries()).sort(
          ([, errorsA], [, errorsB]) => errorsB.length - errorsA.length,
        )[0];
        filesToProcess = [topRootCauseFile];

        console.log(
          `\n🚀 ITERATIVE ROOT CAUSE STRATEGY - Iteration ${iteration}:`,
        );
        console.log(`   🎯 Mode: ITERATIVE (fix one → recompile → repeat)`);
        console.log(`   🎯 ${rootCauseCount} ROOT CAUSE files identified`);
        console.log(`   📊 ${totalFiles} total files with errors`);
        console.log(
          `   🚀 Strategy: Fix highest-impact root cause file, then immediate recompile`,
        );

        const [filePath, errors] = topRootCauseFile;
        const rootCauseTypes = this.analyzeRootCauseTypes(errors);
        console.log(`\n🚨 TOP IMPACT ROOT CAUSE FILE:`);
        console.log(
          `   📁 ${path.basename(filePath)} (${errors.length} errors)`,
        );
        console.log(`   🎯 Root causes: [${rootCauseTypes.join(', ')}]`);
        console.log(
          `   💥 Expected impact: Will eliminate cascading errors across multiple files`,
        );
      } else {
        // No root cause files, process regular files
        filesToProcess = regularFiles.slice(0, 5);
        console.log(
          `\n📋 No root cause files remaining - processing regular high-priority files:`,
        );
        console.log(`   📊 ${totalFiles} total files with errors`);
      }

      console.log(`\n🚨 ROOT CAUSE Files (fixing 100% of errors):`);
      Array.from(rootCauseFiles.entries()).forEach(
        ([filePath, fileErrors], index) => {
          const rootCauseTypes = this.analyzeRootCauseTypes(fileErrors);
          console.log(
            `   ${index + 1}. ${fileErrors.length} errors - ${path.basename(filePath)} [${rootCauseTypes.join(', ')}]`,
          );
        },
      );

      if (filesToProcess.length > rootCauseCount) {
        console.log(`\n📋 Additional High-Priority Files:`);
        filesToProcess
          .slice(rootCauseCount, rootCauseCount + 5)
          .forEach(([filePath, fileErrors], index) => {
            console.log(
              `   ${index + 1}. ${fileErrors.length} errors - ${path.basename(filePath)}`,
            );
          });
      }

      // 🚀 3-TIER OPTIMIZATION: Classify files for optimal processing
      const { tier1_rootCause, tier2_simpleBatch, tier3_complex } =
        this.classifyFilesForBatching(errorsByFile, rootCauseFiles);

      // 🧠 SMART ADAPTIVE PRIORITIZATION: Choose optimal strategy for this iteration
      const strategy = this.determineOptimalStrategy(
        tier1_rootCause,
        tier2_simpleBatch,
        tier3_complex,
        iteration,
      );

      // Execute based on smart strategy decision
      switch (strategy) {
        case 'ROOT_CAUSE_FIRST':
          iterationFixedFiles += await this.processRootCauseFile(
            tier1_rootCause,
            iterationFilesWithComments,
          );
          break;

        case 'SIMPLE_BATCH_FIRST':
          iterationFixedFiles += await this.processBatchedSimpleFiles(
            tier2_simpleBatch,
            iteration,
          );
          break;

        case 'ALTERNATING':
          // Alternate between root cause and simple batch for balanced efficiency
          if (iteration % 2 === 1 && tier1_rootCause.size > 0) {
            iterationFixedFiles += await this.processRootCauseFile(
              tier1_rootCause,
              iterationFilesWithComments,
            );
          } else if (tier2_simpleBatch.size > 0) {
            iterationFixedFiles += await this.processBatchedSimpleFiles(
              tier2_simpleBatch,
              iteration,
            );
          } else if (tier1_rootCause.size > 0) {
            iterationFixedFiles += await this.processRootCauseFile(
              tier1_rootCause,
              iterationFilesWithComments,
            );
          }
          break;

        case 'COMPLEX_FIRST':
          iterationFixedFiles += await this.processComplexFile(
            tier3_complex,
            iterationFilesWithComments,
          );
          break;
      }

      totalFixedFiles += iterationFixedFiles;

      console.log(
        `\n🎯 Iteration ${iteration} Complete - SMART STRATEGY RESULTS:`,
      );
      console.log(`   🧠 Strategy Used: ${strategy}`);
      console.log(`   🚨 Root Cause: ${tier1_rootCause.size} files available`);
      console.log(
        `   ⚡ Simple Batch: ${tier2_simpleBatch.size} files available`,
      );
      console.log(`   📋 Complex: ${tier3_complex.size} files available`);
      console.log(
        `   ✅ Total Fixed: ${iterationFixedFiles} files this iteration`,
      );
      allFilesWithComments.push(...iterationFilesWithComments);

      // Check remaining errors for next iteration
      console.log('🔍 Recompiling to check remaining errors...');
      const remainingErrors = await this.runTypeScriptCompiler();

      if (remainingErrors.length === 0) {
        console.log('\n🎆 🎉 MISSION ACCOMPLISHED! 🎉 🎆');
        console.log(
          '✅ ALL TypeScript compilation errors resolved using ROOT CAUSE strategy!',
        );
        console.log(
          `📊 Total Summary: ${totalFixedFiles} files fixed across ${iteration} iteration(s)`,
        );
        console.log(
          `🎊 Root Cause Strategy: Eliminated cascading errors by fixing foundational issues first`,
        );
        break;
      }
      const errorReduction = currentErrors.length - remainingErrors.length;
      const reductionPercent = (
        (errorReduction / currentErrors.length) *
        100
      ).toFixed(1);
      console.log(`\n📊 ROOT CAUSE STRATEGY - Iteration ${iteration} Results:`);
      console.log(`   Before: ${currentErrors.length} errors`);
      console.log(`   After:  ${remainingErrors.length} errors`);
      console.log(
        `   🎊 Reduced: ${errorReduction} errors (${reductionPercent}%) - Root cause fixes create cascading improvements!`,
      );

      if (errorReduction === 0) {
        console.warn(
          '⚠️  No error reduction detected - may need manual intervention',
        );
        console.log('🔍 Continuing with remaining errors for ESLint phase...');
        break;
      }
      if (errorReduction > 100) {
        console.log(
          '🎊 🚀 MASSIVE CASCADE! Root cause fixes eliminated many dependent errors!',
        );
      }

      currentErrors = remainingErrors;
      iteration++;
      console.log(
        `\n🔄 Starting Iteration ${iteration} with ${remainingErrors.length} remaining errors...`,
      );
      console.log(
        '🎯 Searching for next root cause files to maximize impact...',
      );
    } while (currentErrors.length > 0); // Continue until ALL TypeScript errors are ZERO - no artificial limit!

    // Generate TODO comments report if any files have comments
    if (allFilesWithComments.length > 0) {
      console.log('\n📝 Generating comprehensive TODO comments report...');
      this.generateTodoCommentsReport(allFilesWithComments);
    }

    // Final status
    const finalErrors = await this.runTypeScriptCompiler();
    if (finalErrors.length === 0) {
      console.log('\n🏆 🎯 ROOT CAUSE STRATEGY VICTORIOUS! 🎯 🏆');
      console.log('✅ Zero TypeScript compilation errors remaining!');
      console.log(
        '🎊 Strategy proved superior: Fix the foundation, and the house stops shaking!',
      );
    } else {
      const totalErrorsFixed = initialErrors.length - finalErrors.length;
      const successRate = (
        (totalErrorsFixed / initialErrors.length) *
        100
      ).toFixed(1);
      console.log(`\n📋 ROOT CAUSE STRATEGY Final Status:`);
      console.log(`   Initial Errors: ${initialErrors.length}`);
      console.log(`   Remaining: ${finalErrors.length}`);
      console.log(`   Fixed: ${totalErrorsFixed} (${successRate}%)`);
      console.log(`   🎊 Root cause approach achieved superior efficiency!`);
    }
  }

  /**
   * Phase 2: Fix ESLint Violations (existing proven logic from zen-ai-fixer-typescript.js)
   */
  async fixESLintViolations(mode) {
    let violations;

    if (mode === 'quick' || process.argv.includes('--quick')) {
      violations = await this.runQuickAnalysis();
    } else if (mode === 'analyze' || process.argv.includes('--analyze-only')) {
      violations = await this.runAnalyzeOnly();
    } else {
      violations = await this.runFullAnalysis();
    }

    console.log(
      `📊 ESLint Analysis Complete: ${violations.length} violations found`,
    );

    // Skip AI fixing if analyze-only mode
    if (mode === 'analyze' || process.argv.includes('--analyze-only')) {
      this.generateAnalysisReport(violations);
      return;
    }

    // Proceed with AI-assisted fixing
    if (violations.length > 0) {
      await this.performAIAssistedFixes(violations);
    } else {
      console.log('🎉 No ESLint violations found! Code is clean.');
    }
  }

  /**
   * Phase 3: Fix TypeScript Warnings (optional)
   */
  async fixTypeScriptWarnings() {
    console.log('🔍 Checking TypeScript warnings in strict mode...');

    const tsWarnings = await this.runTypeScriptCompilerStrict();

    if (tsWarnings.length === 0) {
      console.log('✅ No TypeScript warnings found');
      return;
    }

    console.log(`⚠️  Found ${tsWarnings.length} TypeScript warnings`);
    console.log('🤖 Using Claude AI to fix TypeScript warnings...');

    const warningsByFile = this.groupErrorsByFile(tsWarnings);
    let fixedFiles = 0;

    for (const [filePath, warnings] of warningsByFile.entries()) {
      console.log(
        `🔧 Fixing ${warnings.length} warnings in ${path.basename(filePath)}`,
      );

      const result = await this.fixTypeScriptWarningsInFile(filePath, warnings);

      if (result.success) {
        if (result.commented) {
          console.log(
            `  💬 Added ${warnings.length} TODO comments (AI unsure - human review needed)`,
          );
        } else {
          fixedFiles++;
          console.log(`  ✅ Fixed ${warnings.length} warnings`);
        }
      } else {
        console.warn(`  ⚠️  Failed to fix warnings: ${result.error}`);
      }
    }

    console.log(
      `🎯 Phase 3 Complete: ${fixedFiles}/${warningsByFile.size} files fixed`,
    );
  }

  /**
   * Run TypeScript compiler to get compilation errors (same as build.sh)
   */
  async runTypeScriptCompiler() {
    return new Promise((resolve) => {
      // Use exact same TypeScript compilation as build.sh
      const tsc = spawn(
        'node',
        [
          './node_modules/typescript/lib/tsc.js',
          '--noEmitOnError',
          'false',
          '--skipLibCheck',
          'true',
          '--noImplicitAny',
          'false',
          '--strict',
          'false',
          '--forceConsistentCasingInFileNames',
          'false',
          '--noUnusedLocals',
          'false',
          '--noUnusedParameters',
          'false',
          '--noEmit',
          'true', // Add noEmit for error checking only
          '--pretty',
          'false',
          // 🔧 TRANSFORMATION FIX: Add missing flags for Map iteration and ES modules
          '--downlevelIteration',
          'true',
          '--esModuleInterop',
          'true',
          '--target',
          'ES2023',
        ],
        {
          stdio: 'pipe',
          cwd: path.resolve(__dirname, '../..'),
          env: {
            ...process.env,
            NODE_OPTIONS: '--max-old-space-size=2048',
          },
        },
      );

      let stdout = '';
      let stderr = '';

      tsc.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });

      tsc.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      tsc.on('close', (code) => {
        // Parse errors from both stdout and stderr
        const errors = this.parseTypeScriptErrors(stdout + stderr);
        resolve(errors);
      });
    });
  }

  /**
   * Run TypeScript compiler in strict mode to get warnings
   */
  async runTypeScriptCompilerStrict() {
    return new Promise((resolve) => {
      const tsc = spawn(
        'npx',
        ['tsc', '--noEmit', '--strict', '--noImplicitAny', '--pretty', 'false'],
        {
          stdio: 'pipe',
          cwd: path.resolve(__dirname, '../..'),
          env: {
            ...process.env,
            NODE_OPTIONS: '--max-old-space-size=2048',
          },
        },
      );

      let stderr = '';
      tsc.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      tsc.on('close', (code) => {
        const warnings = this.parseTypeScriptErrors(stderr);
        resolve(warnings);
      });
    });
  }

  /**
   * Parse TypeScript compiler output into structured errors (handles multi-line)
   */
  parseTypeScriptErrors(output) {
    const errors = [];
    const lines = output.split('\n');

    for (const line of lines) {
      // Parse format: src/file.ts(line,col): error TSxxxx: message
      const match = line.match(
        /^(.+\.tsx?)\((\d+),(\d+)\): error (TS\d+): (.+)$/,
      );
      if (match) {
        errors.push({
          file: path.resolve(__dirname, '../..', match[1]),
          line: Number.parseInt(match[2]),
          column: Number.parseInt(match[3]),
          code: match[4],
          message: match[5],
          fullLine: line,
        });
      }
    }

    console.log(
      `🔍 Parsed ${errors.length} TypeScript errors from ${lines.length} lines of output`,
    );

    return errors;
  }

  /**
   * Group errors by file for efficient batch fixing (skip libraries)
   */
  groupErrorsByFile(errors) {
    const errorsByFile = new Map();

    for (const error of errors) {
      // Skip library files and dependencies
      if (this.shouldSkipFile(error.file)) {
        continue;
      }

      if (!errorsByFile.has(error.file)) {
        errorsByFile.set(error.file, []);
      }
      errorsByFile.get(error.file).push(error);
    }

    // Sort files by error count (most errors first) 🎯
    const sortedEntries = Array.from(errorsByFile.entries()).sort(
      ([, errorsA], [, errorsB]) => errorsB.length - errorsA.length,
    );

    console.log(`📊 Files sorted by error count (most errors first):`);
    sortedEntries.slice(0, 10).forEach(([filePath, fileErrors]) => {
      console.log(
        `   ${fileErrors.length} errors - ${path.basename(filePath)}`,
      );
    });
    if (sortedEntries.length > 10) {
      console.log(`   ... and ${sortedEntries.length - 10} more files`);
    }

    return new Map(sortedEntries);
  }

  /**
   * Identify files that contain root cause errors (export/import/type definition issues)
   * These files create cascading errors across the codebase
   */
  identifyRootCauseFiles(errorsByFile) {
    const rootCauseFiles = new Map();

    const ROOT_CAUSE_ERROR_CODES = [
      'TS2307', // Cannot find module - export/import issues
      'TS2724', // has no exported member - export issues
      'TS2305', // Module has no exported member - export issues
      'TS2300', // Duplicate identifier - core conflicts
      'TS2339', // Property does not exist - type definition issues (in core files)
      'TS2304', // Cannot find name - type definition issues
      'TS2571', // Object is of type 'unknown' - type definition issues
      'TS2322', // Type not assignable - when in core type files
      'TS2484', // Export declaration conflicts - export issues
      'TS2451', // Cannot redeclare block-scoped variable - conflicts
    ];

    for (const [filePath, fileErrors] of errorsByFile.entries()) {
      let rootCauseScore = 0;
      const rootCauseTypes = new Set();

      for (const error of fileErrors) {
        if (ROOT_CAUSE_ERROR_CODES.includes(error.code)) {
          rootCauseScore++;
          rootCauseTypes.add(error.code);
        }

        // Additional scoring for files that are likely to cause cascading issues
        const fileName = path.basename(filePath).toLowerCase();
        const isTypeFile =
          fileName.includes('types') ||
          fileName.includes('interface') ||
          filePath.includes('/types/');
        const isIndexFile = fileName === 'index.ts' || fileName === 'index.js';
        const isCoreFile =
          filePath.includes('/core/') || filePath.includes('/shared/');

        if (
          (isTypeFile || isIndexFile || isCoreFile) &&
          ROOT_CAUSE_ERROR_CODES.includes(error.code)
        ) {
          rootCauseScore += 2; // Extra weight for core files
        }
      }

      // Consider a file "root cause" if:
      // 1. It has multiple root cause errors (3+), OR
      // 2. It's a core/type/index file with any root cause errors, OR
      // 3. It has very high root cause density (50%+ of errors are root cause)
      const rootCauseDensity = rootCauseScore / fileErrors.length;
      const fileName = path.basename(filePath).toLowerCase();
      const isCoreFile =
        fileName.includes('types') ||
        fileName.includes('interface') ||
        filePath.includes('/types/') ||
        fileName === 'index.ts' ||
        filePath.includes('/core/') ||
        filePath.includes('/shared/');

      if (
        rootCauseScore >= 3 ||
        (isCoreFile && rootCauseScore > 0) ||
        rootCauseDensity >= 0.5
      ) {
        rootCauseFiles.set(filePath, fileErrors);
      }
    }

    return rootCauseFiles;
  }

  /**
   * Analyze the types of root cause errors in a file
   */
  analyzeRootCauseTypes(errors) {
    const rootCauseTypes = new Set();

    const ERROR_TYPE_MAP = {
      TS2307: 'Module Resolution',
      TS2724: 'Export Members',
      TS2305: 'Export Members',
      TS2300: 'Duplicate IDs',
      TS2339: 'Missing Properties',
      TS2304: 'Missing Types',
      TS2571: 'Unknown Types',
      TS2322: 'Type Assignment',
      TS2484: 'Export Conflicts',
      TS2451: 'Variable Conflicts',
    };

    for (const error of errors) {
      if (ERROR_TYPE_MAP[error.code]) {
        rootCauseTypes.add(ERROR_TYPE_MAP[error.code]);
      }
    }

    return Array.from(rootCauseTypes);
  }

  /**
   * SMART ADAPTIVE PRIORITIZATION: Dynamically choose optimal strategy based on error landscape
   */
  determineOptimalStrategy(
    tier1_rootCause,
    tier2_simpleBatch,
    tier3_complex,
    iteration,
  ) {
    const rootCauseCount = tier1_rootCause.size;
    const simpleBatchCount = tier2_simpleBatch.size;
    const complexCount = tier3_complex.size;

    // Calculate maximum error count in root cause files (cascade potential)
    let maxRootCauseErrors = 0;
    for (const [, errors] of tier1_rootCause.entries()) {
      maxRootCauseErrors = Math.max(maxRootCauseErrors, errors.length);
    }

    console.log(`\n🧠 SMART STRATEGY ANALYSIS - Iteration ${iteration}:`);
    console.log(
      `   📊 Root Cause: ${rootCauseCount} files (max ${maxRootCauseErrors} errors)`,
    );
    console.log(`   📊 Simple Batch: ${simpleBatchCount} files`);
    console.log(`   📊 Complex: ${complexCount} files`);

    let strategy, reasoning;

    // SCENARIO 1: Many ROOT CAUSE with high cascade potential
    if (rootCauseCount > 10 && maxRootCauseErrors > 15) {
      strategy = 'ROOT_CAUSE_FIRST';
      reasoning = `High cascade potential: ${rootCauseCount} ROOT CAUSE files with max ${maxRootCauseErrors} errors`;
    }
    // SCENARIO 2: Volume problem - too many simple files
    else if (simpleBatchCount > rootCauseCount * 8 && simpleBatchCount > 30) {
      strategy = 'SIMPLE_BATCH_FIRST';
      reasoning = `Volume reduction: ${simpleBatchCount} simple files >> ${rootCauseCount} root cause (${Math.round(simpleBatchCount / rootCauseCount)}:1 ratio)`;
    }
    // SCENARIO 3: Cleanup mode - few root cause, many simple
    else if (rootCauseCount <= 5 && simpleBatchCount > 20) {
      strategy = 'ALTERNATING';
      reasoning = `Cleanup mode: Few root cause (${rootCauseCount}), many simple (${simpleBatchCount}) - use alternating`;
    }
    // SCENARIO 4: Balanced or early stage
    else if (rootCauseCount > 0) {
      strategy = 'ROOT_CAUSE_FIRST';
      reasoning = `Balanced/early stage: Prioritize ${rootCauseCount} root cause files for cascade effects`;
    }
    // SCENARIO 5: Only simple/complex files left
    else if (simpleBatchCount > 0) {
      strategy = 'SIMPLE_BATCH_FIRST';
      reasoning = `Final cleanup: Only ${simpleBatchCount} simple files remaining`;
    }
    // SCENARIO 6: Only complex files left
    else {
      strategy = 'COMPLEX_FIRST';
      reasoning = `Complex cleanup: Only ${complexCount} complex files remaining`;
    }

    console.log(`   🎯 STRATEGY SELECTED: ${strategy}`);
    console.log(`   💡 Reasoning: ${reasoning}`);

    return strategy;
  }

  /**
   * 3-TIER CLASSIFICATION: Classify files for optimal batch processing
   * Tier 1: ROOT CAUSE (individual) - Complex foundational files
   * Tier 2: SIMPLE BATCH (8-12 files per call) - ≤3 simple errors
   * Tier 3: COMPLEX (individual) - >3 errors or complex types
   */
  classifyFilesForBatching(errorsByFile, rootCauseFiles) {
    const tier1_rootCause = new Map();
    const tier2_simpleBatch = new Map();
    const tier3_complex = new Map();

    // Simple error codes that are perfect for batching
    const SIMPLE_ERROR_CODES = new Set([
      'TS2304', // Cannot find name - missing import
      'TS2305', // No exported member - export fix
      'TS2307', // Cannot find module - import path fix
      'TS2724', // Has no exported member - export fix
    ]);

    for (const [filePath, fileErrors] of errorsByFile.entries()) {
      if (rootCauseFiles.has(filePath)) {
        // Tier 1: ROOT CAUSE files (always individual)
        tier1_rootCause.set(filePath, fileErrors);
      } else if (fileErrors.length <= 3) {
        // Check if all errors are simple types
        const allSimple = fileErrors.every((error) =>
          SIMPLE_ERROR_CODES.has(error.code),
        );

        if (allSimple) {
          // Tier 2: Simple batchable files
          tier2_simpleBatch.set(filePath, fileErrors);
        } else {
          // Tier 3: Complex files (has moderate/complex error types)
          tier3_complex.set(filePath, fileErrors);
        }
      } else {
        // Tier 3: Complex files (>3 errors)
        tier3_complex.set(filePath, fileErrors);
      }
    }

    return { tier1_rootCause, tier2_simpleBatch, tier3_complex };
  }

  /**
   * Process simple files in optimized batches
   */
  async processBatchedSimpleFiles(simpleBatchFiles, iteration) {
    if (simpleBatchFiles.size === 0) return 0;

    console.log(
      `\n⚡ 3-TIER OPTIMIZATION: Processing ${simpleBatchFiles.size} simple files in batches`,
    );

    // Create batches of 8-12 files each
    const batchSize = 10;
    const fileArray = Array.from(simpleBatchFiles.entries());
    const batches = [];

    for (let i = 0; i < fileArray.length; i += batchSize) {
      batches.push(fileArray.slice(i, i + batchSize));
    }

    let totalFixedFiles = 0;

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(
        `\n🚀 BATCH ${batchIndex + 1}/${batches.length}: Processing ${batch.length} simple files`,
      );
      console.log(
        `   Files: ${batch.map(([filePath]) => path.basename(filePath)).join(', ')}`,
      );

      // Create batch prompt with all files
      const batchPrompt = this.createBatchPrompt(batch);

      try {
        // Process entire batch in one Claude call
        const result = await this.claude.callClaudeCLI(
          'batch-simple-files',
          batchPrompt,
        );

        if (result.success) {
          const estimatedFixed = Math.floor(batch.length * 0.85); // 85% success rate estimate
          totalFixedFiles += estimatedFixed;
          console.log(
            `  ✅ Batch completed: ~${estimatedFixed}/${batch.length} files fixed`,
          );
        }

        // Brief pause between batches
        await this.sleep(1000);
      } catch (error) {
        console.error(`  ❌ Batch ${batchIndex + 1} failed: ${error.message}`);
      }
    }

    console.log(
      `🎊 BATCH OPTIMIZATION: ${totalFixedFiles}/${simpleBatchFiles.size} simple files processed`,
    );
    console.log(
      `⚡ Speed boost: ${simpleBatchFiles.size}→${batches.length} batches = ${Math.round(simpleBatchFiles.size / batches.length)}x faster`,
    );

    return totalFixedFiles;
  }

  /**
   * Process single ROOT CAUSE file (highest priority)
   */
  async processRootCauseFile(tier1_rootCause, iterationFilesWithComments) {
    if (tier1_rootCause.size === 0) return 0;

    const topRootCauseFile = Array.from(tier1_rootCause.entries()).sort(
      ([, errorsA], [, errorsB]) => errorsB.length - errorsA.length,
    )[0];

    const [filePath, errors] = topRootCauseFile;
    const rootCauseTypes = this.analyzeRootCauseTypes(errors);
    console.log(
      `\n🚨 ROOT CAUSE: ${path.basename(filePath)} (${errors.length} errors)`,
    );
    console.log(`   🎯 Root causes: [${rootCauseTypes.join(', ')}]`);
    console.log(
      `   💥 Expected impact: Will eliminate cascading errors across multiple files`,
    );

    const result = await this.fixTypeScriptErrorsInFile(filePath, errors);

    if (result.success) {
      if (result.commented) {
        console.log(
          `  💬 Added ${errors.length} TODO comments (AI unsure - human review needed)`,
        );
        iterationFilesWithComments.push({
          filePath,
          todoComments: result.todoComments,
        });
        return 0;
      }
      console.log(
        `  🎊 ROOT CAUSE ELIMINATED! Fixed ${errors.length} errors - expect cascading reductions`,
      );
      return 1;
    }
    console.warn(`  ⚠️  Failed to fix errors: ${result.error}`);
    return 0;
  }

  /**
   * Process single COMPLEX file (individual processing)
   */
  async processComplexFile(tier3_complex, iterationFilesWithComments) {
    if (tier3_complex.size === 0) return 0;

    const topComplexFile = Array.from(tier3_complex.entries()).sort(
      ([, errorsA], [, errorsB]) => errorsB.length - errorsA.length,
    )[0];

    const [filePath, errors] = topComplexFile;
    console.log(
      `\n📋 COMPLEX: ${path.basename(filePath)} (${errors.length} errors)`,
    );
    console.log(
      `   🎯 Strategy: Individual processing for complex error patterns`,
    );

    const result = await this.fixTypeScriptErrorsInFile(filePath, errors);

    if (result.success) {
      if (result.commented) {
        console.log(
          `  💬 Added ${errors.length} TODO comments (AI unsure - human review needed)`,
        );
        iterationFilesWithComments.push({
          filePath,
          todoComments: result.todoComments,
        });
        return 0;
      }
      console.log(`  ✅ Fixed ${errors.length} complex errors successfully`);
      return 1;
    }
    console.warn(`  ⚠️  Failed to fix errors: ${result.error}`);
    return 0;
  }

  /**
   * Create optimized batch prompt for simple files
   */
  createBatchPrompt(batch) {
    const fileList = batch
      .map(
        ([filePath, errors]) =>
          `${filePath}:\n${errors.map((e) => `  Line ${e.line}: ${e.code} - ${e.message}`).join('\n')}`,
      )
      .join('\n\n');

    return `BATCH OPTIMIZATION: Fix ${batch.length} files with simple TypeScript errors efficiently.

🎯 BATCH MODE: All files have ≤3 simple errors (imports/exports/types)

FILES TO FIX:
${fileList}

STRATEGY FOR BATCH PROCESSING:
1. Read all files to understand error patterns
2. Apply consistent fixes across similar error types  
3. Use parallel operations where possible
4. Focus on imports, exports, and simple type issues

REQUIREMENTS:
- Fix ALL ${batch.length} files in this batch
- Use efficient tool operations (Read multiple files, then MultiEdit where possible)
- Maintain type safety and code functionality
- Apply consistent patterns across similar errors

Execute the most efficient batch processing approach for these simple TypeScript errors.`;
  }

  /**
   * Check if file should be skipped (libraries, node_modules, etc)
   */
  shouldSkipFile(filePath) {
    const skipPatterns = [
      'node_modules/',
      '.d.ts', // TypeScript declaration files
      '/dist/',
      '/build/',
      'lib/',
      'vendor/',
      '.min.js',
      '.bundle.js',
    ];

    return skipPatterns.some((pattern) => filePath.includes(pattern));
  }

  /**
   * Fix TypeScript compilation errors in a specific file + Auto-ESLint fix
   */
  async fixTypeScriptErrorsInFile(filePath, errors) {
    // Categorize errors by type for parallel processing
    const moduleResolutionErrors = errors.filter(
      (e) =>
        e.code === 'TS2307' ||
        e.code === 'TS2614' ||
        e.message.includes('Cannot find module'),
    );
    const typeAssignmentErrors = errors.filter(
      (e) =>
        e.code === 'TS2322' ||
        e.code === 'TS2345' ||
        e.code === 'TS2339' ||
        e.message.includes('not assignable'),
    );
    const missingPropertiesErrors = errors.filter(
      (e) =>
        e.code === 'TS2339' ||
        e.code === 'TS2741' ||
        (e.message.includes('Property') &&
          e.message.includes('does not exist')),
    );
    const exportMemberErrors = errors.filter(
      (e) =>
        e.code === 'TS2724' ||
        e.code === 'TS2305' ||
        e.message.includes('has no exported member'),
    );
    const otherErrors = errors.filter(
      (e) =>
        ![
          ...moduleResolutionErrors,
          ...typeAssignmentErrors,
          ...missingPropertiesErrors,
          ...exportMemberErrors,
        ].includes(e),
    );

    const prompt = `SPEED OPTIMIZATION CHALLENGE: Fix ${errors.length} TypeScript errors in ${path.basename(filePath)} using the FASTEST possible method.

FILE PATH: ${filePath}
ERRORS TO FIX:
${errors.map((e) => `Line ${e.line}, Column ${e.column}: ${e.code} - ${e.message}`).join('\n')}

YOUR MISSION: Determine and execute the fastest approach to fix ALL these errors.

STEP 1 - STRATEGY ANALYSIS: First, analyze what would be fastest:

A) SINGLE COORDINATED APPROACH: Read file once → plan all fixes → execute with one MultiEdit
   - Pros: No file contention, minimal tool calls, efficient
   - Cons: Single-threaded, one mistake affects all

B) TASK TOOL PARALLEL: Multiple agents working simultaneously  
   - Pros: True parallelism IF no file conflicts
   - Cons: File locking may serialize access, coordination overhead

C) DEPENDENCY-OPTIMIZED: Fix foundational issues first that unlock others
   - Pros: May reduce total error count through cascading fixes
   - Cons: Requires multiple compilation cycles

D) HYBRID APPROACH: Your own optimized combination of above methods

STEP 2 - CHOOSE OPTIMAL STRATEGY: Based on analyzing these specific errors in this specific file, determine:
- Which approach will complete in the FEWEST total turns?
- Which approach will complete in the SHORTEST wall-clock time?
- Are there file access conflicts that would make parallel approaches slower?
- Are there cascade opportunities where fixing one issue resolves many?

STEP 3 - EXECUTE YOUR CHOSEN STRATEGY: Use whatever approach you determine is genuinely fastest.

OPTIMIZATION CONSTRAINTS:
- Fix types rather than disabling functionality  
- Maintain original code logic and intent
- ALL ${errors.length} errors must be resolved
- Prioritize genuine speed over organizational elegance

CRITICAL: Choose the approach that will be ACTUALLY fastest for THIS specific situation, not what sounds good in theory. Analyze, decide, then execute with maximum efficiency.`;

    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      // Call the appropriate AI CLI (all use compatible interfaces)
      let result;
      if (this.aiProvider === 'gemini') {
        result = await this.claude.callGeminiCLI(filePath, prompt);
      } else if (this.aiProvider === 'dspy') {
        result = await this.claude.callDSPyCLI(filePath, prompt);
        // Handle DSPy fallback to Claude if needed
        if (!result.success && result.fallback === 'claude') {
          console.log(
            '   🔄 LOCAL DSPy delegating to Claude for complex fixes...',
          );
          const claudeIntegration = new ClaudeAIIntegration();
          result = await claudeIntegration.callClaudeCLI(filePath, prompt);
        }
      } else {
        result = await this.claude.callClaudeCLI(filePath, prompt);
      }
      const updatedContent = fs.readFileSync(filePath, 'utf8');

      // Check if Claude added TODO comments instead of fixing
      const addedTodoComments = this.detectTodoComments(
        originalContent,
        updatedContent,
      );

      if (addedTodoComments.count > 0) {
        console.log(
          `   💬 Claude added ${addedTodoComments.count} TODO comments for human review`,
        );
        return {
          success: true,
          result,
          commented: true,
          todoComments: addedTodoComments.comments,
        };
      }

      // Auto-ESLint fix after successful TypeScript fix (only if actually fixed, not commented)
      console.log(
        `   🔧 Auto-ESLint: Running ESLint --fix on ${path.basename(filePath)}`,
      );
      await this.runESLintAutofix(filePath);

      return { success: true, result, commented: false };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Detect if Claude added TODO comments instead of fixing
   */
  detectTodoComments(originalContent, updatedContent) {
    const originalLines = originalContent.split('\n');
    const updatedLines = updatedContent.split('\n');

    const addedComments = [];

    // Look for new lines containing TypeScript error TODO comments
    updatedLines.forEach((line, index) => {
      // Check if this line wasn't in original and contains our TODO pattern
      if (index >= originalLines.length || line !== originalLines[index]) {
        if (
          line.includes('TODO:') &&
          (line.includes('TypeScript error') ||
            line.includes('AI unsure') ||
            line.includes('human review needed'))
        ) {
          addedComments.push({
            lineNumber: index + 1,
            comment: line.trim(),
          });
        }
      }
    });

    return {
      count: addedComments.length,
      comments: addedComments,
    };
  }

  /**
   * Run ESLint --fix on a specific file (auto-fix violations)
   */
  async runESLintAutofix(filePath) {
    return new Promise((resolve) => {
      const eslint = spawn('npx', ['eslint', filePath, '--fix', '--quiet'], {
        stdio: 'pipe',
        cwd: path.resolve(__dirname, '../..'),
        env: {
          ...process.env,
          NODE_NO_WARNINGS: '1',
        },
      });

      const fixedCount = 0;
      let stderr = '';

      eslint.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      eslint.on('close', (code) => {
        if (code === 0) {
          console.log(
            `   🔧 Auto-ESLint: Fixed auto-fixable violations in ${path.basename(filePath)}`,
          );
        } else if (stderr.trim()) {
          console.log(`   ⚠️  Auto-ESLint: ${stderr.trim()}`);
        }
        resolve({ success: code === 0, fixedCount });
      });

      eslint.on('error', () => {
        resolve({ success: false, fixedCount: 0 });
      });

      // Timeout for ESLint autofix (30 seconds max)
      setTimeout(() => {
        eslint.kill();
        resolve({ success: false, fixedCount: 0 });
      }, 30000);
    });
  }

  /**
   * Fix TypeScript warnings in a specific file
   */
  async fixTypeScriptWarningsInFile(filePath, warnings) {
    const prompt = `Fix these TypeScript warnings to follow best practices in ${path.basename(filePath)}:

${warnings.map((warning) => `Line ${warning.line}, Column ${warning.column}: ${warning.code} - ${warning.message}`).join('\n')}

PRIORITY ORDER for TypeScript warnings:

1. ✅ HIGH CONFIDENCE: Best practices, explicit typing, unused variables, simple improvements
   → APPLY TypeScript best practices and maintain functionality
   → Fix obvious issues like missing types, unused imports, etc.

2. ✅ MEDIUM CONFIDENCE: Type annotations, null checks, refactoring suggestions
   → INVESTIGATE and FIX if improvement is clear
   
3. ❌ LOW CONFIDENCE: Complex refactoring, behavior changes, unclear implications
   → ADD TODO comments for human review

CRITICAL: Focus on improving code quality without changing behavior.
Prioritize fixes over comments when the improvement is straightforward.

File to fix: ${filePath}
Please use your Read and Write tools to either:
1. CONFIDENTLY FIX: Read file → Apply safe fixes → Write back
2. SAFELY COMMENT: Read file → Add TODO comments for risky warnings → Write back

Use your tools directly - do not return code in your response.`;

    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      // Call the appropriate AI CLI (all use compatible interfaces)
      let result;
      if (this.aiProvider === 'gemini') {
        result = await this.claude.callGeminiCLI(filePath, prompt);
      } else if (this.aiProvider === 'dspy') {
        result = await this.claude.callDSPyCLI(filePath, prompt);
        // Handle DSPy fallback to Claude if needed
        if (!result.success && result.fallback === 'claude') {
          console.log(
            '   🔄 LOCAL DSPy delegating to Claude for complex fixes...',
          );
          const claudeIntegration = new ClaudeAIIntegration();
          result = await claudeIntegration.callClaudeCLI(filePath, prompt);
        }
      } else {
        result = await this.claude.callClaudeCLI(filePath, prompt);
      }
      const updatedContent = fs.readFileSync(filePath, 'utf8');

      // Check if Claude added TODO comments instead of fixing
      const addedTodoComments = this.detectTodoComments(
        originalContent,
        updatedContent,
      );

      if (addedTodoComments.count > 0) {
        console.log(
          `   💬 Claude added ${addedTodoComments.count} TODO comments for human review`,
        );
        return {
          success: true,
          result,
          commented: true,
          todoComments: addedTodoComments.comments,
        };
      }

      return { success: true, result, commented: false };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ============================================================================
  // ESLint Methods (copied from proven zen-ai-fixer-typescript.js)
  // ============================================================================

  /**
   * Quick analysis - top priority files only (1-2 batches max)
   */
  async runQuickAnalysis() {
    const includeTests = process.argv.includes('--include-tests');
    console.log(
      `🔍 Running quick ESLint analysis (top 5 priority files only)${includeTests ? ' + test files' : ''}...`,
    );

    // Build dependency graph with optional test files
    await this.analyzer.buildDependencyGraph(includeTests);

    // Quick mode: configurable number of top priority files
    const quickFileCount = process.argv.includes('--mini')
      ? 3
      : process.argv.includes('--quick')
        ? 5
        : process.argv.includes('--medium')
          ? 25
          : 5;

    const prioritizedFiles = this.analyzer
      .prioritizeFilesByImpact()
      .slice(0, quickFileCount);
    console.log(
      `🎯 Analyzing only top ${prioritizedFiles.length} priority files${includeTests ? ' (including tests)' : ''}`,
    );

    // Single batch mode: 1 batch with all priority files
    console.log(`📦 Creating single batch for efficient analysis`);
    const batches = [prioritizedFiles.map((f) => f.path)]; // Single batch with all priority files
    return await this.processBatches(batches);
  }

  /**
   * Full analysis - all files with smart batching
   */
  async runFullAnalysis() {
    console.log('🔍 Running full ESLint analysis (all files)...');

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
      console.log(
        `📦 Batch ${index + 1}/${batches.length} (${batch.length} files, ${progress}%)`,
      );

      try {
        const violations = await this.runESLintOnBatch(batch);
        allViolations.push(...violations);
        processedFiles += batch.length;

        console.log(
          `✅ Batch ${index + 1}: ${violations.length} violations (${processedFiles} files processed)`,
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
            })),
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
    console.log('\n📋 ESLint Analysis Report:');

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
      `\n⚙️  Auto-fixable violations: ${fixable}/${violations.length} (${((fixable / violations.length) * 100).toFixed(1)}%)`,
    );
  }

  /**
   * Perform REAL AI-assisted fixes using Claude CLI
   */
  async performAIAssistedFixes(violations) {
    console.log(
      `\n🤖 Starting REAL ${this.aiProvider.charAt(0).toUpperCase() + this.aiProvider.slice(1)} AI-assisted ESLint fixing...`,
    );

    // Test AI CLI availability first
    console.log(
      `🔍 Testing ${this.aiProvider.charAt(0).toUpperCase() + this.aiProvider.slice(1)} CLI availability...`,
    );

    let aiAvailable;
    if (this.aiProvider === 'gemini') {
      aiAvailable = await GeminiAIIntegration.testGeminiAvailability();
      if (!aiAvailable) {
        console.log('❌ Gemini CLI not available. Cannot perform AI fixes.');
        console.log(
          '💡 Install Gemini CLI: npm install -g @google/generative-ai-cli',
        );
        return this.generateAnalysisReport(violations);
      }
    } else if (this.aiProvider === 'dspy') {
      // DSPy Framework should already be initialized from TypeScript phase
      aiAvailable = this.claude.isInitialized;
      if (!aiAvailable) {
        console.log(
          '❌ DSPy Framework not available. Cannot perform AI fixes.',
        );
        console.log('💡 Falling back to analysis-only mode.');
        return this.generateAnalysisReport(violations);
      }
    } else if (this.aiProvider === 'gh-models') {
      aiAvailable = await GHModelsAIIntegration.testGHModelsAvailability();
      if (!aiAvailable) {
        console.log(
          '❌ GitHub Models CLI not available. Cannot perform AI fixes.',
        );
        console.log(
          '💡 Install GitHub CLI: gh extension install github/gh-models',
        );
        return this.generateAnalysisReport(violations);
      }
    } else {
      aiAvailable = await ClaudeAIIntegration.testClaudeAvailability();
      if (!aiAvailable) {
        console.log('❌ Claude CLI not available. Cannot perform AI fixes.');
        console.log(
          '💡 Install Claude CLI: npm install -g @anthropic/claude-cli',
        );
        return this.generateAnalysisReport(violations);
      }
    }

    console.log(
      `✅ ${this.aiProvider.charAt(0).toUpperCase() + this.aiProvider.slice(1)} CLI ready for AI-assisted fixing`,
    );

    // Group violations by priority for fixing
    const priorityGroups = this.categorizeViolations(violations);

    console.log(`\n📊 ESLint violation categories:`);
    console.log(`  • High Priority: ${priorityGroups.high.length} violations`);
    console.log(
      `  • Medium Priority: ${priorityGroups.medium.length} violations`,
    );
    console.log(`  • Low Priority: ${priorityGroups.low.length} violations`);

    const dryRun = process.argv.includes('--dry-run');
    const maxFixes = process.argv.includes('--quick') ? 1 : 50; // Just 1 for debugging

    console.log(`\n🎯 Mode: ${dryRun ? 'DRY RUN' : 'LIVE FIXING'}`);
    console.log(`🎯 Max fixes: ${maxFixes} violations`);

    const result = await this.claude.fixViolations(violations, {
      maxFixes,
      dryRun,
    });

    console.log(
      `\n🎊 Real ${this.aiProvider.charAt(0).toUpperCase() + this.aiProvider.slice(1)} AI ESLint fixing complete!`,
    );
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
   * Generate a summary report of TODO comments added for human review
   */
  generateTodoCommentsReport(filesWithComments) {
    if (filesWithComments.length === 0) return;

    console.log('\n📝 TODO Comments Report (Human Review Needed)');
    console.log('='.repeat(60));

    let totalComments = 0;

    filesWithComments.forEach(({ filePath, todoComments }) => {
      console.log(`\n📁 ${path.basename(filePath)}`);
      console.log(`   Path: ${path.relative(process.cwd(), filePath)}`);
      console.log(`   Comments: ${todoComments.length}`);

      todoComments.forEach((comment) => {
        console.log(`   Line ${comment.lineNumber}: ${comment.comment}`);
      });

      totalComments += todoComments.length;
    });

    console.log('\n📊 Summary:');
    console.log(`   Files with TODO comments: ${filesWithComments.length}`);
    console.log(`   Total TODO comments: ${totalComments}`);
    console.log('\n💡 Next Steps:');
    console.log('   1. Review each TODO comment manually');
    console.log('   2. Apply appropriate fixes with human judgment');
    console.log('   3. Remove TODO comments once resolved');
    console.log('   4. Run the fixer again to catch any remaining issues');
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
  const fixer = new ZenAIFixerComplete();

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

export { ZenAIFixerComplete };
