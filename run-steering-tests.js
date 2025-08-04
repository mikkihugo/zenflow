#!/usr/bin/env node

/**
 * Steering Tests Execution Script
 * Runs all steering document tests and provides comprehensive results
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import chalk from 'chalk';

class SteeringTestRunner {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
  }

  async runAllTests() {
    try {
      // 1. Run comprehensive standalone test
      await this.runComprehensiveTest();

      // 2. Run Jest unit tests
      await this.runUnitTests();

      // 3. Run integration tests
      await this.runIntegrationTests();

      // 4. Run performance tests
      await this.runPerformanceTests();

      // 5. Run CLI end-to-end tests
      await this.runCliTests();

      // Generate final report
      this.generateFinalReport();
    } catch (error) {
      console.error(chalk.red('\n❌ Test suite execution failed:'), error.message);
      process.exit(1);
    }
  }

  async runComprehensiveTest() {
    const testFile = 'test-maestro-steering-complete.js';
    if (!existsSync(testFile)) {
      this.recordTestResult('Comprehensive Test', false, 'Test file not found');
      return;
    }

    try {
      const result = await this.executeCommand('node', [testFile]);
      this.recordTestResult('Comprehensive Test', result.success, result.output);

      if (result.success) {
      } else {
      }
    } catch (error) {
      this.recordTestResult('Comprehensive Test', false, error.message);
    }
  }

  async runUnitTests() {
    const _unitTestPattern = 'src/__tests__/unit/maestro/steering-documents.test.ts';

    try {
      const result = await this.executeCommand('npm', [
        'test',
        '--',
        '--testPathPattern=steering-documents',
      ]);
      this.recordTestResult('Unit Tests', result.success, result.output);

      if (result.success) {
      } else {
        this.showTestFailures(result.output);
      }
    } catch (error) {
      this.recordTestResult('Unit Tests', false, error.message);
    }
  }

  async runIntegrationTests() {
    try {
      const result = await this.executeCommand('npm', [
        'test',
        '--',
        '--testPathPattern=steering-workflow',
      ]);
      this.recordTestResult('Integration Tests', result.success, result.output);

      if (result.success) {
      } else {
        this.showTestFailures(result.output);
      }
    } catch (error) {
      this.recordTestResult('Integration Tests', false, error.message);
    }
  }

  async runPerformanceTests() {
    try {
      const result = await this.executeCommand('npm', [
        'test',
        '--',
        '--testPathPattern=steering-performance',
      ]);
      this.recordTestResult('Performance Tests', result.success, result.output);

      if (result.success) {
        this.extractPerformanceMetrics(result.output);
      } else {
        this.showTestFailures(result.output);
      }
    } catch (error) {
      this.recordTestResult('Performance Tests', false, error.message);
    }
  }

  async runCliTests() {
    try {
      const result = await this.executeCommand('npm', [
        'test',
        '--',
        '--testPathPattern=steering-cli',
      ]);
      this.recordTestResult('CLI Tests', result.success, result.output);

      if (result.success) {
      } else {
        this.showTestFailures(result.output);
      }
    } catch (error) {
      this.recordTestResult('CLI Tests', false, error.message);
    }
  }

  async executeCommand(command, args, options = {}) {
    return new Promise((resolve) => {
      const process = spawn(command, args, {
        stdio: 'pipe',
        ...options,
      });

      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        resolve({
          success: code === 0,
          output: stdout + stderr,
          code,
        });
      });

      process.on('error', (error) => {
        resolve({
          success: false,
          output: error.message,
          code: -1,
        });
      });
    });
  }

  recordTestResult(testName, success, output) {
    this.testResults.push({
      testName,
      success,
      output,
      timestamp: new Date(),
    });
  }

  showTestFailures(output) {
    // Extract and show relevant failure information
    const lines = output.split('\n');
    const failureLines = lines.filter(
      (line) =>
        line.includes('FAIL') ||
        line.includes('Error:') ||
        line.includes('Expected:') ||
        line.includes('Received:'),
    );

    if (failureLines.length > 0) {
      failureLines.slice(0, 5).forEach((_line) => {});
      if (failureLines.length > 5) {
      }
    }
  }

  extractPerformanceMetrics(output) {
    // Extract performance metrics from test output
    const metrics = {
      singleDocCreation: this.extractMetric(output, /Single document creation took: ([\d.]+)ms/),
      bulkOperations: this.extractMetric(output, /(\d+) documents created in: ([\d.]+)ms/),
      contextRetrieval: this.extractMetric(output, /Steering context retrieval: ([\d.]+)ms/),
    };
    if (metrics.singleDocCreation) {
    }
    if (metrics.contextRetrieval) {
    }
  }

  extractMetric(output, regex) {
    const match = output.match(regex);
    return match ? match[1] : null;
  }

  generateFinalReport() {
    const endTime = Date.now();
    const _totalDuration = endTime - this.startTime;

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter((r) => r.success).length;
    const failedTests = totalTests - passedTests;
    this.testResults.forEach((result) => {
      const _status = result.success ? chalk.green('✅ PASS') : chalk.red('❌ FAIL');
    });
    if (passedTests === totalTests) {
    } else if (passedTests >= totalTests * 0.8) {
    } else {
    }
    if (failedTests > 0) {
    } else {
    }

    // Exit with appropriate code
    process.exit(failedTests > 0 ? 1 : 0);
  }
}

// Check if this script is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new SteeringTestRunner();
  runner.runAllTests().catch((error) => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
}

export { SteeringTestRunner };
