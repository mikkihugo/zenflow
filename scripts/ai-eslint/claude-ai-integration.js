#!/usr/bin/env node

/**
 * 🤖 Real Claude AI Integration for ESLint Violations
 * Uses actual Claude CLI with stdin piping (not fake --file)
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

export class ClaudeAIIntegration {
  constructor() {
    this.fixedCount = 0;
    this.failedCount = 0;
    this.skippedCount = 0;
  }

  /**
   * Fix violations using real Claude CLI - grouped by file for efficiency
   */
  async fixViolations(violations, options = {}) {
    console.log(`🤖 Starting REAL Claude AI fixing for ${violations.length} violations...`);

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
        const fixed = await this.fixFileViolations(filePath, fileViolations, dryRun);
        if (fixed) {
          this.fixedCount += fileViolations.length;
          console.log(`   ✅ Fixed ${fileViolations.length} violations successfully`);
        } else {
          this.skippedCount += fileViolations.length;
          console.log(`   ⏭️  Skipped (no changes needed)`);
        }

        // Prevent overwhelming Claude API
        await this.sleep(3000);
      } catch (error) {
        this.failedCount += fileViolations.length;
        console.log(`   ❌ Failed: ${error.message}`);
      }
    }

    console.log(`\n🎊 File-based AI Fixing Complete:`);
    console.log(`   ✅ Fixed: ${this.fixedCount} violations`);
    console.log(`   ⏭️  Skipped: ${this.skippedCount} violations`);
    console.log(`   ❌ Failed: ${this.failedCount} violations`);

    return {
      fixed: this.fixedCount,
      skipped: this.skippedCount,
      failed: this.failedCount,
    };
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
        console.log(`   🔍 DRY RUN: Would call Claude CLI to fix ${violations.length} violations`);
        return false;
      }

      // Claude uses tools directly to read, fix all issues, and write the file
      await this.callClaudeCLI(relativePath, prompt);

      // Check if file was actually modified
      const newModTime = fs.statSync(filePath).mtime;
      const fileWasModified = newModTime > originalModTime;

      if (fileWasModified) {
        const updatedContent = fs.readFileSync(filePath, 'utf8');
        if (updatedContent !== originalContent) {
          console.log(`   🔄 Claude fixed the file (${updatedContent.length} chars)`);
          console.log(`   💾 File updated by Claude's tools`);
          return true;
        }
      }

      console.log(`   ⏭️  No changes made by Claude`);
      return false;
    } catch (error) {
      throw new Error(`Claude CLI failed: ${error.message}`);
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

      // Claude uses tools directly to read, fix, and write the file
      await this.callClaudeCLI(relativePath, prompt);

      // Check if file was actually modified by reading it and comparing timestamps
      const newModTime = fs.statSync(violation.file).mtime;
      const fileWasModified = newModTime > originalModTime;

      if (fileWasModified) {
        const updatedContent = fs.readFileSync(violation.file, 'utf8');
        if (updatedContent !== originalContent) {
          console.log(`   🔄 Claude fixed the file (${updatedContent.length} chars)`);
          console.log(`   💾 File updated by Claude's tools`);
          return true;
        }
      }

      console.log(`   ⏭️  No changes made by Claude`);
      return false;
    } catch (error) {
      throw new Error(`Claude CLI failed: ${error.message}`);
    }
  }

  /**
   * Call Claude CLI with tool-based file fixing (Claude uses Read/Write tools directly)
   */
  async callClaudeCLI(filePath, prompt) {
    const instruction = `${prompt}

File to fix: ${filePath}

Please use your Read and Write tools to:
1. Read the file: ${filePath}
2. Apply the ESLint fix described above
3. Write the corrected file back

Use your tools directly - do not return code in your response. Just fix the file and confirm it's done.`;

    console.log(`   🤖 Calling NATIVE Claude CLI to fix: ${filePath}`);
    console.log(`   📋 Full instruction: "${instruction.slice(0, 200)}..."`);

    return new Promise((resolve, reject) => {
      // Use full path instead of shell expansion
      const claudePath = '/home/mhugo/.local/share/mise/shims/claude';

      const claude = spawn(
        claudePath,
        [
          '--model',
          'sonnet',
          '--print',
          '--output-format',
          'json',
          '--dangerously-skip-permissions',
          instruction,
        ],
        {
          stdio: 'pipe',
          cwd: REPO_ROOT, // Ensure repo root for file access
          // No shell: true to avoid command interpretation
        }
      );

      let stdout = '';
      let stderr = '';
      let timeoutHandle;

      // Inactivity timeout - resets on any output
      const resetTimeout = () => {
        if (timeoutHandle) clearTimeout(timeoutHandle);
        timeoutHandle = setTimeout(() => {
          console.log(`   ⏰ Claude CLI inactivity timeout (5 minutes)`);
          claude.kill('SIGTERM');
          reject(new Error('Claude CLI inactivity timeout'));
        }, 300000); // 5 minutes of inactivity
      };

      claude.stdout.on('data', (data) => {
        const chunk = data.toString();
        stdout += chunk;
        resetTimeout(); // Reset timeout on output

        if (chunk.length > 50) {
          console.log(`   🧠 Claude: Working... (${chunk.length} chars received)`);
        }
      });

      claude.stderr.on('data', (data) => {
        const chunk = data.toString();
        stderr += chunk;
        resetTimeout(); // Reset timeout on stderr
        console.log(`   📢 Claude stderr: ${chunk.trim()}`);
      });

      claude.on('close', (code) => {
        if (timeoutHandle) clearTimeout(timeoutHandle);
        console.log(`   🏁 Claude CLI finished (exit code: ${code})`);

        // Parse and show Claude's JSON response with useful details
        if (stdout.length > 0) {
          try {
            const response = JSON.parse(stdout);
            if (response.type === 'result' && response.subtype === 'success') {
              console.log(`   ✅ Claude completed successfully:`);
              console.log(
                `   ⏱️  Duration: ${response.duration_ms}ms (${response.num_turns} turns)`
              );
              console.log(`   📝 Action: ${response.result}`);
              if (response.total_cost_usd) {
                console.log(`   💰 Cost: $${response.total_cost_usd.toFixed(4)}`);
              }
            } else {
              console.log(
                `   📤 Claude response: ${response.result || response.message || 'Unknown result'}`
              );
            }
          } catch (parseError) {
            // Fallback to showing raw output if JSON parsing fails
            console.log(`   📤 Claude stdout (${stdout.length} chars):`);
            console.log(`   💬 "${stdout.slice(0, 300)}${stdout.length > 300 ? '...' : ''}"`);
          }
        }
        if (stderr.length > 0) {
          console.log(`   ⚠️  Claude stderr: ${stderr.trim()}`);
        }

        if (code === 0) {
          // Claude used tools directly - we don't need to return anything
          resolve('SUCCESS');
        } else {
          reject(new Error(`Claude CLI exited with code ${code}: ${stderr}`));
        }
      });

      claude.on('error', (error) => {
        if (timeoutHandle) clearTimeout(timeoutHandle);
        reject(new Error(`Failed to spawn Claude CLI: ${error.message}`));
      });

      // No stdin needed - Claude reads the file itself!
      claude.stdin.end();

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

    prompt += `Please use your Read and Write tools to:\n`;
    prompt += `1. Read the file: ${path.relative(REPO_ROOT, filePath)}\n`;
    prompt += `2. Fix ALL ${violations.length} violations listed above\n`;
    prompt += `3. Write the corrected file back\n\n`;
    prompt += `Use your tools directly - do not return code in your response. Just fix all issues and confirm they're done.`;

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

Use your Read and Write tools to fix this directly.`;
    }

    // Generic prompt for unknown rules
    return `Fix this ESLint violation:

Rule: ${violation.rule}
Line: ${violation.line}
Message: ${violation.message}

Use your Read and Write tools to fix this directly.`;
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
   * Sleep utility
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Test Claude CLI availability
   */
  static async testClaudeAvailability() {
    return new Promise((resolve) => {
      const claude = spawn(
        '/home/mhugo/.local/share/mise/shims/claude',
        ['--model', 'sonnet', '--version'],
        {
          stdio: 'pipe',
          // No shell needed with full path
        }
      );

      claude.on('close', (code) => {
        resolve(code === 0);
      });

      claude.on('error', () => {
        resolve(false);
      });

      setTimeout(() => {
        claude.kill();
        resolve(false);
      }, 5000);
    });
  }
}

// Test the integration
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 Testing Claude AI Integration...');

  ClaudeAIIntegration.testClaudeAvailability().then((available) => {
    if (available) {
      console.log('✅ Claude CLI is available and ready');
    } else {
      console.log('❌ Claude CLI is not available or not working');
    }
  });
}
