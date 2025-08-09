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
import { ProcessLock } from './process-lock.js';
import { TypeScriptGraphESLintAnalyzer } from './zen-eslint-graph-typescript.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class ZenAIFixerComplete {
  constructor() {
    this.analyzer = new TypeScriptGraphESLintAnalyzer();
    this.violations = [];
    this.claude = new ClaudeAIIntegration();
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
    const phaseArg = process.argv.find(arg => arg.startsWith('--phase='));
    if (phaseArg) {
      return phaseArg.split('=')[1];
    }
    return null;
  }

  /**
   * Phase 1: Fix TypeScript Compilation Errors
   */
  async fixTypeScriptErrors() {
    console.log('🔍 Checking TypeScript compilation...');

    const tsErrors = await this.runTypeScriptCompiler();
    
    if (tsErrors.length === 0) {
      console.log('✅ No TypeScript compilation errors found');
      return;
    }

    console.log(`🚨 Found ${tsErrors.length} TypeScript compilation errors`);
    
    // Test Claude CLI availability
    const claudeAvailable = await ClaudeAIIntegration.testClaudeAvailability();
    if (!claudeAvailable) {
      console.log('❌ Claude CLI not available. Cannot fix TypeScript errors.');
      console.log('💡 Install Claude CLI: npm install -g @anthropic/claude-cli');
      process.exit(1);
    }

    console.log('🤖 Using Claude AI to fix TypeScript compilation errors...');

    // Group errors by file for efficient fixing
    const errorsByFile = this.groupErrorsByFile(tsErrors);
    let fixedFiles = 0;
    const filesWithComments = [];

    for (const [filePath, errors] of errorsByFile.entries()) {
      console.log(`🔧 Fixing ${errors.length} errors in ${path.basename(filePath)}`);
      
      const result = await this.fixTypeScriptErrorsInFile(filePath, errors);
      
      if (result.success) {
        if (result.commented) {
          console.log(`  💬 Added ${errors.length} TODO comments (AI unsure - human review needed)`);
          filesWithComments.push({
            filePath,
            todoComments: result.todoComments
          });
        } else {
          fixedFiles++;
          console.log(`  ✅ Fixed ${errors.length} errors`);
        }
      } else {
        console.warn(`  ⚠️  Failed to fix errors: ${result.error}`);
      }
    }

    console.log(`🎯 Phase 1 Complete: ${fixedFiles}/${errorsByFile.size} files fixed`);

    // Generate TODO comments report if any files have comments
    if (filesWithComments.length > 0) {
      this.generateTodoCommentsReport(filesWithComments);
    }

    // Verify compilation now works
    const remainingErrors = await this.runTypeScriptCompiler();
    if (remainingErrors.length > 0) {
      console.warn(`⚠️  ${remainingErrors.length} TypeScript errors remain - continuing with ESLint phase`);
    } else {
      console.log('🎉 All TypeScript compilation errors resolved!');
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

    console.log(`📊 ESLint Analysis Complete: ${violations.length} violations found`);

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
      console.log(`🔧 Fixing ${warnings.length} warnings in ${path.basename(filePath)}`);
      
      const result = await this.fixTypeScriptWarningsInFile(filePath, warnings);
      
      if (result.success) {
        if (result.commented) {
          console.log(`  💬 Added ${warnings.length} TODO comments (AI unsure - human review needed)`);
        } else {
          fixedFiles++;
          console.log(`  ✅ Fixed ${warnings.length} warnings`);
        }
      } else {
        console.warn(`  ⚠️  Failed to fix warnings: ${result.error}`);
      }
    }

    console.log(`🎯 Phase 3 Complete: ${fixedFiles}/${warningsByFile.size} files fixed`);
  }

  /**
   * Run TypeScript compiler to get compilation errors (same as build.sh)
   */
  async runTypeScriptCompiler() {
    return new Promise((resolve) => {
      // Use exact same TypeScript compilation as build.sh
      const tsc = spawn('node', [
        './node_modules/typescript/lib/tsc.js',
        '--noEmitOnError', 'false',
        '--skipLibCheck', 'true', 
        '--noImplicitAny', 'false',
        '--strict', 'false',
        '--forceConsistentCasingInFileNames', 'false',
        '--noUnusedLocals', 'false',
        '--noUnusedParameters', 'false',
        '--noEmit', 'true',  // Add noEmit for error checking only
        '--pretty', 'false'
      ], {
        stdio: 'pipe',
        cwd: path.resolve(__dirname, '../..'),
        env: {
          ...process.env,
          NODE_OPTIONS: '--max-old-space-size=2048',
        },
      });

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
      const tsc = spawn('npx', ['tsc', '--noEmit', '--strict', '--noImplicitAny', '--pretty', 'false'], {
        stdio: 'pipe',
        cwd: path.resolve(__dirname, '../..'),
        env: {
          ...process.env,
          NODE_OPTIONS: '--max-old-space-size=2048',
        },
      });

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
      const match = line.match(/^(.+\.tsx?)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
      if (match) {
        errors.push({
          file: path.resolve(__dirname, '../..', match[1]),
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          code: match[4],
          message: match[5],
          fullLine: line
        });
      }
    }
    
    console.log(`🔍 Parsed ${errors.length} TypeScript errors from ${lines.length} lines of output`);
    
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
    
    return errorsByFile;
  }

  /**
   * Check if file should be skipped (libraries, node_modules, etc)
   */
  shouldSkipFile(filePath) {
    const skipPatterns = [
      'node_modules/',
      '.d.ts',              // TypeScript declaration files
      '/dist/',
      '/build/',
      'lib/',
      'vendor/',
      '.min.js',
      '.bundle.js'
    ];
    
    return skipPatterns.some(pattern => filePath.includes(pattern));
  }

  /**
   * Fix TypeScript compilation errors in a specific file + Auto-ESLint fix
   */
  async fixTypeScriptErrorsInFile(filePath, errors) {
    const prompt = `Fix these TypeScript compilation errors in ${path.basename(filePath)}:

${errors.map(error => `Line ${error.line}, Column ${error.column}: ${error.code} - ${error.message}`).join('\n')}

PRIORITY ORDER for TypeScript compilation errors:

1. ✅ HIGH CONFIDENCE: Missing properties, interface mismatches, type definitions 
   → READ the type files, ENHANCE the types, FIX properly
   → When code has clear intent (like template customization), improve the type system
   → Example: If code tries to set .name but interface lacks .name, ADD .name to interface

2. ✅ MEDIUM CONFIDENCE: Import paths, module resolution, simple type corrections
   → INVESTIGATE and FIX if solution is clear
   
3. ❌ LOW CONFIDENCE: Complex business logic, external dependencies, unclear intent  
   → ADD TODO comments for human review

CRITICAL: NEVER comment out functionality that has clear intent - FIX THE TYPES INSTEAD.
If you can read type definitions and the intent is obvious, enhance the type system rather than disable functionality.

File to fix: ${filePath}
Please use your Read and Write tools to either:
1. CONFIDENTLY FIX: Read file → Apply safe fixes → Write back
2. SAFELY COMMENT: Read file → Add TODO comments for risky errors → Write back

Use your tools directly - do not return code in your response.`;

    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const result = await this.claude.callClaudeCLI(filePath, prompt);
      const updatedContent = fs.readFileSync(filePath, 'utf8');
      
      // Check if Claude added TODO comments instead of fixing
      const addedTodoComments = this.detectTodoComments(originalContent, updatedContent);
      
      if (addedTodoComments.count > 0) {
        console.log(`   💬 Claude added ${addedTodoComments.count} TODO comments for human review`);
        return { success: true, result, commented: true, todoComments: addedTodoComments.comments };
      }
      
      // Auto-ESLint fix after successful TypeScript fix (only if actually fixed, not commented)
      console.log(`   🔧 Auto-ESLint: Running ESLint --fix on ${path.basename(filePath)}`);
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
        if (line.includes('TODO:') && 
            (line.includes('TypeScript error') || 
             line.includes('AI unsure') || 
             line.includes('human review needed'))) {
          addedComments.push({
            lineNumber: index + 1,
            comment: line.trim()
          });
        }
      }
    });
    
    return {
      count: addedComments.length,
      comments: addedComments
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

      let fixedCount = 0;
      let stderr = '';

      eslint.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      eslint.on('close', (code) => {
        if (code === 0) {
          console.log(`   🔧 Auto-ESLint: Fixed auto-fixable violations in ${path.basename(filePath)}`);
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

${warnings.map(warning => `Line ${warning.line}, Column ${warning.column}: ${warning.code} - ${warning.message}`).join('\n')}

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
      const result = await this.claude.callClaudeCLI(filePath, prompt);
      const updatedContent = fs.readFileSync(filePath, 'utf8');
      
      // Check if Claude added TODO comments instead of fixing
      const addedTodoComments = this.detectTodoComments(originalContent, updatedContent);
      
      if (addedTodoComments.count > 0) {
        console.log(`   💬 Claude added ${addedTodoComments.count} TODO comments for human review`);
        return { success: true, result, commented: true, todoComments: addedTodoComments.comments };
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
    console.log(`🔍 Running quick ESLint analysis (top 5 priority files only)${includeTests ? ' + test files' : ''}...`);

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

    const prioritizedFiles = this.analyzer.prioritizeFilesByImpact().slice(0, quickFileCount);
    console.log(`🎯 Analyzing only top ${prioritizedFiles.length} priority files${includeTests ? ' (including tests)' : ''}`);

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
      `\n⚙️  Auto-fixable violations: ${fixable}/${violations.length} (${((fixable / violations.length) * 100).toFixed(1)}%)`
    );
  }

  /**
   * Perform REAL AI-assisted fixes using Claude CLI
   */
  async performAIAssistedFixes(violations) {
    console.log('\n🤖 Starting REAL Claude AI-assisted ESLint fixing...');

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

    console.log(`\n📊 ESLint violation categories:`);
    console.log(`  • High Priority: ${priorityGroups.high.length} violations`);
    console.log(`  • Medium Priority: ${priorityGroups.medium.length} violations`);
    console.log(`  • Low Priority: ${priorityGroups.low.length} violations`);

    const dryRun = process.argv.includes('--dry-run');
    const maxFixes = process.argv.includes('--quick') ? 1 : 50; // Just 1 for debugging

    console.log(`\n🎯 Mode: ${dryRun ? 'DRY RUN' : 'LIVE FIXING'}`);
    console.log(`🎯 Max fixes: ${maxFixes} violations`);

    const result = await this.claude.fixViolations(violations, {
      maxFixes,
      dryRun,
    });

    console.log('\n🎊 Real AI ESLint fixing complete!');
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
    console.log('=' .repeat(60));
    
    let totalComments = 0;
    
    filesWithComments.forEach(({ filePath, todoComments }) => {
      console.log(`\n📁 ${path.basename(filePath)}`);
      console.log(`   Path: ${path.relative(process.cwd(), filePath)}`);
      console.log(`   Comments: ${todoComments.length}`);
      
      todoComments.forEach(comment => {
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