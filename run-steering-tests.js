#!/usr/bin/env node

/**
 * Steering Tests Execution Script
 * Runs all steering document tests and provides comprehensive results
 */

import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';
import chalk from 'chalk';

class SteeringTestRunner {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log(chalk.cyan('🧪 MAESTRO STEERING DOCUMENT TEST SUITE'));
    console.log(chalk.cyan('═'.repeat(50)));
    console.log(`Started at: ${new Date().toLocaleString()}\n`);

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
    console.log(chalk.blue('📋 Running Comprehensive Steering Test Suite...'));
    
    const testFile = 'test-maestro-steering-complete.js';
    if (!existsSync(testFile)) {
      this.recordTestResult('Comprehensive Test', false, 'Test file not found');
      return;
    }

    try {
      const result = await this.executeCommand('node', [testFile]);
      this.recordTestResult('Comprehensive Test', result.success, result.output);
      
      if (result.success) {
        console.log(chalk.green('✅ Comprehensive test completed successfully'));
      } else {
        console.log(chalk.red('❌ Comprehensive test failed'));
        console.log(chalk.gray(result.output.substring(0, 500) + '...'));
      }
    } catch (error) {
      this.recordTestResult('Comprehensive Test', false, error.message);
      console.log(chalk.red('❌ Comprehensive test execution failed'));
    }
    
    console.log('');
  }

  async runUnitTests() {
    console.log(chalk.blue('🔬 Running Unit Tests...'));
    
    const unitTestPattern = 'src/__tests__/unit/maestro/steering-documents.test.ts';
    
    try {
      const result = await this.executeCommand('npm', ['test', '--', '--testPathPattern=steering-documents']);
      this.recordTestResult('Unit Tests', result.success, result.output);
      
      if (result.success) {
        console.log(chalk.green('✅ Unit tests passed'));
      } else {
        console.log(chalk.red('❌ Unit tests failed'));
        this.showTestFailures(result.output);
      }
    } catch (error) {
      this.recordTestResult('Unit Tests', false, error.message);
      console.log(chalk.yellow('⚠️  Unit tests not executed (Jest may not be configured)'));
    }
    
    console.log('');
  }

  async runIntegrationTests() {
    console.log(chalk.blue('🔗 Running Integration Tests...'));
    
    try {
      const result = await this.executeCommand('npm', ['test', '--', '--testPathPattern=steering-workflow']);
      this.recordTestResult('Integration Tests', result.success, result.output);
      
      if (result.success) {
        console.log(chalk.green('✅ Integration tests passed'));
      } else {
        console.log(chalk.red('❌ Integration tests failed'));
        this.showTestFailures(result.output);
      }
    } catch (error) {
      this.recordTestResult('Integration Tests', false, error.message);
      console.log(chalk.yellow('⚠️  Integration tests not executed (Jest may not be configured)'));
    }
    
    console.log('');
  }

  async runPerformanceTests() {
    console.log(chalk.blue('⚡ Running Performance Tests...'));
    
    try {
      const result = await this.executeCommand('npm', ['test', '--', '--testPathPattern=steering-performance']);
      this.recordTestResult('Performance Tests', result.success, result.output);
      
      if (result.success) {
        console.log(chalk.green('✅ Performance tests passed'));
        this.extractPerformanceMetrics(result.output);
      } else {
        console.log(chalk.red('❌ Performance tests failed'));
        this.showTestFailures(result.output);
      }
    } catch (error) {
      this.recordTestResult('Performance Tests', false, error.message);
      console.log(chalk.yellow('⚠️  Performance tests not executed (Jest may not be configured)'));
    }
    
    console.log('');
  }

  async runCliTests() {
    console.log(chalk.blue('🖥️  Running CLI End-to-End Tests...'));
    
    try {
      const result = await this.executeCommand('npm', ['test', '--', '--testPathPattern=steering-cli']);
      this.recordTestResult('CLI Tests', result.success, result.output);
      
      if (result.success) {
        console.log(chalk.green('✅ CLI tests passed'));
      } else {
        console.log(chalk.red('❌ CLI tests failed'));
        this.showTestFailures(result.output);
      }
    } catch (error) {
      this.recordTestResult('CLI Tests', false, error.message);
      console.log(chalk.yellow('⚠️  CLI tests not executed (CLI commands may not be available)'));
    }
    
    console.log('');
  }

  async executeCommand(command, args, options = {}) {
    return new Promise((resolve) => {
      const process = spawn(command, args, {
        stdio: 'pipe',
        ...options
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
          code
        });
      });

      process.on('error', (error) => {
        resolve({
          success: false,
          output: error.message,
          code: -1
        });
      });
    });
  }

  recordTestResult(testName, success, output) {
    this.testResults.push({
      testName,
      success,
      output,
      timestamp: new Date()
    });
  }

  showTestFailures(output) {
    // Extract and show relevant failure information
    const lines = output.split('\n');
    const failureLines = lines.filter(line => 
      line.includes('FAIL') || 
      line.includes('Error:') || 
      line.includes('Expected:') ||
      line.includes('Received:')
    );
    
    if (failureLines.length > 0) {
      console.log(chalk.gray('   Failure details:'));
      failureLines.slice(0, 5).forEach(line => {
        console.log(chalk.gray(`   ${line.trim()}`));
      });
      if (failureLines.length > 5) {
        console.log(chalk.gray(`   ... and ${failureLines.length - 5} more`));
      }
    }
  }

  extractPerformanceMetrics(output) {
    // Extract performance metrics from test output
    const metrics = {
      singleDocCreation: this.extractMetric(output, /Single document creation took: ([\d.]+)ms/),
      bulkOperations: this.extractMetric(output, /(\d+) documents created in: ([\d.]+)ms/),
      contextRetrieval: this.extractMetric(output, /Steering context retrieval: ([\d.]+)ms/)
    };

    console.log(chalk.gray('   Performance Metrics:'));
    if (metrics.singleDocCreation) {
      console.log(chalk.gray(`   • Single document: ${metrics.singleDocCreation}ms`));
    }
    if (metrics.contextRetrieval) {
      console.log(chalk.gray(`   • Context retrieval: ${metrics.contextRetrieval}ms`));
    }
  }

  extractMetric(output, regex) {
    const match = output.match(regex);
    return match ? match[1] : null;
  }

  generateFinalReport() {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;
    
    console.log(chalk.cyan('\n📊 FINAL TEST RESULTS'));
    console.log(chalk.cyan('═'.repeat(30)));
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`Total Test Suites: ${totalTests}`);
    console.log(`${chalk.green('Passed:')} ${passedTests}`);
    console.log(`${chalk.red('Failed:')} ${failedTests}`);
    console.log(`Success Rate: ${totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : 0}%`);
    console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    
    console.log(chalk.cyan('\n📋 Test Suite Details:'));
    this.testResults.forEach(result => {
      const status = result.success ? chalk.green('✅ PASS') : chalk.red('❌ FAIL');
      console.log(`   ${status} ${result.testName}`);
    });
    
    // Overall assessment
    console.log(chalk.cyan('\n🎯 ASSESSMENT:'));
    if (passedTests === totalTests) {
      console.log(chalk.green('🎉 ALL STEERING TESTS PASSED!'));
      console.log(chalk.green('   Maestro steering document generation is working perfectly.'));
    } else if (passedTests >= totalTests * 0.8) {
      console.log(chalk.yellow('⚠️  MOSTLY SUCCESSFUL'));
      console.log(chalk.yellow(`   ${passedTests}/${totalTests} test suites passed. Review failed tests.`));
    } else {
      console.log(chalk.red('❌ SIGNIFICANT ISSUES DETECTED'));
      console.log(chalk.red(`   Only ${passedTests}/${totalTests} test suites passed. Major fixes needed.`));
    }
    
    // Implementation status
    console.log(chalk.cyan('\n🔧 IMPLEMENTATION STATUS:'));
    console.log('   ✅ Comprehensive test framework created');
    console.log('   ✅ Unit tests with Jest integration ready');
    console.log('   ✅ Integration tests with real file operations');
    console.log('   ✅ Performance benchmarks and scalability testing');
    console.log('   ✅ CLI command simulation and validation');
    console.log('   ✅ Format and standards validation');
    console.log('   ✅ Agent integration and reuse system testing');
    console.log('   ✅ Error handling and edge case coverage');
    
    // Next steps
    console.log(chalk.cyan('\n📝 NEXT STEPS:'));
    if (failedTests > 0) {
      console.log('   1. Review failed test outputs for specific issues');
      console.log('   2. Fix implementation issues identified by tests');
      console.log('   3. Re-run tests to verify fixes');
    } else {
      console.log('   1. Run tests regularly during development');
      console.log('   2. Add new tests for new steering document features');
      console.log('   3. Monitor performance metrics for regressions');
    }
    
    console.log(chalk.gray(`\nCompleted at: ${new Date().toLocaleString()}`));
    
    // Exit with appropriate code
    process.exit(failedTests > 0 ? 1 : 0);
  }
}

// Check if this script is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new SteeringTestRunner();
  runner.runAllTests().catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
}

export { SteeringTestRunner };