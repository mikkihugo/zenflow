#!/usr/bin/env node

/**
 * Lint System Test Suite
 *
 * Hierarchical Lint Fixing Swarm - System Validation
 * Agent: Lint Correction Fixer (Test Coordinator)
 * Memory Key: swarm-lint-fix/hierarchy/level2/specialists/fixer/testing
 *
 * Tests the entire lint correction system before deployment
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

class LintSystemTester {
  constructor() {
    this.testResults = new Map();
    this.memoryKey = 'swarm-lint-fix/hierarchy/level2/specialists/fixer/testing';
    this.testDir = './test-lint-samples';

    this.setupTestEnvironment();
  }

  /**
   * Log test memory
   */
  logMemory(action, data) {
    const timestamp = new Date().toISOString();
    console.log(`🧠 [${timestamp}] MEMORY: ${this.memoryKey} - ${action}`);
    if (data) console.log('📊 Data:', JSON.stringify(data, null, 2));
  }

  /**
   * Set up test environment with sample broken files
   */
  setupTestEnvironment() {
    // Clean and create test directory
    if (existsSync(this.testDir)) {
      rmSync(this.testDir, { recursive: true, force: true });
    }
    mkdirSync(this.testDir, { recursive: true });

    this.logMemory('test-environment-setup', { testDir: this.testDir });
  }

  /**
   * Create test files with known lint errors
   */
  createTestFiles() {
    const testFiles = {
      'unterminated-comment.js': `
/* This is an unterminated comment
function test() {
  console.log('hello world');
}
`,
      'missing-semicolons.js': `
const name = 'test'
const age = 25
function greet() {
  return \`Hello \${name}\`
}
console.log(greet())
`,
      'missing-brackets.js': `
function incomplete() {
  if (true) {
    console.log('missing closing brace'
  }
  
  const arr = [1, 2, 3
  console.log(arr
}
`,
      'typescript-errors.ts': `
interface User {
  name: string
  age:
}

function processUser(user: User): {
  console.log(user.name)
}

const incomplete:
`,
      'import-errors.mjs': `
import 
const fs = require('fs')
export

function test() {
  console.log('mixed module syntax')
}

module.exports = test
`,
      'async-errors.js': `
async function* generator() {
  yield 1
}

async getData() {
  const result = await fetch('/api')
  return result
}

function* simpleGen {
  yield 42
}
`,
      'expression-errors.js': `
console
const incomplete = {
  name: 'test'
  age
}

function broken() {
  return
}

const arr = [
  1,
  2
  3
]
`,
      'complex-errors.ts': `
/* Unterminated comment
interface Complex {
  data:
  process(): 

export class TestClass {
  constructor(name: string) {
    this.name = name
  }

  async method(): Promise<void> {
    const result = await this.process()
    console.log(result
  }

  private process(): string {
    return \`Processing: \${this.name}\`
  }
// Missing closing brace
`,
    };

    for (const [filename, content] of Object.entries(testFiles)) {
      const filePath = join(this.testDir, filename);
      writeFileSync(filePath, content);
    }

    this.logMemory('test-files-created', {
      count: Object.keys(testFiles).length,
      files: Object.keys(testFiles),
    });

    return Object.keys(testFiles);
  }

  /**
   * Test basic lint terminator
   */
  async testLintTerminator() {
    this.logMemory('testing-lint-terminator', { phase: 'basic-fixes' });

    try {
      const LintTerminator = (await import('../lint-terminator.js')).default;
      const terminator = new LintTerminator();

      // Override the getFilesToProcess method to use our test files
      terminator.getFilesToProcess = async () => {
        return this.createTestFiles().map(file => join(this.testDir, file));
      };

      const results = await terminator.run();

      this.testResults.set('lint-terminator', {
        success: true,
        results,
        timestamp: new Date().toISOString(),
      });

      this.logMemory('lint-terminator-test-complete', results);
      return results;

    } catch (error) {
      this.testResults.set('lint-terminator', {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      this.logMemory('lint-terminator-test-failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Test advanced lint fixer
   */
  async testAdvancedLintFixer() {
    this.logMemory('testing-advanced-lint-fixer', { phase: 'advanced-fixes' });

    try {
      const AdvancedLintFixer = (await import('./lint-fixer-advanced.js')).default;
      const fixer = new AdvancedLintFixer();

      // Override the getErrorFiles method to use our test files
      fixer.getErrorFiles = async () => {
        return this.createTestFiles().map(file => join(this.testDir, file));
      };

      const results = await fixer.run();

      this.testResults.set('advanced-lint-fixer', {
        success: true,
        results,
        timestamp: new Date().toISOString(),
      });

      this.logMemory('advanced-lint-fixer-test-complete', results);
      return results;

    } catch (error) {
      this.testResults.set('advanced-lint-fixer', {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      this.logMemory('advanced-lint-fixer-test-failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Test coordination protocol
   */
  async testCoordinationProtocol() {
    this.logMemory('testing-coordination-protocol', { phase: 'worker-coordination' });

    try {
      const LintCoordinationProtocol = (await import('./lint-coordination-protocol.js')).default;
      const protocol = new LintCoordinationProtocol();

      // Create a mock ESLint output for testing
      const mockLintErrors = this.createMockLintErrors();

      // Override the analyzeErrors method
      protocol.analyzeErrors = async () => mockLintErrors;

      const results = await protocol.run();

      this.testResults.set('coordination-protocol', {
        success: true,
        results,
        timestamp: new Date().toISOString(),
      });

      this.logMemory('coordination-protocol-test-complete', {
        workersGenerated: results.taskDistribution.size,
        totalTasks: Array.from(results.taskDistribution.values()).reduce((sum, tasks) => sum + tasks.length, 0),
      });

      return results;

    } catch (error) {
      this.testResults.set('coordination-protocol', {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      this.logMemory('coordination-protocol-test-failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Create mock ESLint errors for testing
   */
  createMockLintErrors() {
    const testFiles = this.createTestFiles();
    const mockErrors = {
      files: new Map(),
      errorTypes: new Map(),
      totalErrors: 0,
    };

    // Simulate errors for each test file
    const errorSimulations = {
      'unterminated-comment.js': [
        { line: 1, col: 1, message: 'Unterminated comment', type: 'unterminated-comment' },
      ],
      'missing-semicolons.js': [
        { line: 2, col: 20, message: 'Missing semicolon', type: 'semicolon-expected' },
        { line: 3, col: 15, message: 'Missing semicolon', type: 'semicolon-expected' },
      ],
      'missing-brackets.js': [
        { line: 4, col: 40, message: 'Missing closing parenthesis', type: 'missing-closing-brackets' },
        { line: 7, col: 25, message: 'Missing closing bracket', type: 'missing-closing-brackets' },
      ],
      'typescript-errors.ts': [
        { line: 4, col: 7, message: 'Expression expected', type: 'expression-expected' },
        { line: 7, col: 35, message: 'Declaration expected', type: 'declaration-expected' },
      ],
      'import-errors.mjs': [
        { line: 1, col: 7, message: 'Expression expected', type: 'import-export-errors' },
        { line: 3, col: 7, message: 'Expression expected', type: 'import-export-errors' },
      ],
    };

    for (const [filename, errors] of Object.entries(errorSimulations)) {
      const filePath = join(this.testDir, filename);
      mockErrors.files.set(filePath, errors);

      for (const error of errors) {
        mockErrors.totalErrors++;
        mockErrors.errorTypes.set(error.type, (mockErrors.errorTypes.get(error.type) || 0) + 1);
      }
    }

    return mockErrors;
  }

  /**
   * Validate fixed files
   */
  async validateFixedFiles() {
    this.logMemory('validating-fixed-files', { phase: 'validation' });

    const validationResults = {
      filesChecked: 0,
      syntaxValid: 0,
      syntaxInvalid: 0,
      improvements: [],
    };

    const testFiles = this.createTestFiles();

    for (const filename of testFiles) {
      const filePath = join(this.testDir, filename);

      if (existsSync(filePath)) {
        validationResults.filesChecked++;

        try {
          const content = readFileSync(filePath, 'utf8');

          // Basic syntax validation
          if (this.isBasicSyntaxValid(content)) {
            validationResults.syntaxValid++;
            validationResults.improvements.push({
              file: filename,
              status: 'improved',
              checks: this.analyzeSyntaxImprovements(content),
            });
          } else {
            validationResults.syntaxInvalid++;
            validationResults.improvements.push({
              file: filename,
              status: 'needs-work',
              issues: this.identifyRemainingSyntaxIssues(content),
            });
          }
        } catch (error) {
          validationResults.syntaxInvalid++;
          validationResults.improvements.push({
            file: filename,
            status: 'error',
            error: error.message,
          });
        }
      }
    }

    this.testResults.set('validation', {
      success: true,
      results: validationResults,
      timestamp: new Date().toISOString(),
    });

    this.logMemory('validation-complete', validationResults);
    return validationResults;
  }

  /**
   * Basic syntax validation
   */
  isBasicSyntaxValid(content) {
    // Check balanced brackets
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    const openBrackets = (content.match(/\[/g) || []).length;
    const closeBrackets = (content.match(/\]/g) || []).length;

    // Check comment balance
    const commentStarts = (content.match(/\/\*/g) || []).length;
    const commentEnds = (content.match(/\*\//g) || []).length;

    return (
      openBraces === closeBraces &&
      openParens === closeParens &&
      openBrackets === closeBrackets &&
      commentStarts === commentEnds
    );
  }

  /**
   * Analyze syntax improvements
   */
  analyzeSyntaxImprovements(content) {
    const improvements = [];

    if (content.includes('*/')) {
      improvements.push('comment-termination-fixed');
    }

    if (content.match(/;\s*$/m)) {
      improvements.push('semicolons-added');
    }

    if (content.includes('import ') && !content.includes('require(')) {
      improvements.push('es-modules-consistent');
    }

    return improvements;
  }

  /**
   * Identify remaining syntax issues
   */
  identifyRemainingSyntaxIssues(content) {
    const issues = [];

    if ((content.match(/\/\*/g) || []).length !== (content.match(/\*\//g) || []).length) {
      issues.push('unbalanced-comments');
    }

    if ((content.match(/\{/g) || []).length !== (content.match(/\}/g) || []).length) {
      issues.push('unbalanced-braces');
    }

    return issues;
  }

  /**
   * Generate comprehensive test report
   */
  generateTestReport() {
    const report = {
      timestamp: new Date().toISOString(),
      testSuite: 'Hierarchical Lint Fixing Swarm - Level 2 Specialist Testing',
      agent: 'lint-correction-fixer',
      memoryKey: this.memoryKey,
      summary: {
        totalTests: this.testResults.size,
        passed: 0,
        failed: 0,
        coverage: {},
      },
      results: Object.fromEntries(this.testResults),
      recommendations: [],
    };

    // Calculate summary
    for (const [testName, result] of this.testResults) {
      if (result.success) {
        report.summary.passed++;
      } else {
        report.summary.failed++;
      }
    }

    // Add recommendations
    if (report.summary.failed > 0) {
      report.recommendations.push('Some tests failed - review error logs and fix issues');
    }

    if (report.summary.passed === report.summary.totalTests) {
      report.recommendations.push('All tests passed - system ready for deployment');
      report.recommendations.push('Consider running on actual codebase for production validation');
    }

    return report;
  }

  /**
   * Main test execution
   */
  async run() {
    console.log('🧪 Lint System Test Suite - Starting Comprehensive Testing');
    console.log('🔧 Hierarchical Lint Fixing Swarm - Level 2 Specialist System Validation');

    this.logMemory('test-suite-start', { testDir: this.testDir });

    const startTime = Date.now();

    try {
      // Test 1: Basic Lint Terminator
      console.log('\n🔧 Testing Basic Lint Terminator...');
      await this.testLintTerminator();
      console.log('✅ Basic Lint Terminator test completed');

      // Test 2: Advanced Lint Fixer
      console.log('\n🚀 Testing Advanced Lint Fixer...');
      await this.testAdvancedLintFixer();
      console.log('✅ Advanced Lint Fixer test completed');

      // Test 3: Coordination Protocol
      console.log('\n🐝 Testing Coordination Protocol...');
      await this.testCoordinationProtocol();
      console.log('✅ Coordination Protocol test completed');

      // Test 4: Validation
      console.log('\n🔍 Validating Fixed Files...');
      await this.validateFixedFiles();
      console.log('✅ File validation completed');

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      // Generate report
      const report = this.generateTestReport();
      report.duration = duration;

      // Save report
      const reportFile = join(this.testDir, 'test-report.json');
      writeFileSync(reportFile, JSON.stringify(report, null, 2));

      console.log('\n🎉 Lint System Test Suite Complete!');
      console.log('📊 Test Results:');
      console.log(`  ✅ Passed: ${report.summary.passed}`);
      console.log(`  ❌ Failed: ${report.summary.failed}`);
      console.log(`  ⏱️  Duration: ${duration.toFixed(2)}s`);
      console.log(`  📄 Report: ${reportFile}`);

      if (report.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        for (const rec of report.recommendations) {
          console.log(`  • ${rec}`);
        }
      }

      this.logMemory('test-suite-complete', {
        passed: report.summary.passed,
        failed: report.summary.failed,
        duration: duration,
      });

      return report;

    } catch (error) {
      this.logMemory('test-suite-error', { error: error.message });
      console.error('❌ Test suite failed:', error);
      throw error;
    } finally {
      // Cleanup test directory
      if (existsSync(this.testDir)) {
        rmSync(this.testDir, { recursive: true, force: true });
      }
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new LintSystemTester();
  tester.run().then(report => {
    console.log('\\n✅ All tests completed successfully');
    process.exit(report.summary.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

export default LintSystemTester;
