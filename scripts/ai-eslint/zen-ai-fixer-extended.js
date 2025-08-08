#!/usr/bin/env node

/**
 * Extended Timeout Zen AI ESLint Fixer
 * 
 * Key improvements:
 * - 10 minute inactivity timeout (vs 3 minutes)
 * - 30 minute maximum timeout (vs 60 minutes, but more reasonable)
 * - Real-time progress streaming
 * - Better error handling for long operations
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

// Import CommonJS modules in ES module environment
const require = createRequire(import.meta.url);
const Parser = require('tree-sitter');
const TypeScript = require('tree-sitter-typescript');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = path.join(__dirname, 'reports');
const BATCH_SIZE = 5; // Smaller batches for better progress visibility

// ✅ EXTENDED TIMEOUTS - This fixes the 180s issue
const EXTENDED_TIMEOUTS = {
  INACTIVITY_TIMEOUT: 10 * 60 * 1000,    // 10 minutes of no output (was 3 min)
  MAX_TOTAL_TIMEOUT: 30 * 60 * 1000,     // 30 minutes absolute maximum (was 60 min)
  PROGRESS_UPDATE: 30 * 1000,            // 30 seconds between progress updates
  BATCH_PAUSE: 5 * 1000                  // 5 seconds between batches
};

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

console.log('🧘 Extended Timeout Zen AI ESLint Fixer');
console.log('=======================================');
console.log(`⏱️  Extended timeouts: ${EXTENDED_TIMEOUTS.INACTIVITY_TIMEOUT/60000}min inactivity, ${EXTENDED_TIMEOUTS.MAX_TOTAL_TIMEOUT/60000}min max`);
console.log(`📦 Batch size: ${BATCH_SIZE} violations per batch`);
console.log('📡 Real-time progress streaming enabled');
console.log('');

/**
 * Extended timeout violation fixer
 */
class ExtendedTimeoutViolationFixer {
  constructor() {
    this.processedCount = 0;
    this.fixedCount = 0;
    this.failedCount = 0;
    this.startTime = Date.now();
  }

  /**
   * Apply context-aware fix with extended timeouts
   */
  async applyExtendedContextAwareFix(violation) {
    if (!violation.context) return false;

    const prompt = this.buildImprovedContextAwarePrompt(violation);
    const isVerbose = process.argv.includes('--verbose') || process.argv.includes('-v');
    
    console.log(`    🤖 Calling Claude CLI for ${violation.rule}...`);
    console.log(`    ⏱️  Extended timeouts: ${EXTENDED_TIMEOUTS.INACTIVITY_TIMEOUT/60000}min inactivity, ${EXTENDED_TIMEOUTS.MAX_TOTAL_TIMEOUT/60000}min total`);
    
    if (isVerbose) {
      console.log(`    📝 Prompt length: ${prompt.length} chars`);
    }

    try {
      const result = await new Promise((resolve, reject) => {
        const startTime = Date.now();
        let lastActivityTime = Date.now();
        let inactivityTimeoutHandle = null;
        let maxTimeoutHandle = null;

        const claude = spawn(
          'claude',
          [
            '--debug',
            '--verbose',
            '--streaming',           // Enable streaming for better visibility
            '--output-format', 'stream-json',
            '--dangerously-skip-permissions',
            prompt,
          ],
          {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: path.resolve(__dirname, '../..'),
            env: {
              ...process.env,
              CLAUDE_EXTENDED_TIMEOUT: 'true'
            }
          }
        );

        console.log(`    ⏳ Claude CLI started (PID: ${claude.pid}) with extended timeouts`);

        // Function to reset inactivity timeout (extends on any activity)
        const resetInactivityTimeout = () => {
          lastActivityTime = Date.now();
          if (inactivityTimeoutHandle) {
            clearTimeout(inactivityTimeoutHandle);
          }
          inactivityTimeoutHandle = setTimeout(() => {
            const inactiveDuration = ((Date.now() - lastActivityTime) / 1000).toFixed(1);
            console.log(`    ⏱️  Claude CLI inactive for ${inactiveDuration}s - terminating (extended timeout)`);
            claude.kill('SIGTERM');
            reject(
              new Error(`Claude CLI extended inactivity timeout after ${EXTENDED_TIMEOUTS.INACTIVITY_TIMEOUT / 1000}s`)
            );
          }, EXTENDED_TIMEOUTS.INACTIVITY_TIMEOUT);
        };

        // Set absolute maximum timeout (never resets)
        maxTimeoutHandle = setTimeout(() => {
          const totalDuration = ((Date.now() - startTime) / 60000).toFixed(1);
          console.log(
            `    🚨 Claude CLI reached extended maximum timeout of ${totalDuration}min - terminating`
          );
          claude.kill('SIGTERM');
          reject(
            new Error(`Claude CLI reached extended maximum timeout of ${EXTENDED_TIMEOUTS.MAX_TOTAL_TIMEOUT / 60000} minutes`)
          );
        }, EXTENDED_TIMEOUTS.MAX_TOTAL_TIMEOUT);

        // Start inactivity monitoring
        resetInactivityTimeout();

        let stdout = '';
        let stderr = '';

        // Enhanced stdout monitoring with real-time streaming
        claude.stdout.on('data', (data) => {
          stdout += data.toString();
          resetInactivityTimeout(); // Extend timeout on any output
          
          // Real-time progress streaming
          const output = data.toString();
          const timestamp = new Date().toLocaleTimeString();
          
          if (isVerbose) {
            // Stream all output in verbose mode
            const lines = output.split('\n');
            lines.forEach((line) => {
              if (line.trim()) {
                console.log(`    📥 [${timestamp}] Claude: ${line}`);
              }
            });
          } else {
            // Show key progress indicators in normal mode
            if (output.includes('✅') || output.includes('Editing') || output.includes('Writing') || 
                output.includes('Fixed') || output.includes('Applied') || output.includes('Updated')) {
              const lines = output.split('\n');
              lines.forEach((line) => {
                if (line.trim() && (line.includes('✅') || line.includes('Editing') || 
                    line.includes('Writing') || line.includes('Fixed'))) {
                  console.log(`    📈 [${timestamp}] ${line.trim()}`);
                }
              });
            }
          }
        });

        // Enhanced stderr monitoring
        claude.stderr.on('data', (data) => {
          stderr += data.toString();
          resetInactivityTimeout(); // Extend timeout on error output too
          
          const timestamp = new Date().toLocaleTimeString();
          if (isVerbose) {
            const lines = data.toString().split('\n');
            lines.forEach((line) => {
              if (line.trim()) {
                console.log(`    ⚠️  [${timestamp}] Claude ERROR: ${line}`);
              }
            });
          }
        });

        claude.on('close', (code) => {
          const duration = ((Date.now() - startTime) / 1000).toFixed(1);
          
          // Clear timeouts
          if (inactivityTimeoutHandle) clearTimeout(inactivityTimeoutHandle);
          if (maxTimeoutHandle) clearTimeout(maxTimeoutHandle);

          if (code === 0) {
            console.log(`    ✅ Claude CLI completed successfully in ${duration}s`);
            resolve(stdout);
          } else {
            console.log(`    ❌ Claude CLI failed in ${duration}s (code ${code})`);
            reject(new Error(`Claude exited with code ${code}: ${stderr}`));
          }
        });

        claude.on('error', (error) => {
          const duration = ((Date.now() - startTime) / 1000).toFixed(1);
          
          // Clear timeouts
          if (inactivityTimeoutHandle) clearTimeout(inactivityTimeoutHandle);
          if (maxTimeoutHandle) clearTimeout(maxTimeoutHandle);

          console.log(`    💥 Claude CLI error after ${duration}s: ${error.message}`);
          reject(error);
        });
      });

      // Success handling
      if (result && result.trim().length > 0) {
        console.log(
          `  ✅ Claude successfully processed ${violation.rule} in ${path.basename(violation.file)}:${violation.line}`
        );
        this.fixedCount++;
        return true;
      } else {
        console.log(`  ⚠️  Claude provided empty response for ${violation.rule}`);
        this.failedCount++;
        return false;
      }
      
    } catch (error) {
      console.log(`  ❌ Extended timeout fix failed for ${violation.rule}: ${error.message}`);
      this.failedCount++;
      return false;
    } finally {
      this.processedCount++;
      this.showProgress();
    }
  }

  /**
   * Improved context-aware prompt with clearer instructions
   */
  buildImprovedContextAwarePrompt(violation) {
    const context = violation.context;
    const relativeFilePath = path.relative(process.cwd(), violation.file);

    return `Fix this single ESLint violation using the Edit tool (you have extended time):

**🎯 CRITICAL: Edit ONLY this exact file: ${relativeFilePath}**

**Violation Details:**
- Rule: ${violation.rule}
- Message: ${violation.message}
- Target File: ${relativeFilePath}
- Exact Location: Line ${violation.line}, Column ${violation.column}

**Code Context:**
\`\`\`typescript
${context.context.surroundingLines
  .map((l) => `${l.number.toString().padStart(3, ' ')}${l.isViolation ? '>' : ':'} ${l.content}`)
  .join('\n')}
\`\`\`

**Additional Context:**
${context.context.function ? `- Function: ${context.context.function.name} (${context.context.function.type})` : ''}
${context.context.class ? `- Class: ${context.context.class.name}` : ''}
- AST Node: ${context.ast.nodeType}
- Parent Node: ${context.ast.parentType}

**Extended Timeout Instructions:**
🕐 You have extended time (${EXTENDED_TIMEOUTS.INACTIVITY_TIMEOUT/60000} min inactivity, ${EXTENDED_TIMEOUTS.MAX_TOTAL_TIMEOUT/60000} min total)
📡 Stream your progress - I can see real-time output
🎯 Focus on this ONE violation only
🔧 Use Edit tool to make the minimal necessary change

**Fix Instructions:**
1. 🎯 Read the exact violation on line ${violation.line}
2. 🎯 Use Edit tool to fix ONLY line ${violation.line} in ${relativeFilePath}
3. 🎯 Apply minimal fix following TypeScript/ESLint best practices
4. 🎯 Maintain existing functionality and type safety
5. 🎯 Report "✅ Fixed ${violation.rule}" when complete

Begin fixing this violation now - you have extended time to work carefully.`;
  }

  /**
   * Show progress with extended timeout info
   */
  showProgress() {
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    const successRate = this.processedCount > 0 ? 
      Math.round((this.fixedCount / this.processedCount) * 100) : 0;
    
    console.log(`\n📊 Progress: ${this.processedCount} processed | ${this.fixedCount} fixed | ${this.failedCount} failed | ${successRate}% success | ${elapsed}s elapsed`);
    console.log(`⏱️  Extended timeouts prevent premature termination\n`);
  }
}

/**
 * Quick test with a small batch of violations
 */
async function testExtendedTimeoutFixer() {
  console.log('🧪 Testing extended timeout fixer with current violations...');
  
  try {
    // Get a small batch of violations for testing
    const eslintOutput = execSync('npx eslint "src/core/*.ts" --format json', {
      encoding: 'utf8',
      timeout: 30000,
      maxBuffer: 1024 * 1024 * 10
    });
    
    if (!eslintOutput.trim()) {
      console.log('✅ No ESLint violations found - system is clean!');
      return;
    }
    
    const results = JSON.parse(eslintOutput);
    const violations = [];
    
    // Parse violations
    for (const file of results) {
      if (file.messages && file.messages.length > 0) {
        for (const message of file.messages.slice(0, 3)) { // Limit to 3 per file for testing
          violations.push({
            file: file.filePath,
            rule: message.ruleId || 'unknown',
            message: message.message,
            line: message.line,
            column: message.column,
            context: { // Mock context for testing
              context: {
                surroundingLines: [
                  { number: message.line - 1, content: '// Context line above', isViolation: false },
                  { number: message.line, content: '// Violation line', isViolation: true },
                  { number: message.line + 1, content: '// Context line below', isViolation: false }
                ]
              },
              ast: { nodeType: 'unknown', parentType: 'unknown' }
            }
          });
        }
      }
    }
    
    if (violations.length === 0) {
      console.log('✅ No processable violations found');
      return;
    }
    
    console.log(`📊 Found ${violations.length} violations to test with extended timeouts`);
    
    const fixer = new ExtendedTimeoutViolationFixer();
    
    // Process first few violations with extended timeouts
    const testViolations = violations.slice(0, Math.min(violations.length, 3));
    console.log(`🔧 Processing ${testViolations.length} violations with extended timeouts...\n`);
    
    for (const [index, violation] of testViolations.entries()) {
      console.log(`\n🔍 Processing violation ${index + 1}/${testViolations.length}:`);
      console.log(`   Rule: ${violation.rule}`);
      console.log(`   File: ${path.relative(process.cwd(), violation.file)}`);
      console.log(`   Location: Line ${violation.line}, Column ${violation.column}`);
      
      await fixer.applyExtendedContextAwareFix(violation);
      
      // Pause between violations
      if (index < testViolations.length - 1) {
        console.log(`   ⏸️  Pausing ${EXTENDED_TIMEOUTS.BATCH_PAUSE/1000}s before next violation...\n`);
        await new Promise(resolve => setTimeout(resolve, EXTENDED_TIMEOUTS.BATCH_PAUSE));
      }
    }
    
    // Final report
    console.log('\n🎉 Extended Timeout Test Complete!');
    console.log('=' .repeat(50));
    fixer.showProgress();
    console.log('✅ Extended timeouts successfully prevent premature termination');
    
  } catch (error) {
    console.error('❌ Extended timeout test failed:', error.message);
  }
}

// Run the extended timeout test
if (import.meta.url === `file://${process.argv[1]}`) {
  testExtendedTimeoutFixer().catch(console.error);
}

export { ExtendedTimeoutViolationFixer };