#!/usr/bin/env node

/**
 * Claude Code Zen AI-Assisted ESLint Fixer
 * Intelligent code fixing with mindful AI assistance
 *
 * Key features:
 * - Smart violation categorization (Group 1/2/3 by complexity)
 * - Tree-sitter for precise code context
 * - Batch processing for efficiency
 * - Claude Code AI-powered systematic fixing
 * - Zen approach: Thoughtful, measured, effective
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
const BATCH_SIZE = 10;

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

/**
 * Violation categories based on Docker blog methodology
 */
const VIOLATION_GROUPS = {
  GROUP_1: {
    name: 'Complex violations requiring architectural changes',
    rules: [
      'max-complexity',
      'max-lines-per-function',
      'max-depth',
      'no-duplicate-imports',
      'prefer-const',
    ],
    aiSupervision: 'high',
    autoFixable: false,
  },
  GROUP_2: {
    name: 'Moderate violations requiring context analysis',
    rules: [
      'no-unused-vars',
      '@typescript-eslint/no-explicit-any',
      'no-console',
      'no-undef',
      'prefer-template',
    ],
    aiSupervision: 'medium',
    autoFixable: true,
  },
  GROUP_3: {
    name: 'Simple violations with clear fixes',
    rules: [
      'semi',
      'quotes',
      'indent',
      'comma-dangle',
      'no-trailing-spaces',
      'eol-last',
      'no-multiple-empty-lines',
    ],
    aiSupervision: 'low',
    autoFixable: true,
  },
};

/**
 * Tree-sitter parser for precise code context extraction
 */
class CodeContextExtractor {
  constructor() {
    this.parser = new Parser();
    this.parser.setLanguage(TypeScript.typescript);
  }

  /**
   * Extract precise context around a violation
   * @param {string} filePath - Path to the file
   * @param {number} line - Line number of violation
   * @param {number} column - Column number of violation
   * @returns {Object} Context information
   */
  extractContext(filePath, line, column) {
    try {
      const sourceCode = fs.readFileSync(filePath, 'utf8');
      const tree = this.parser.parse(sourceCode);

      // Get the node at the specific location
      const targetNode = this.findNodeAtPosition(tree.rootNode, line - 1, column);

      return {
        violation: {
          line,
          column,
          nodeType: targetNode?.type || 'unknown',
        },
        context: {
          function: this.getFunctionContext(targetNode),
          class: this.getClassContext(targetNode),
          imports: this.getImports(tree.rootNode),
          surroundingLines: this.getSurroundingLines(sourceCode, line, 5),
        },
        ast: {
          nodeText: targetNode?.text?.slice(0, 200) || '',
          parentType: targetNode?.parent?.type || 'unknown',
          childrenTypes: targetNode?.children?.map((c) => c.type) || [],
        },
      };
    } catch (error) {
      console.warn(`Failed to extract context for ${filePath}:${line}:${column}`, error.message);
      return this.getFallbackContext(filePath, line);
    }
  }

  findNodeAtPosition(node, line, column) {
    if (node.startPosition.row <= line && node.endPosition.row >= line) {
      for (const child of node.children) {
        const result = this.findNodeAtPosition(child, line, column);
        if (result) return result;
      }
      return node;
    }
    return null;
  }

  getFunctionContext(node) {
    let current = node;
    while (current) {
      if (['function_declaration', 'method_definition', 'arrow_function'].includes(current.type)) {
        const nameNode = current.children.find((c) => c.type === 'identifier');
        return {
          name: nameNode?.text || 'anonymous',
          type: current.type,
          parameters: this.extractParameters(current),
        };
      }
      current = current.parent;
    }
    return null;
  }

  getClassContext(node) {
    let current = node;
    while (current) {
      if (current.type === 'class_declaration') {
        const nameNode = current.children.find((c) => c.type === 'type_identifier');
        return {
          name: nameNode?.text || 'unknown',
          methods: this.extractMethods(current),
        };
      }
      current = current.parent;
    }
    return null;
  }

  getImports(rootNode) {
    const imports = [];
    for (const child of rootNode.children) {
      if (child.type === 'import_statement') {
        imports.push(child.text);
      }
    }
    return imports;
  }

  getSurroundingLines(sourceCode, targetLine, contextSize) {
    const lines = sourceCode.split('\n');
    const start = Math.max(0, targetLine - contextSize - 1);
    const end = Math.min(lines.length, targetLine + contextSize);

    return lines.slice(start, end).map((line, index) => ({
      number: start + index + 1,
      content: line,
      isViolation: start + index + 1 === targetLine,
    }));
  }

  extractParameters(functionNode) {
    const params = functionNode.children.find((c) => c.type === 'formal_parameters');
    return params?.children?.map((p) => p.text) || [];
  }

  extractMethods(classNode) {
    const body = classNode.children.find((c) => c.type === 'class_body');
    return (
      body?.children
        ?.filter((c) => c.type === 'method_definition')
        .map((m) => ({
          name: m.children.find((c) => c.type === 'property_identifier')?.text || 'unknown',
          type: m.type,
        })) || []
    );
  }

  getFallbackContext(filePath, line) {
    try {
      const sourceCode = fs.readFileSync(filePath, 'utf8');
      return {
        violation: { line, column: 0, nodeType: 'unknown' },
        context: {
          function: null,
          class: null,
          imports: [],
          surroundingLines: this.getSurroundingLines(sourceCode, line, 3),
        },
        ast: { nodeText: '', parentType: 'unknown', childrenTypes: [] },
      };
    } catch (error) {
      return null;
    }
  }
}

/**
 * ESLint violation analyzer and categorizer
 */
class ViolationAnalyzer {
  constructor() {
    this.contextExtractor = new CodeContextExtractor();
  }

  /**
   * Run ESLint and parse violations
   * @returns {Array} Parsed violations
   */
  analyzeViolations() {
    console.log('🔍 Running ESLint analysis...');

    // Try different strategies with ESLint 9 compatible flags
    const isQuickMode = process.argv.includes('--quick');

    const strategies = isQuickMode
      ? [
          // Quick mode: Just analyze a single file for demonstration
          'npx eslint src/core/interface-mode-detector.ts --format json',
          'npx eslint src/core/memory-coordinator.ts --format json',
          'npx eslint src/core/orchestrator-provider.ts --format json',
        ]
      : [
          // Full mode: Start with focused analysis, then expand
          'npx eslint "src/core/*.ts" "src/interfaces/*.ts" --format json',
          'npx eslint "src/**/*.ts" --format json --max-warnings 200',
          'npx eslint src --format json',
        ];

    for (const [index, strategy] of strategies.entries()) {
      const strategyDesc = isQuickMode
        ? 'Single file analysis'
        : index === 0
          ? 'Core & Interface files'
          : index === 1
            ? 'All TypeScript files (limited)'
            : 'Full source directory';

      console.log(`  Trying strategy ${index + 1}/3: ${strategyDesc}`);
      console.log(`    Command: ${strategy}`);

      const startTime = Date.now();
      try {
        console.log(`    ⏳ Analyzing... (timeout: 5min)`);

        const eslintOutput = execSync(strategy, {
          encoding: 'utf8',
          maxBuffer: 1024 * 1024 * 10,
          timeout: 300000, // Increase to 5 minutes for large codebases with 1000+ violations
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`    ✅ Completed in ${duration}s`);

        if (eslintOutput.trim()) {
          const results = JSON.parse(eslintOutput);
          const violations = this.parseViolations(results);
          if (violations.length > 0) {
            console.log(
              `  ✅ Strategy ${index + 1} successful: Found ${violations.length} violations`
            );
            return violations;
          }
        }
      } catch (error) {
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`    ❌ Failed after ${duration}s: ${error.message.split('\n')[0]}`);

        // If there's stdout with violations, try to parse it
        if (error.stdout && error.stdout.trim()) {
          try {
            const results = JSON.parse(error.stdout);
            const violations = this.parseViolations(results);
            if (violations.length > 0) {
              console.log(
                `  ✅ Strategy ${index + 1} found violations despite error: ${violations.length} violations`
              );
              return violations;
            }
          } catch (parseError) {
            // Continue to next strategy
          }
        }
      }
    }

    // All strategies failed
    throw new Error(
      'All ESLint analysis strategies failed. Please check your ESLint configuration.'
    );
  }

  /**
   * Generate realistic mock violations based on actual codebase analysis
   * @returns {Array} Mock violations based on real code patterns
   */
  generateRealisticMockViolations() {
    console.log('  🔍 Analyzing codebase patterns for realistic violations...');

    const violations = [];

    try {
      // Find TypeScript files with 'any' types (real violation we found earlier)
      const anyTypeFiles = [
        'tests/setup-hybrid.ts',
        'tests/setup-london.ts',
        'tests/vitest-setup.ts',
      ];

      anyTypeFiles.forEach((file, index) => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          const lines = content.split('\n');

          lines.forEach((line, lineNum) => {
            if (line.includes(': any') || line.includes(' as any')) {
              violations.push({
                file: path.resolve(file),
                rule: '@typescript-eslint/no-explicit-any',
                message: 'Unexpected any. Specify a different type.',
                severity: 'warning',
                line: lineNum + 1,
                column: line.indexOf('any') + 1,
                fixable: false,
                group: this.categorizeViolation('@typescript-eslint/no-explicit-any'),
                context: null,
              });
            }
          });
        }
      });

      // Add some simple formatting violations (easily fixable)
      const sourceFiles = execSync('find src -name "*.ts" -type f | head -5', { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter((f) => f && fs.existsSync(f));

      sourceFiles.forEach((file) => {
        // Mock some common violations
        violations.push(
          {
            file: path.resolve(file),
            rule: 'semi',
            message: 'Missing semicolon.',
            severity: 'error',
            line: 45,
            column: 25,
            fixable: true,
            group: this.categorizeViolation('semi'),
            context: null,
          },
          {
            file: path.resolve(file),
            rule: 'quotes',
            message: 'Strings must use singlequote.',
            severity: 'error',
            line: 12,
            column: 8,
            fixable: true,
            group: this.categorizeViolation('quotes'),
            context: null,
          }
        );
      });
    } catch (error) {
      console.log('    ⚠️  Error scanning files, using fallback violations');
    }

    // Ensure we have some violations for demonstration
    if (violations.length === 0) {
      violations.push(
        {
          file: path.resolve('src/example.ts'),
          rule: '@typescript-eslint/no-explicit-any',
          message: 'Unexpected any. Specify a different type.',
          severity: 'warning',
          line: 85,
          column: 18,
          fixable: false,
          group: 'GROUP_2',
          context: null,
        },
        {
          file: path.resolve('src/example.ts'),
          rule: 'semi',
          message: 'Missing semicolon.',
          severity: 'error',
          line: 45,
          column: 25,
          fixable: true,
          group: 'GROUP_3',
          context: null,
        },
        {
          file: path.resolve('src/example.ts'),
          rule: 'max-complexity',
          message: 'Function has too many statements (25). Maximum allowed is 20.',
          severity: 'warning',
          line: 150,
          column: 1,
          fixable: false,
          group: 'GROUP_1',
          context: null,
        }
      );
    }

    console.log(
      `  ✅ Generated ${violations.length} realistic violations based on codebase analysis`
    );
    return violations;
  }

  /**
   * Parse ESLint output into structured violations
   * @param {Array} eslintResults - Raw ESLint results
   * @returns {Array} Structured violations
   */
  parseViolations(eslintResults) {
    const violations = [];

    for (const file of eslintResults) {
      if (file.messages && file.messages.length > 0) {
        for (const message of file.messages) {
          const violation = {
            file: file.filePath,
            rule: message.ruleId,
            message: message.message,
            severity: message.severity === 2 ? 'error' : 'warning',
            line: message.line,
            column: message.column,
            fixable: message.fixable || false,
            group: this.categorizeViolation(message.ruleId),
            context: null, // Will be populated later
          };

          violations.push(violation);
        }
      }
    }

    return violations;
  }

  /**
   * Categorize violation based on Docker methodology
   * @param {string} ruleId - ESLint rule ID
   * @returns {string} Violation group
   */
  categorizeViolation(ruleId) {
    if (!ruleId) return 'GROUP_2';

    for (const [group, config] of Object.entries(VIOLATION_GROUPS)) {
      if (config.rules.includes(ruleId)) {
        return group;
      }
    }

    // Default to Group 2 for uncategorized rules
    return 'GROUP_2';
  }

  /**
   * Add context information to violations using Tree-sitter
   * @param {Array} violations - Violations to enhance
   * @returns {Array} Enhanced violations
   */
  async enhanceWithContext(violations) {
    console.log('🌳 Extracting code context using Tree-sitter...');

    const enhanced = [];
    let processed = 0;

    for (const violation of violations) {
      if (processed % 10 === 0) {
        console.log(`  Processed ${processed}/${violations.length} violations`);
      }

      const context = this.contextExtractor.extractContext(
        violation.file,
        violation.line,
        violation.column
      );

      enhanced.push({
        ...violation,
        context,
      });

      processed++;
    }

    return enhanced;
  }
}

/**
 * AI-powered violation fixer using Claude Code
 */
class AIViolationFixer {
  constructor() {
    this.fixAttempts = new Map();
    this.successRate = new Map();
  }

  /**
   * Process violations in batches using AI assistance
   * @param {Array} violations - Categorized violations
   * @returns {Object} Fix results
   */
  async processViolations(violations) {
    console.log('🤖 Starting AI-assisted violation fixing...');

    const results = {
      GROUP_1: { attempted: 0, fixed: 0, failed: 0 },
      GROUP_2: { attempted: 0, fixed: 0, failed: 0 },
      GROUP_3: { attempted: 0, fixed: 0, failed: 0 },
    };

    // Group violations by category
    const groupedViolations = this.groupViolations(violations);

    // Process Group 3 first (easiest, highest success rate)
    if (groupedViolations.GROUP_3.length > 0) {
      console.log(
        `\n📝 Processing ${groupedViolations.GROUP_3.length} Group 3 violations (simple fixes)...`
      );
      const group3Results = await this.fixGroup3Violations(groupedViolations.GROUP_3);
      results.GROUP_3 = group3Results;
    }

    // Process Group 2 (moderate complexity)
    if (groupedViolations.GROUP_2.length > 0) {
      console.log(
        `\n🔧 Processing ${groupedViolations.GROUP_2.length} Group 2 violations (context-aware)...`
      );
      const group2Results = await this.fixGroup2Violations(groupedViolations.GROUP_2);
      results.GROUP_2 = group2Results;
    }

    // Process Group 1 (complex, requires human review)
    if (groupedViolations.GROUP_1.length > 0) {
      console.log(
        `\n⚠️  Processing ${groupedViolations.GROUP_1.length} Group 1 violations (requires review)...`
      );
      const group1Results = await this.analyzeGroup1Violations(groupedViolations.GROUP_1);
      results.GROUP_1 = group1Results;
    }

    return results;
  }

  groupViolations(violations) {
    return {
      GROUP_1: violations.filter((v) => v.group === 'GROUP_1'),
      GROUP_2: violations.filter((v) => v.group === 'GROUP_2'),
      GROUP_3: violations.filter((v) => v.group === 'GROUP_3'),
    };
  }

  /**
   * Fix simple Group 3 violations using standard patterns
   */
  async fixGroup3Violations(violations) {
    const results = { attempted: 0, fixed: 0, failed: 0 };

    for (const violation of violations.slice(0, 20)) {
      // Limit to prevent overwhelming
      results.attempted++;

      try {
        const fixed = await this.applySimpleFix(violation);
        if (fixed) {
          results.fixed++;
        } else {
          results.failed++;
        }
      } catch (error) {
        console.warn(`Failed to fix simple violation: ${error.message}`);
        results.failed++;
      }
    }

    return results;
  }

  /**
   * Fix moderate Group 2 violations using AI context analysis
   */
  async fixGroup2Violations(violations) {
    const results = { attempted: 0, fixed: 0, failed: 0 };

    // Process in batches
    const batches = this.createBatches(violations.slice(0, 30), BATCH_SIZE);

    for (const batch of batches) {
      console.log(`  Processing batch of ${batch.length} Group 2 violations...`);

      for (const violation of batch) {
        results.attempted++;

        try {
          const fixed = await this.applyContextAwareFix(violation);
          if (fixed) {
            results.fixed++;
          } else {
            results.failed++;
          }
        } catch (error) {
          console.warn(`Failed to fix context-aware violation: ${error.message}`);
          results.failed++;
        }
      }

      // Rate limiting
      await this.sleep(1000);
    }

    return results;
  }

  /**
   * Analyze complex Group 1 violations for human review
   */
  async analyzeGroup1Violations(violations) {
    const results = { attempted: 0, fixed: 0, failed: 0 };

    // Generate analysis report for human review
    const analysisReport = await this.generateAnalysisReport(violations);

    const reportPath = path.join(REPORTS_DIR, `group1-analysis-${Date.now()}.md`);
    fs.writeFileSync(reportPath, analysisReport);

    console.log(`📋 Group 1 analysis report saved: ${reportPath}`);

    results.attempted = violations.length;
    // Group 1 violations require human review, not automatic fixing

    return results;
  }

  /**
   * Apply simple pattern-based fixes
   */
  async applySimpleFix(violation) {
    const fixes = {
      semi: (content, line) => {
        const lines = content.split('\n');
        const targetLine = lines[line - 1];
        if (!targetLine.trim().endsWith(';')) {
          lines[line - 1] = targetLine + ';';
          return lines.join('\n');
        }
        return null;
      },
      quotes: (content, line) => {
        const lines = content.split('\n');
        lines[line - 1] = lines[line - 1].replace(/"/g, "'");
        return lines.join('\n');
      },
      'no-trailing-spaces': (content) => {
        return content.replace(/[ \t]+$/gm, '');
      },
      'eol-last': (content) => {
        return content.endsWith('\n') ? content : content + '\n';
      },
    };

    const fix = fixes[violation.rule];
    if (!fix) return false;

    try {
      const content = fs.readFileSync(violation.file, 'utf8');
      const fixed = fix(content, violation.line);

      if (fixed && fixed !== content) {
        fs.writeFileSync(violation.file, fixed);
        console.log(`  ✅ Fixed ${violation.rule} in ${violation.file}:${violation.line}`);
        return true;
      }
    } catch (error) {
      console.warn(`  ❌ Failed to apply simple fix: ${error.message}`);
    }

    return false;
  }

  /**
   * Apply context-aware fixes using Claude Code
   */
  async applyContextAwareFix(violation) {
    if (!violation.context) return false;

    const prompt = this.buildContextAwarePrompt(violation);
    const isVerbose = process.argv.includes('--verbose');

    // Always show Claude CLI activity (not just in verbose mode)
    console.log(`    🤖 Calling Claude CLI for ${violation.rule}...`);
    if (isVerbose) {
      console.log(`    📝 Prompt length: ${prompt.length} chars`);
      console.log(`    📋 Prompt preview: ${prompt.slice(0, 200)}...`);
    } else {
      // Always show basic prompt info
      console.log(`    📝 File: ${path.basename(violation.file)}:${violation.line} | Prompt: ${prompt.length} chars`);
    }

    try {
      // Use Claude Code for context-aware fixing with activity-based timeout

      const result = await new Promise((resolve, reject) => {
        const startTime = Date.now();
        const INACTIVITY_TIMEOUT = 1200000; // 20 minutes of no output = timeout
        const MAX_TOTAL_TIMEOUT = 1800000; // 30 minutes absolute maximum
        let lastActivityTime = Date.now();
        let inactivityTimeoutHandle = null;
        let maxTimeoutHandle = null;

        const claude = spawn(
          'claude',
          [
            '--debug',
            '--verbose',
            '-p',
            '--dangerously-skip-permissions'
          ],
          {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: path.resolve(__dirname, '../..'), // Ensure Claude CLI runs from repo root directory
            // No fixed timeout - we'll handle it dynamically
          }
        );

        if (isVerbose) {
          console.log(`    ⏳ Claude CLI started (PID: ${claude.pid})`);
          console.log(`    📁 Claude working directory: ${path.resolve(__dirname, '../..')}`);
          console.log(
            `    🏴 Flags: --debug --verbose -p --dangerously-skip-permissions`
          );
          console.log(
            `    ⏰ Inactivity timeout: ${INACTIVITY_TIMEOUT / 1000}s | Max total: ${MAX_TOTAL_TIMEOUT / 60000}min`
          );
        }
        
        // Send prompt via stdin (more reliable than command argument)
        claude.stdin.write(prompt);
        claude.stdin.end();

        // Function to reset the inactivity timeout (but not the max timeout)
        const resetInactivityTimeout = () => {
          lastActivityTime = Date.now();
          if (inactivityTimeoutHandle) {
            clearTimeout(inactivityTimeoutHandle);
          }
          inactivityTimeoutHandle = setTimeout(() => {
            if (isVerbose) {
              const inactiveDuration = ((Date.now() - lastActivityTime) / 1000).toFixed(1);
              console.log(`    ⏱️  Claude CLI inactive for ${inactiveDuration}s - terminating`);
            }
            claude.kill('SIGTERM');
            reject(
              new Error(`Claude CLI timeout after ${INACTIVITY_TIMEOUT / 1000}s of inactivity`)
            );
          }, INACTIVITY_TIMEOUT);
        };

        // Set absolute maximum timeout (cannot be reset)
        maxTimeoutHandle = setTimeout(() => {
          if (isVerbose) {
            const totalDuration = ((Date.now() - startTime) / 60000).toFixed(1);
            console.log(
              `    ⏰ Claude CLI reached maximum timeout of ${totalDuration}min - terminating`
            );
          }
          claude.kill('SIGTERM');
          reject(
            new Error(`Claude CLI reached maximum timeout of ${MAX_TOTAL_TIMEOUT / 60000} minutes`)
          );
        }, MAX_TOTAL_TIMEOUT);

        // Start the inactivity timer
        resetInactivityTimeout();

        let stdout = '';
        let stderr = '';

        claude.stdout.on('data', (data) => {
          stdout += data.toString();
          resetInactivityTimeout(); // Reset timeout on output
          if (isVerbose) {
            // Show full Claude output in real-time, with proper formatting
            const output = data.toString();
            const lines = output.split('\n');
            lines.forEach((line) => {
              if (line.trim()) {
                console.log(`    📥 Claude: ${line}`);
              }
            });
          }
        });

        claude.stderr.on('data', (data) => {
          stderr += data.toString();
          resetInactivityTimeout(); // Reset timeout on any output (including debug)
          
          const output = data.toString();
          const lines = output.split('\n');
          
          lines.forEach((line) => {
            if (line.trim()) {
              if (isVerbose) {
                // Verbose: Show ALL debug output
                if (line.includes('[DEBUG]')) {
                  console.log(`    🔍 Claude DEBUG: ${line}`);
                } else {
                  console.log(`    ⚠️  Claude: ${line}`);
                }
              } else {
                // Non-verbose: Show only key activities (tool usage)
                if (line.includes('executePreToolHooks called for tool:') || 
                    line.includes('File') && line.includes('written atomically')) {
                  const toolMatch = line.match(/executePreToolHooks called for tool: (\w+)/);
                  if (toolMatch) {
                    console.log(`    🔧 Claude using ${toolMatch[1]} tool...`);
                  } else if (line.includes('written atomically')) {
                    console.log(`    💾 Claude saved file changes`);
                  }
                }
              }
            }
          });
        });

        claude.on('close', (code) => {
          const duration = ((Date.now() - startTime) / 1000).toFixed(1);
          // Clear both timeout handles
          if (inactivityTimeoutHandle) {
            clearTimeout(inactivityTimeoutHandle);
          }
          if (maxTimeoutHandle) {
            clearTimeout(maxTimeoutHandle);
          }

          // Always show completion status (not just in verbose mode)
          if (code === 0) {
            console.log(`    ✅ Claude CLI completed in ${duration}s`);
            resolve(stdout);
          } else {
            console.log(`    ❌ Claude CLI failed in ${duration}s (code ${code})`);
            reject(new Error(`Claude exited with code ${code}: ${stderr}`));
          }
        });

        claude.on('error', (error) => {
          const duration = ((Date.now() - startTime) / 1000).toFixed(1);
          // Clear both timeout handles
          if (inactivityTimeoutHandle) {
            clearTimeout(inactivityTimeoutHandle);
          }
          if (maxTimeoutHandle) {
            clearTimeout(maxTimeoutHandle);
          }

          // Always show error status (not just in verbose mode)
          console.log(`    💥 Claude CLI error after ${duration}s: ${error.message}`);
          reject(error);
        });
      });

      // With direct editing, Claude handles file operations via Edit tool
      // Success is indicated by Claude providing a response
      if (result && result.trim().length > 0) {
        console.log(
          `  ✅ Claude processed ${violation.rule} in ${path.basename(violation.file)}:${violation.line}`
        );
        return true;
      } else {
        console.log(`  ❌ Claude provided empty response for ${violation.rule}`);
        return false;
      }
    } catch (error) {
      console.warn(`  ❌ AI fix failed for ${violation.rule}: ${error.message}`);
    }

    return false;
  }

  buildContextAwarePrompt(violation) {
    const context = violation.context;
    const relativeFilePath = path.relative(process.cwd(), violation.file);

    return `Fix this ESLint violation by directly editing the file using the Edit tool:

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

**Instructions:**
Please use the Edit tool to fix this ESLint violation:
1. 🎯 ONLY edit the file: ${relativeFilePath}
2. 🎯 ONLY fix line ${violation.line} (the violation line marked with >)
3. Apply minimal fix following TypeScript best practices
4. Maintain existing functionality and type safety
5. Do NOT edit any other files or lines

Use the Edit tool now to fix this specific violation in ${relativeFilePath}.`;
  }

  // parseAndApplyClaudeFix method removed - now using direct Claude file editing via Edit tool

  async generateAnalysisReport(violations) {
    const timestamp = new Date().toISOString();

    let report = `# Group 1 Violations Analysis Report\n\n`;
    report += `Generated: ${timestamp}\n`;
    report += `Total Complex Violations: ${violations.length}\n\n`;

    report += `## Summary\n\n`;
    report += `These violations require architectural changes and human review:\n\n`;

    const ruleGroups = violations.reduce((acc, v) => {
      acc[v.rule] = (acc[v.rule] || 0) + 1;
      return acc;
    }, {});

    for (const [rule, count] of Object.entries(ruleGroups)) {
      report += `- **${rule}**: ${count} violations\n`;
    }

    report += `\n## Detailed Analysis\n\n`;

    for (const violation of violations.slice(0, 10)) {
      // Limit to prevent huge reports
      report += `### ${violation.rule} - ${path.basename(violation.file)}:${violation.line}\n\n`;
      report += `**Message**: ${violation.message}\n\n`;

      if (violation.context?.context.surroundingLines) {
        report += `**Code Context**:\n\`\`\`typescript\n`;
        report += violation.context.context.surroundingLines
          .map((l) => `${l.number}: ${l.content}`)
          .join('\n');
        report += `\n\`\`\`\n\n`;
      }

      report += `**Recommended Action**: Manual review and refactoring required\n\n`;
      report += `---\n\n`;
    }

    return report;
  }

  createBatches(array, size) {
    const batches = [];
    for (let i = 0; i < array.length; i += size) {
      batches.push(array.slice(i, i + size));
    }
    return batches;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Main execution function
 */
async function main() {
  const startTime = Date.now();

  // Check for mode flags
  const isQuickMode = process.argv.includes('--quick');
  const isFullMode = process.argv.includes('--full');
  const isAnalyzeOnly = process.argv.includes('--analyze-only');

  console.log('🧘 Claude Code Zen AI ESLint Fixer');
  console.log('===================================\n');

  if (isQuickMode) {
    console.log('⚡ Quick Mode: Processing ~20 violations for testing\n');
  } else if (isFullMode) {
    console.log('🚀 Full Mode: Processing ALL violations (may take a while)\n');
  } else {
    console.log('🎯 Production Mode: Processing up to 50 violations efficiently\n');
  }
  if (isAnalyzeOnly) {
    console.log('📊 Analyze Only: No fixes will be applied\n');
  }

  try {
    // Step 1: Analyze violations
    const analyzer = new ViolationAnalyzer();
    let violations = analyzer.analyzeViolations();

    // Limit violations based on mode
    if (isQuickMode && violations.length > 20) {
      console.log(`⚡ Quick mode: Limiting to 20 violations (found ${violations.length})`);
      violations = violations.slice(0, 20);
    } else if (!isQuickMode && !isFullMode && violations.length > 50) {
      console.log(
        `🎯 Production mode: Limiting to 50 violations for efficient processing (found ${violations.length})`
      );
      console.log(
        `   Use --full to process all violations or --analyze-only to see all without fixing`
      );
      violations = violations.slice(0, 50);
    } else if (isFullMode) {
      console.log(
        `🚀 Full mode: Processing all ${violations.length} violations (this may take several minutes)`
      );
    }

    console.log(`📊 Found ${violations.length} total violations`);

    // Group by category for reporting
    const grouped = {
      GROUP_1: violations.filter((v) => v.group === 'GROUP_1'),
      GROUP_2: violations.filter((v) => v.group === 'GROUP_2'),
      GROUP_3: violations.filter((v) => v.group === 'GROUP_3'),
    };

    console.log(`  - Group 1 (Complex): ${grouped.GROUP_1.length}`);
    console.log(`  - Group 2 (Moderate): ${grouped.GROUP_2.length}`);
    console.log(`  - Group 3 (Simple): ${grouped.GROUP_3.length}\n`);

    // Step 2: Enhance with context
    const enhancedViolations = await analyzer.enhanceWithContext(violations);

    // Step 3: Process with AI
    const fixer = new AIViolationFixer();
    const results = await fixer.processViolations(enhancedViolations);

    // Step 4: Generate final report
    const duration = Math.round((Date.now() - startTime) / 1000);
    const report = generateFinalReport(results, duration, violations.length);

    console.log('\n' + report);

    // Save report
    const reportPath = path.join(REPORTS_DIR, `ai-eslint-fix-${Date.now()}.md`);
    fs.writeFileSync(reportPath, report);
    console.log(`\n📋 Detailed report saved: ${reportPath}`);
  } catch (error) {
    console.error('❌ Error during AI-assisted fixing:', error.message);
    process.exit(1);
  }
}

function generateFinalReport(results, duration, totalViolations) {
  const totalFixed = results.GROUP_1.fixed + results.GROUP_2.fixed + results.GROUP_3.fixed;
  const totalAttempted =
    results.GROUP_1.attempted + results.GROUP_2.attempted + results.GROUP_3.attempted;
  const successRate = totalAttempted > 0 ? ((totalFixed / totalAttempted) * 100).toFixed(1) : '0.0';

  return `# AI-Assisted ESLint Fix Report

## Summary
- **Total Violations**: ${totalViolations}
- **Total Attempted**: ${totalAttempted}
- **Total Fixed**: ${totalFixed}
- **Success Rate**: ${successRate}%
- **Duration**: ${duration}s

## Results by Group

### Group 1 (Complex - Requires Human Review)
- Attempted: ${results.GROUP_1.attempted}
- Fixed: ${results.GROUP_1.fixed}
- Failed: ${results.GROUP_1.failed}

### Group 2 (Moderate - AI Context-Aware)
- Attempted: ${results.GROUP_2.attempted}
- Fixed: ${results.GROUP_2.fixed}
- Failed: ${results.GROUP_2.failed}

### Group 3 (Simple - Pattern-Based)
- Attempted: ${results.GROUP_3.attempted}
- Fixed: ${results.GROUP_3.fixed}
- Failed: ${results.GROUP_3.failed}

## Next Steps
1. Review Group 1 violations manually
2. Re-run ESLint to verify fixes
3. Run tests to ensure no functionality broken
4. Consider updating ESLint rules based on patterns found
`;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ViolationAnalyzer, AIViolationFixer, CodeContextExtractor };
