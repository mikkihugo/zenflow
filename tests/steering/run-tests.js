#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Steering Document Framework
 * 
 * Orchestrates all steering tests including unit tests, integration tests,
 * performance benchmarks, and quality validation.
 */

import { spawn } from 'child_process';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SteeringTestFramework } from './steering-test-framework.js';
import SteeringIntegrationTests from './steering-integration-tests.js';
import { SteeringQualityValidator } from './steering-quality-validator.js';
import { generateSteeringScenarios, PERFORMANCE_CONFIGS } from './steering-mock-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test runner configuration
const RUNNER_CONFIG = {
  outputDir: join(__dirname, 'test-results'),
  reportFormat: process.env.TEST_REPORT_FORMAT || 'console', // console, json, html
  parallel: process.env.TEST_PARALLEL !== 'false',
  coverage: process.env.TEST_COVERAGE === 'true',
  bailOnFailure: process.env.TEST_BAIL === 'true',
  verbose: process.env.TEST_VERBOSE === 'true',
  filterPattern: process.env.TEST_FILTER || null,
  timeout: parseInt(process.env.TEST_TIMEOUT) || 300000, // 5 minutes default
  retries: parseInt(process.env.TEST_RETRIES) || 1
};

class SteeringTestRunner {
  constructor() {
    this.results = {
      startTime: Date.now(),
      endTime: null,
      suites: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      },
      performance: {},
      coverage: null
    };
  }

  /**
   * Main test runner entry point
   */
  async run(args = []) {
    console.log('🧪 STEERING DOCUMENT TEST RUNNER');
    console.log('='.repeat(80));
    console.log(`🔧 Configuration:`);
    console.log(`   • Parallel execution: ${RUNNER_CONFIG.parallel}`);
    console.log(`   • Coverage analysis: ${RUNNER_CONFIG.coverage}`);
    console.log(`   • Bail on failure: ${RUNNER_CONFIG.bailOnFailure}`);
    console.log(`   • Timeout: ${RUNNER_CONFIG.timeout}ms`);
    console.log(`   • Report format: ${RUNNER_CONFIG.reportFormat}`);
    if (RUNNER_CONFIG.filterPattern) {
      console.log(`   • Filter pattern: ${RUNNER_CONFIG.filterPattern}`);
    }
    console.log('');

    try {
      await this.setup();

      // Determine which test suites to run
      const suites = this.getTestSuites(args);
      
      if (RUNNER_CONFIG.parallel && suites.length > 1) {
        await this.runSuitesParallel(suites);
      } else {
        await this.runSuitesSequential(suites);
      }

      await this.generateReport();
      
      const success = this.results.summary.failed === 0;
      
      if (success) {
        console.log('\n🎉 All tests passed!');
      } else {
        console.log(`\n💥 ${this.results.summary.failed} test(s) failed!`);
      }

      return success;

    } catch (error) {
      console.error('💥 Test runner crashed:', error);
      return false;
    }
  }

  /**
   * Setup test environment
   */
  async setup() {
    console.log('🔧 Setting up test environment...');
    
    await mkdir(RUNNER_CONFIG.outputDir, { recursive: true });
    
    // Check dependencies
    await this.checkDependencies();
    
    console.log('✅ Test environment ready\n');
  }

  /**
   * Check if required dependencies are available
   */
  async checkDependencies() {
    const requiredDeps = ['natural']; // For NLP analysis
    
    for (const dep of requiredDeps) {
      try {
        await import(dep);
      } catch (error) {
        console.warn(`⚠️ Optional dependency '${dep}' not available - some features may be limited`);
      }
    }
  }

  /**
   * Determine which test suites to run based on arguments
   */
  getTestSuites(args) {
    const allSuites = [
      { name: 'unit', description: 'Unit Tests', runner: this.runUnitTests.bind(this) },
      { name: 'integration', description: 'Integration Tests', runner: this.runIntegrationTests.bind(this) },
      { name: 'quality', description: 'Quality Validation', runner: this.runQualityTests.bind(this) },
      { name: 'performance', description: 'Performance Benchmarks', runner: this.runPerformanceTests.bind(this) }
    ];

    if (args.length === 0) {
      return allSuites; // Run all suites by default
    }

    // Filter suites based on arguments
    return allSuites.filter(suite => 
      args.includes(suite.name) || 
      (RUNNER_CONFIG.filterPattern && suite.name.includes(RUNNER_CONFIG.filterPattern))
    );
  }

  /**
   * Run test suites in parallel
   */
  async runSuitesParallel(suites) {
    console.log(`⚡ Running ${suites.length} test suites in parallel...\n`);
    
    const suitePromises = suites.map(async (suite) => {
      const startTime = Date.now();
      
      try {
        console.log(`🚀 Starting ${suite.description}...`);
        const result = await this.runWithTimeout(suite.runner(), RUNNER_CONFIG.timeout);
        
        const duration = Date.now() - startTime;
        const suiteResult = {
          name: suite.name,
          description: suite.description,
          success: result.success ?? true,
          duration,
          tests: result.tests || result.total || 0,
          passed: result.passed || 0,
          failed: result.failed || 0,
          skipped: result.skipped || 0,
          details: result
        };
        
        this.results.suites.push(suiteResult);
        this.updateSummary(suiteResult);
        
        console.log(`✅ ${suite.description} completed (${duration}ms)`);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        const suiteResult = {
          name: suite.name,
          description: suite.description,
          success: false,
          duration,
          tests: 0,
          passed: 0,
          failed: 1,
          skipped: 0,
          error: error.message,
          details: null
        };
        
        this.results.suites.push(suiteResult);
        this.updateSummary(suiteResult);
        
        console.log(`❌ ${suite.description} failed (${duration}ms): ${error.message}`);
        
        if (RUNNER_CONFIG.bailOnFailure) {
          throw error;
        }
      }
    });

    await Promise.all(suitePromises);
  }

  /**
   * Run test suites sequentially
   */
  async runSuitesSequential(suites) {
    console.log(`🔄 Running ${suites.length} test suites sequentially...\n`);
    
    for (const suite of suites) {
      const startTime = Date.now();
      
      try {
        console.log(`🚀 Running ${suite.description}...`);
        const result = await this.runWithTimeout(suite.runner(), RUNNER_CONFIG.timeout);
        
        const duration = Date.now() - startTime;
        const suiteResult = {
          name: suite.name,
          description: suite.description,
          success: result.success ?? true,
          duration,
          tests: result.tests || result.total || 0,
          passed: result.passed || 0,
          failed: result.failed || 0,
          skipped: result.skipped || 0,
          details: result
        };
        
        this.results.suites.push(suiteResult);
        this.updateSummary(suiteResult);
        
        console.log(`✅ ${suite.description} completed (${duration}ms)\n`);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        const suiteResult = {
          name: suite.name,
          description: suite.description,
          success: false,
          duration,
          tests: 0,
          passed: 0,
          failed: 1,
          skipped: 0,
          error: error.message,
          details: null
        };
        
        this.results.suites.push(suiteResult);
        this.updateSummary(suiteResult);
        
        console.log(`❌ ${suite.description} failed (${duration}ms): ${error.message}\n`);
        
        if (RUNNER_CONFIG.bailOnFailure) {
          throw error;
        }
      }
    }
  }

  /**
   * Run unit tests
   */
  async runUnitTests() {
    const framework = new SteeringTestFramework();
    const success = await framework.runAllTests();
    
    return {
      success,
      total: framework.results.total,
      passed: framework.results.passed,
      failed: framework.results.failed,
      skipped: framework.results.skipped,
      performance: framework.results.performance,
      errors: framework.results.errors
    };
  }

  /**
   * Run integration tests
   */
  async runIntegrationTests() {
    const integrationTests = new SteeringIntegrationTests();
    const success = await integrationTests.runAllTests();
    
    return {
      success,
      total: integrationTests.results.total,
      passed: integrationTests.results.passed,
      failed: integrationTests.results.failed,
      performance: integrationTests.results.performance,
      errors: integrationTests.results.errors
    };
  }

  /**
   * Run quality validation tests
   */
  async runQualityTests() {
    console.log('📊 Running quality validation tests...');
    
    const validator = new SteeringQualityValidator({ enableNLP: true });
    const scenarios = generateSteeringScenarios(20);
    
    let passed = 0;
    let failed = 0;
    const qualityResults = [];
    
    for (const scenario of scenarios) {
      try {
        const validation = await validator.validateDocument(
          scenario.content, 
          scenario.domain, 
          'standard'
        );
        
        qualityResults.push({
          scenario: scenario.id,
          passed: validation.passed,
          score: validation.overallScore,
          issues: validation.issues.length
        });
        
        if (validation.passed) {
          passed++;
        } else {
          failed++;
        }
        
      } catch (error) {
        failed++;
        qualityResults.push({
          scenario: scenario.id,
          passed: false,
          error: error.message
        });
      }
    }
    
    return {
      success: failed === 0,
      total: scenarios.length,
      passed,
      failed,
      skipped: 0,
      qualityResults,
      averageScore: qualityResults.reduce((sum, r) => sum + (r.score || 0), 0) / qualityResults.length
    };
  }

  /**
   * Run performance benchmark tests
   */
  async runPerformanceTests() {
    console.log('🚀 Running performance benchmark tests...');
    
    const benchmarkResults = [];
    
    for (const config of PERFORMANCE_CONFIGS) {
      const startTime = Date.now();
      
      try {
        console.log(`  📊 Running ${config.name} benchmark...`);
        
        const scenarios = generateSteeringScenarios(config.scenarios);
        const framework = new SteeringTestFramework();
        await framework.setup();
        
        // Run benchmark
        const batchPromises = [];
        for (let i = 0; i < scenarios.length; i += config.concurrency) {
          const batch = scenarios.slice(i, i + config.concurrency);
          
          const batchPromise = Promise.all(batch.map(async (scenario) => {
            const docStartTime = Date.now();
            
            await framework.orchestrator.createSteeringDocument(scenario.domain, scenario.content);
            
            return Date.now() - docStartTime;
          }));
          
          batchPromises.push(batchPromise);
        }
        
        const batchResults = await Promise.all(batchPromises);
        const allDurations = batchResults.flat();
        
        const totalDuration = Date.now() - startTime;
        const avgDuration = allDurations.reduce((a, b) => a + b, 0) / allDurations.length;
        const throughput = (scenarios.length / totalDuration) * 1000;
        
        benchmarkResults.push({
          config: config.name,
          scenarios: config.scenarios,
          concurrency: config.concurrency,
          totalDuration,
          avgDuration,
          throughput,
          maxDuration: Math.max(...allDurations),
          minDuration: Math.min(...allDurations),
          success: totalDuration <= config.maxExecutionTime
        });
        
        await framework.cleanup();
        
      } catch (error) {
        benchmarkResults.push({
          config: config.name,
          success: false,
          error: error.message
        });
      }
    }
    
    const successfulBenchmarks = benchmarkResults.filter(r => r.success).length;
    
    return {
      success: successfulBenchmarks === benchmarkResults.length,
      total: benchmarkResults.length,
      passed: successfulBenchmarks,
      failed: benchmarkResults.length - successfulBenchmarks,
      skipped: 0,
      benchmarkResults
    };
  }

  /**
   * Run function with timeout
   */
  async runWithTimeout(promise, timeoutMs) {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Test timeout exceeded')), timeoutMs);
      })
    ]);
  }

  /**
   * Update overall summary with suite results
   */
  updateSummary(suiteResult) {
    this.results.summary.total += suiteResult.tests;
    this.results.summary.passed += suiteResult.passed;
    this.results.summary.failed += suiteResult.failed;
    this.results.summary.skipped += suiteResult.skipped;
  }

  /**
   * Generate test report
   */
  async generateReport() {
    this.results.endTime = Date.now();
    this.results.summary.duration = this.results.endTime - this.results.startTime;
    
    const reportPath = join(RUNNER_CONFIG.outputDir, `test-results-${Date.now()}.json`);
    await writeFile(reportPath, JSON.stringify(this.results, null, 2));
    
    switch (RUNNER_CONFIG.reportFormat) {
      case 'json':
        await this.generateJsonReport();
        break;
      case 'html':
        await this.generateHtmlReport();
        break;
      default:
        this.generateConsoleReport();
    }
  }

  /**
   * Generate console report
   */
  generateConsoleReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST EXECUTION SUMMARY');
    console.log('='.repeat(80));
    
    // Overall summary
    console.log(`🔢 Total Tests: ${this.results.summary.total}`);
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`⏭️ Skipped: ${this.results.summary.skipped}`);
    console.log(`⏱️ Duration: ${this.results.summary.duration}ms`);
    console.log(`🎯 Success Rate: ${((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)}%`);
    
    // Suite breakdown
    console.log('\n📋 Suite Breakdown:');
    this.results.suites.forEach(suite => {
      const status = suite.success ? '✅' : '❌';
      console.log(`   ${status} ${suite.description}: ${suite.passed}/${suite.tests} passed (${suite.duration}ms)`);
    });
    
    // Performance summary
    if (this.results.suites.some(s => s.name === 'performance')) {
      console.log('\n⚡ Performance Summary:');
      const perfSuite = this.results.suites.find(s => s.name === 'performance');
      if (perfSuite.details && perfSuite.details.benchmarkResults) {
        perfSuite.details.benchmarkResults.forEach(result => {
          if (result.success) {
            console.log(`   • ${result.config}: ${result.throughput.toFixed(2)} docs/sec, ${result.avgDuration.toFixed(0)}ms avg`);
          }
        });
      }
    }
    
    // Failures
    const failedSuites = this.results.suites.filter(s => !s.success);
    if (failedSuites.length > 0) {
      console.log('\n❌ Failed Suites:');
      failedSuites.forEach(suite => {
        console.log(`   • ${suite.description}: ${suite.error || 'Unknown error'}`);
      });
    }
  }

  /**
   * Generate JSON report
   */
  async generateJsonReport() {
    const jsonPath = join(RUNNER_CONFIG.outputDir, 'test-report.json');
    await writeFile(jsonPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 JSON report saved to: ${jsonPath}`);
  }

  /**
   * Generate HTML report
   */
  async generateHtmlReport() {
    const htmlContent = this.generateHtmlContent();
    const htmlPath = join(RUNNER_CONFIG.outputDir, 'test-report.html');
    await writeFile(htmlPath, htmlContent);
    console.log(`\n📄 HTML report saved to: ${htmlPath}`);
  }

  /**
   * Generate HTML report content
   */
  generateHtmlContent() {
    const successRate = ((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1);
    
    return `<!DOCTYPE html>
<html>
<head>
  <title>Steering Document Test Results</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
    .summary { display: flex; gap: 20px; margin: 20px 0; }
    .metric { background: white; border: 1px solid #ddd; padding: 15px; border-radius: 5px; text-align: center; }
    .suite { margin: 10px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
    .success { border-left: 5px solid #4CAF50; }
    .failure { border-left: 5px solid #f44336; }
    .performance { background: #f9f9f9; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🧪 Steering Document Test Results</h1>
    <p>Generated: ${new Date().toISOString()}</p>
    <p>Duration: ${this.results.summary.duration}ms</p>
  </div>
  
  <div class="summary">
    <div class="metric">
      <h3>${this.results.summary.total}</h3>
      <p>Total Tests</p>
    </div>
    <div class="metric">
      <h3>${this.results.summary.passed}</h3>
      <p>Passed</p>
    </div>
    <div class="metric">
      <h3>${this.results.summary.failed}</h3>
      <p>Failed</p>
    </div>
    <div class="metric">
      <h3>${successRate}%</h3>
      <p>Success Rate</p>
    </div>
  </div>
  
  <h2>Test Suites</h2>
  ${this.results.suites.map(suite => `
    <div class="suite ${suite.success ? 'success' : 'failure'}">
      <h3>${suite.success ? '✅' : '❌'} ${suite.description}</h3>
      <p>Tests: ${suite.tests} | Passed: ${suite.passed} | Failed: ${suite.failed} | Duration: ${suite.duration}ms</p>
      ${suite.error ? `<p style="color: red;">Error: ${suite.error}</p>` : ''}
    </div>
  `).join('')}
  
</body>
</html>`;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const runner = new SteeringTestRunner();
  
  try {
    const success = await runner.run(args);
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  }
}

// Export for programmatic use
export { SteeringTestRunner };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}