#!/usr/bin/env node

/**
 * 🤖 Real Gemini AI Integration for ESLint Violations
 * Uses actual Gemini CLI with yolo mode and structured logging
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createClaudeAILogger,
  createClaudeCLILogger,
  initializeLogging,
  logClaudeMetrics,
  logClaudeOperation,
  logErrorAnalysis,
} from '../../src/utils/logging-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

export class GeminiAIIntegration {
  constructor() {
    this.fixedCount = 0;
    this.failedCount = 0;
    this.skippedCount = 0;
    this.todoCount = 0;
    this.todoItems = [];
    this.logger = null;
    this.geminiLogger = null;
    this.initialized = false;
  }

  /**
   * Initialize logging system
   */
  async initializeLogging() {
    if (this.initialized) return;

    try {
      await initializeLogging();
      this.logger = createClaudeAILogger(); // Reuse existing logger
      this.geminiLogger = createClaudeCLILogger(); // For gemini operations
      this.initialized = true;

      this.logger.info('Gemini AI Integration initialized with structured logging');
    } catch (error) {
      console.error('Failed to initialize logging:', error.message);
      // Fallback to console logging
      this.logger = {
        info: console.log,
        debug: console.log,
        warn: console.warn,
        error: console.error,
      };
      this.geminiLogger = this.logger;
    }
  }

  /**
   * Fix violations using real Claude CLI - grouped by file for efficiency
   */
  async fixViolations(violations, options = {}) {
    await this.initializeLogging();

    this.logger.info(`🤖 Starting REAL Gemini AI fixing for ${violations.length} violations...`);
    console.log(`🤖 Starting REAL Gemini AI fixing for ${violations.length} violations...`);

    // Log operation start with structured data
    if (this.logger && this.initialized) {
      logClaudeOperation(this.logger, 'gemini_fix_violations_start', {
        totalViolations: violations.length,
        options,
      });
    }
    console.log(`   🔧 Starting violation fixing - ${violations.length} total violations`);
    console.log(`   ⚙️  Options:`, options);

    const { maxFixes = 50, dryRun = false } = options;
    const prioritizedViolations = this.prioritizeViolations(violations).slice(0, maxFixes);

    // Group violations by file for efficient batching
    const violationsByFile = this.groupViolationsByFile(prioritizedViolations);

    console.log(
      `🎯 Processing ${prioritizedViolations.length} violations across ${violationsByFile.size} files...`
    );

    let fileIndex = 0;
    for (const [filePath, fileViolations] of violationsByFile.entries()) {
      fileIndex++;
      const progress = ((fileIndex / violationsByFile.size) * 100).toFixed(1);
      console.log(`\n📝 Fixing file ${fileIndex}/${violationsByFile.size} (${progress}%)`);
      console.log(`   📁 File: ${path.basename(filePath)} (${fileViolations.length} violations)`);

      try {
        // Log detailed error analysis with structured data
        if (this.logger && this.initialized) {
          logErrorAnalysis(
            this.logger,
            filePath,
            fileViolations,
            this.categorizeViolations(fileViolations)
          );
        }
        console.log(
          `   📊 Analysis: ${fileViolations.length} violations in ${path.basename(filePath)}`
        );

        const fixed = await this.fixFileViolations(filePath, fileViolations, dryRun);
        if (fixed) {
          this.fixedCount += fileViolations.length;
          console.log(`   ✅ Fixed ${fileViolations.length} violations successfully`);
          this.logger.info(
            `Fixed ${fileViolations.length} violations in ${path.basename(filePath)}`,
            {
              filePath,
              violationCount: fileViolations.length,
              violationTypes: fileViolations.map((v) => v.rule),
            }
          );
        } else {
          this.skippedCount += fileViolations.length;
          console.log(`   ⏭️  Skipped (no changes needed)`);
          this.logger.debug(`Skipped file - no changes needed`, { filePath });
        }

        // Prevent overwhelming Gemini API
        await this.sleep(3000);
      } catch (error) {
        // ✅ ENHANCED: Mark as TODO instead of failing completely
        this.logger.error(`Error fixing file ${filePath}`, {
          filePath,
          error: error.message,
          violationCount: fileViolations.length,
          violationTypes: fileViolations.map((v) => v.rule),
        });

        const todoMarked = this.markAsTodo(filePath, fileViolations, error.message);
        if (todoMarked) {
          this.todoCount += fileViolations.length;
          console.log(`   📝 TODO: ${error.message}`);
        } else {
          this.failedCount += fileViolations.length;
          console.log(`   ❌ Failed: ${error.message}`);
        }
      }
    }

    const results = {
      fixed: this.fixedCount,
      skipped: this.skippedCount,
      failed: this.failedCount,
      todo: this.todoCount,
    };

    console.log(`\n🎊 File-based AI Fixing Complete:`);
    console.log(`   ✅ Fixed: ${this.fixedCount} violations`);
    console.log(`   ⏭️  Skipped: ${this.skippedCount} violations`);
    console.log(`   ❌ Failed: ${this.failedCount} violations`);
    console.log(`   📝 TODO: ${this.todoCount} violations`);

    // Log completion results with structured data
    if (this.logger && this.initialized) {
      logClaudeOperation(this.logger, 'gemini_fix_violations_complete', results);
    }
    console.log(`   🎊 Completion results:`, results);

    return results;
  }

  /**
   * Group violations by file path for efficient batching
   */
  groupViolationsByFile(violations) {
    const violationsByFile = new Map();

    for (const violation of violations) {
      if (!violationsByFile.has(violation.file)) {
        violationsByFile.set(violation.file, []);
      }
      violationsByFile.get(violation.file).push(violation);
    }

    return violationsByFile;
  }

  /**
   * Fix all violations in a single file with one Claude call
   */
  async fixFileViolations(filePath, violations, dryRun = false) {
    const prompt = this.buildFilePrompt(violations);
    const relativePath = path.relative(REPO_ROOT, filePath);

    console.log(
      `   📝 Fixing ${violations.length} violations: ${violations.map((v) => v.rule).join(', ')}`
    );
    console.log(`   📁 File: ${relativePath}`);

    // Read original content for comparison
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const originalModTime = fs.statSync(filePath).mtime;

    try {
      if (dryRun) {
        console.log(`   🔍 DRY RUN: Would call Gemini CLI to fix ${violations.length} violations`);
        return false;
      }

      // Gemini uses tools directly to read, fix all issues, and write the file
      await this.callGeminiCLI(relativePath, prompt);

      // Check if file was actually modified
      const newModTime = fs.statSync(filePath).mtime;
      const fileWasModified = newModTime > originalModTime;

      if (fileWasModified) {
        const updatedContent = fs.readFileSync(filePath, 'utf8');
        if (updatedContent !== originalContent) {
          console.log(`   🔄 Gemini fixed the file (${updatedContent.length} chars)`);
          console.log(`   💾 File updated by Gemini`);
          return true;
        }
      }

      console.log(`   ⏭️  No changes made by Gemini`);
      return false;
    } catch (error) {
      throw new Error(`Gemini CLI failed: ${error.message}`);
    }
  }

  /**
   * Fix a single violation using Claude CLI (tool-based approach)
   */
  async fixSingleViolation(violation, dryRun = false) {
    const prompt = this.buildPromptForViolation(violation);

    // Convert absolute path to relative for Claude CLI
    const relativePath = path.relative(REPO_ROOT, violation.file);

    console.log(`   📝 Instruction: "${prompt.split('\n')[0]}..."`);
    console.log(`   📁 File: ${relativePath}`);

    // Read original content for comparison
    const originalContent = fs.readFileSync(violation.file, 'utf8');
    const originalModTime = fs.statSync(violation.file).mtime;

    try {
      if (dryRun) {
        console.log(`   🔍 DRY RUN: Would call Claude CLI to fix file`);
        return false;
      }

      // Gemini uses tools directly to read, fix, and write the file
      await this.callGeminiCLI(relativePath, prompt);

      // Check if file was actually modified by reading it and comparing timestamps
      const newModTime = fs.statSync(violation.file).mtime;
      const fileWasModified = newModTime > originalModTime;

      if (fileWasModified) {
        const updatedContent = fs.readFileSync(violation.file, 'utf8');
        if (updatedContent !== originalContent) {
          console.log(`   🔄 Gemini fixed the file (${updatedContent.length} chars)`);
          console.log(`   💾 File updated by Gemini`);
          return true;
        }
      }

      console.log(`   ⏭️  No changes made by Gemini`);
      return false;
    } catch (error) {
      throw new Error(`Gemini CLI failed: ${error.message}`);
    }
  }

  /**
   * Call Gemini CLI with file fixing (Gemini handles files directly)
   */
  async callGeminiCLI(filePath, prompt) {
    // Ensure logging is initialized for direct callGeminiCLI calls
    await this.initializeLogging();
    const instruction = `${prompt}

File to fix: ${filePath}

Please read the file, apply the ESLint fixes described above, and write the corrected file back.

Focus on fixing the specific ESLint violations while maintaining the existing code structure and functionality.`;

    console.log(`   🤖 Calling NATIVE Gemini CLI to fix: ${filePath}`);
    console.log(`   📋 Full instruction: "${instruction.slice(0, 200)}..."`);

    // Log Gemini operation start with structured data including full prompt
    if (this.geminiLogger && this.initialized) {
      logClaudeOperation(this.geminiLogger, 'gemini_cli_start', {
        filePath,
        promptLength: prompt.length,
        instructionLength: instruction.length,
        command: 'file_fix',
        fullPrompt: prompt,
        fullInstruction: instruction,
      });
    }
    console.log(`   🔧 Starting Gemini CLI with prompt length: ${prompt.length} chars`);

    return new Promise((resolve, reject) => {
      const gemini = spawn(
        'gemini',
        [
          '-y', // yolo mode - automatically accept all actions
          '-m',
          'gemini-2.5-flash', // model
          '-p',
          instruction, // prompt
        ],
        {
          stdio: ['pipe', 'pipe', 'pipe'],
          cwd: REPO_ROOT, // Ensure repo root for file access
          env: {
            ...process.env,
            GOOGLE_CLOUD_PROJECT: 'singularity-460212', // From existing script
          },
        }
      );

      // Ensure logs directory exists for any remaining file operations
      const logsDir = path.join(REPO_ROOT, 'logs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      const sessionId = `gemini-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const fileName = path.basename(filePath);

      // Log session start with structured data
      if (this.geminiLogger && this.initialized) {
        logClaudeOperation(this.geminiLogger, 'gemini_session_start', {
          sessionId,
          fileName,
          filePath,
          timeoutMinutes: 5, // Fixed 5 minute timeout for Gemini
        });
      }
      console.log(`   📊 Gemini CLI session started: ${sessionId} for ${fileName}`);

      let stdout = '';
      let stderr = '';
      let timeoutHandle;

      // Dynamic inactivity timeout based on complexity - resets on any output
      const resetTimeout = () => {
        if (timeoutHandle) clearTimeout(timeoutHandle);

        // Fixed 5 minute timeout for Gemini operations
        const totalTimeout = 300000; // 5 minutes

        timeoutHandle = setTimeout(() => {
          console.log(`   ⏰ Gemini CLI timeout (5 minutes)`);
          gemini.kill('SIGTERM');
          reject(new Error(`Gemini CLI timeout after 5 minutes`));
        }, totalTimeout);
      };

      gemini.stdout.on('data', (data) => {
        const chunk = data.toString();
        stdout += chunk;
        resetTimeout(); // Reset timeout on output

        // Log stdout received with structured data
        if (this.geminiLogger && this.initialized) {
          logClaudeOperation(this.geminiLogger, 'gemini_stdout_received', {
            sessionId,
            chunkLength: chunk.length,
            fileName,
            rawContent: chunk.trim(),
          });
        }
        console.log(`   📥 Gemini stdout: ${chunk.length} chars received (session: ${sessionId})`);

        if (chunk.length > 50) {
          console.log(`   🧠 Gemini: Working... (${chunk.length} chars received)`);
        }
      });

      gemini.stderr.on('data', (data) => {
        const chunk = data.toString();
        stderr += chunk;

        // Log stderr received with structured data
        resetTimeout(); // Reset timeout on stderr
        if (this.geminiLogger && this.initialized) {
          logClaudeOperation(this.geminiLogger, 'gemini_stderr_received', {
            sessionId,
            stderrContent: chunk.trim(),
            fileName,
          });
        }
        console.log(`   📢 Gemini stderr: ${chunk.trim()}`);
      });

      gemini.on('close', (code) => {
        if (timeoutHandle) clearTimeout(timeoutHandle);
        const endTime = Date.now();
        console.log(`   🏁 Gemini CLI finished (exit code: ${code})`);

        // Log Gemini completion metrics
        const metrics = {
          sessionId,
          fileName,
          exitCode: code,
          stdoutLength: stdout.length,
          stderrLength: stderr.length,
          geminiOutput: stdout.trim() || 'No output',
          geminiErrors: stderr.trim() || 'No errors',
        };

        // Log Gemini metrics with structured data
        if (this.geminiLogger && this.initialized) {
          logClaudeMetrics(this.geminiLogger, metrics);

          // Also log Gemini's final output separately for easy analysis
          logClaudeOperation(this.geminiLogger, 'gemini_final_output', {
            sessionId,
            fileName,
            output: stdout.trim(),
            errors: stderr.trim(),
          });
        }
        console.log(`   📊 Gemini session complete - Exit code: ${code}`);

        if (stdout.length > 0) {
          console.log(
            `   📤 Gemini output: "${stdout.slice(0, 200)}${stdout.length > 200 ? '...' : ''}"`
          );
        }

        if (stderr.length > 0) {
          console.log(`   ⚠️  Gemini stderr: ${stderr.trim()}`);
        }

        // Log session completion with structured data
        if (this.geminiLogger && this.initialized) {
          logClaudeOperation(this.geminiLogger, 'gemini_session_complete', {
            sessionId,
            fileName,
            exitCode: code,
            stdoutLength: stdout.length,
            stderrLength: stderr.length,
          });
        }
        console.log(
          `   🏁 Gemini CLI session completed - Session: ${sessionId}, Exit code: ${code}`
        );

        if (code === 0) {
          // Gemini completed successfully
          resolve('SUCCESS');
        } else {
          reject(new Error(`Gemini CLI exited with code ${code}: ${stderr}`));
        }
      });

      gemini.on('error', (error) => {
        if (timeoutHandle) clearTimeout(timeoutHandle);
        reject(new Error(`Failed to spawn Gemini CLI: ${error.message}`));
      });

      // No stdin needed - Gemini handles file operations directly
      gemini.stdin.end();

      // Start inactivity timeout
      resetTimeout();
    });
  }

  /**
   * Build combined prompt for multiple violations in the same file
   */
  buildFilePrompt(violations) {
    const filePath = violations[0].file;
    const fileName = path.basename(filePath);

    let prompt = `Fix multiple ESLint violations in ${fileName}:\n\n`;

    violations.forEach((violation, index) => {
      prompt += `${index + 1}. Line ${violation.line}: ${violation.rule}\n`;
      prompt += `   Issue: ${violation.message}\n`;

      const specificFix = this.getSpecificFix(violation);
      if (specificFix) {
        prompt += `   Fix: ${specificFix}\n`;
      }
      prompt += `\n`;
    });

    prompt += `Please read the file: ${path.relative(REPO_ROOT, filePath)}\n`;
    prompt += `Fix ALL ${violations.length} violations listed above\n`;
    prompt += `Write the corrected file back\n\n`;
    prompt += `Focus on maintaining existing code structure while fixing the ESLint issues.`;

    return prompt;
  }

  /**
   * Get specific fix instruction for a violation type
   */
  getSpecificFix(violation) {
    const specificFixes = {
      'jsdoc/require-file-overview':
        'Add a proper @fileoverview JSDoc comment at the top of the file.',
      'jsdoc/require-description-complete-sentence':
        'Make JSDoc description a complete sentence ending with a period.',
      'jsdoc/require-param-description':
        'Add proper JSDoc @param descriptions that are complete sentences.',
      'jsdoc/require-returns-description':
        'Add a proper JSDoc @returns description ending with a period.',
      'jsdoc/require-example': 'Add a JSDoc @example section showing practical usage.',
      '@typescript-eslint/no-explicit-any':
        'Replace the "any" type with a more specific TypeScript type.',
      'prefer-const': 'Change "let" to "const" since the variable is never reassigned.',
      'no-var': 'Replace "var" with "const" or "let" following modern ES6+ practices.',
    };

    return specificFixes[violation.rule];
  }

  /**
   * Build specific prompts for different violation types
   */
  buildPromptForViolation(violation) {
    const rulePrompts = {
      'jsdoc/require-file-overview':
        'Add a proper @fileoverview JSDoc comment at the top of this file. Make it descriptive and complete with a period.',

      'jsdoc/require-description-complete-sentence': `Fix the JSDoc description on line ${violation.line} to be a complete sentence ending with a period.`,

      'jsdoc/require-param-description': `Add proper JSDoc @param descriptions for line ${violation.line}. Make them descriptive and complete sentences.`,

      'jsdoc/require-returns-description': `Add a proper JSDoc @returns description for line ${violation.line}. Make it descriptive and end with a period.`,

      'jsdoc/require-example': `Add a JSDoc @example section for the class/interface/function around line ${violation.line}. Show practical usage.`,

      '@typescript-eslint/no-explicit-any': `Replace the 'any' type on line ${violation.line} with a more specific TypeScript type. Analyze the usage and provide the most appropriate type.`,

      'prefer-const': `Change 'let' to 'const' on line ${violation.line} since the variable is never reassigned.`,

      'no-var': `Replace 'var' with 'const' or 'let' on line ${violation.line} following modern ES6+ practices.`,
    };

    const specificPrompt = rulePrompts[violation.rule];

    if (specificPrompt) {
      return `${specificPrompt}

ESLint Rule: ${violation.rule}
Line ${violation.line}: ${violation.message}

Read the file, apply the fix, and write it back.`;
    }

    // Generic prompt for unknown rules
    return `Fix this ESLint violation:

Rule: ${violation.rule}
Line: ${violation.line}
Message: ${violation.message}

Read the file, apply the fix, and write it back.`;
  }

  /**
   * Extract code from Claude's JSON response
   */
  extractCodeFromJSONResponse(response) {
    try {
      const jsonResponse = JSON.parse(response);
      let code = jsonResponse.content || jsonResponse.message || jsonResponse.text || response;

      // Remove markdown code blocks
      code = code.replace(/```[\w]*\n?/g, '');

      // Remove any leading/trailing whitespace but preserve internal formatting
      code = code.trim();

      return code;
    } catch (error) {
      console.log(`   ⚠️  Failed to parse JSON response, using raw text`);
      return this.extractCodeFromResponse(response);
    }
  }

  /**
   * Extract code from Claude's response (remove markdown) - fallback method
   */
  extractCodeFromResponse(response) {
    // Remove markdown code blocks
    let code = response.replace(/```[\w]*\n?/g, '');

    // Remove any leading/trailing whitespace but preserve internal formatting
    code = code.trim();

    return code;
  }

  /**
   * Prioritize violations for fixing
   */
  prioritizeViolations(violations) {
    const priority = {
      // High priority - documentation and type safety
      'jsdoc/require-file-overview': 10,
      'jsdoc/require-description-complete-sentence': 9,
      '@typescript-eslint/no-explicit-any': 8,
      'jsdoc/require-param-description': 7,
      'jsdoc/require-returns-description': 6,

      // Medium priority - code quality
      'prefer-const': 5,
      'no-var': 5,
      'jsdoc/require-example': 4,

      // Lower priority - other issues
      default: 1,
    };

    return violations.sort((a, b) => {
      const aPriority = priority[a.rule] || priority.default;
      const bPriority = priority[b.rule] || priority.default;
      return bPriority - aPriority;
    });
  }

  /**
   * Categorize violations for structured logging
   */
  categorizeViolations(violations) {
    const categories = {};
    violations.forEach((violation) => {
      const category = violation.rule || 'unknown';
      categories[category] = (categories[category] || 0) + 1;
    });
    return categories;
  }

  /**
   * Mark violations as TODO (enhanced with logging)
   */
  markAsTodo(filePath, violations, reason) {
    if (this.logger) {
      this.logger.info('Marking violations as TODO', {
        filePath,
        violationCount: violations.length,
        reason,
        violationTypes: violations.map((v) => v.rule),
      });
    }

    // Add to TODO items for tracking
    this.todoItems.push({
      filePath,
      violations,
      reason,
      timestamp: new Date().toISOString(),
    });

    return true; // Successfully marked as TODO
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Test Gemini CLI availability
   */
  static async testGeminiAvailability() {
    return new Promise((resolve) => {
      const gemini = spawn('gemini', ['--version'], {
        stdio: 'pipe',
        env: {
          ...process.env,
          GOOGLE_CLOUD_PROJECT: 'singularity-460212',
        },
      });

      gemini.on('close', (code) => {
        resolve(code === 0);
      });

      gemini.on('error', () => {
        resolve(false);
      });

      setTimeout(() => {
        gemini.kill();
        resolve(false);
      }, 5000);
    });
  }
}

// Test the integration
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 Testing Gemini AI Integration...');

  GeminiAIIntegration.testGeminiAvailability().then((available) => {
    if (available) {
      console.log('✅ Gemini CLI is available and ready');
    } else {
      console.log('❌ Gemini CLI is not available or not working');
    }
  });
}
