#!/usr/bin/env node

/**
 * Integration Test Runner for ruv-swarm
 * Comprehensive end-to-end testing suite
 */

const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const chalk = require('chalk');

class IntegrationTestRunner {
  constructor() {
    this.testSuites = [
      {
        name: 'Lifecycle Tests',
        path: 'scenarios/lifecycle/full-workflow.test.js',
        timeout: 60000,
        parallel: false,
        critical: true,
      },
      {
        name: 'Resilience Tests',
        path: 'scenarios/resilience/error-recovery.test.js',
        timeout: 45000,
        parallel: false,
        critical: true,
      },
      {
        name: 'Performance Tests',
        path: 'scenarios/performance/load-testing.test.js',
        timeout: 120000,
        parallel: true,
        critical: false,
      },
      {
        name: 'Cross-Feature Integration',
        path: 'scenarios/cross-feature/system-integration.test.js',
        timeout: 90000,
        parallel: false,
        critical: true,
      },
    ];

    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      suites: [],
    };

    this.config = {
      parallel: process.env.PARALLEL_TESTS === 'true',
      verbose: process.env.VERBOSE === 'true',
      bail: process.env.BAIL_ON_FAILURE === 'true',
      coverage: process.env.COVERAGE === 'true',
      environment: process.env.NODE_ENV || 'test',
    };
  }

  async run() {
    this.logConfig();
    await this.setupEnvironment();

    const startTime = Date.now();

    try {
      if (this.config.parallel) {
        await this.runParallel();
      } else {
        await this.runSequential();
      }
    } catch (error) {
      console.error(chalk.red.bold('\n❌ Test execution failed:'), error.message);
      process.exit(1);
    }

    this.results.duration = Date.now() - startTime;
    this.generateReport();

    process.exit(this.results.failed > 0 ? 1 : 0);
  }

  logConfig() {}

  async setupEnvironment() {
    // Ensure test database is clean
    try {
      const dbPath = path.join(__dirname, '../../data/test-ruv-swarm.db');
      if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
      }
    } catch (_error) {
      console.warn(chalk.yellow('Warning: Could not clean test database'));
    }

    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.RUV_SWARM_TEST_MODE = 'true';
    process.env.RUV_SWARM_LOG_LEVEL = this.config.verbose ? 'debug' : 'error';
  }

  async runSequential() {
    for (const suite of this.testSuites) {
      if (this.config.bail && this.results.failed > 0) {
        break;
      }

      await this.runSuite(suite);
    }
  }

  async runParallel() {
    const parallelSuites = this.testSuites.filter((s) => s.parallel);
    const sequentialSuites = this.testSuites.filter((s) => !s.parallel);

    // Run parallel suites first
    if (parallelSuites.length > 0) {
      const parallelPromises = parallelSuites.map((suite) => this.runSuite(suite));
      await Promise.all(parallelPromises);
    }

    // Run sequential suites
    for (const suite of sequentialSuites) {
      if (this.config.bail && this.results.failed > 0) {
        break;
      }
      await this.runSuite(suite);
    }
  }

  async runSuite(suite) {
    const startTime = Date.now();
    const suitePath = path.join(__dirname, suite.path);

    try {
      const result = await this.executeMocha(suitePath, suite);

      const duration = Date.now() - startTime;
      const status = result.exitCode === 0 ? 'PASSED' : 'FAILED';
      const _statusColor = result.exitCode === 0 ? 'green' : 'red';

      if (this.config.verbose && result.output) {
      }

      this.results.suites.push({
        name: suite.name,
        status,
        duration,
        exitCode: result.exitCode,
        output: result.output,
        critical: suite.critical,
      });

      if (result.exitCode === 0) {
        this.results.passed++;
      } else {
        this.results.failed++;
        if (suite.critical) {
        }
      }

      this.results.total++;
    } catch (error) {
      this.results.suites.push({
        name: suite.name,
        status: 'ERROR',
        duration: Date.now() - startTime,
        error: error.message,
        critical: suite.critical,
      });

      this.results.failed++;
      this.results.total++;
    }
  }

  executeMocha(testPath, suite) {
    return new Promise((resolve) => {
      const args = [
        testPath,
        '--timeout',
        suite.timeout.toString(),
        '--reporter',
        this.config.verbose ? 'spec' : 'json',
      ];

      if (this.config.coverage) {
        args.unshift('--require', 'nyc/index.js');
      }

      const mocha = spawn('npx', ['mocha', ...args], {
        cwd: path.join(__dirname, '../..'),
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let output = '';
      let error = '';

      mocha.stdout.on('data', (data) => {
        output += data.toString();
      });

      mocha.stderr.on('data', (data) => {
        error += data.toString();
      });

      mocha.on('close', (exitCode) => {
        resolve({
          exitCode,
          output: output || error,
          error: exitCode !== 0 ? error : null,
        });
      });

      mocha.on('error', (err) => {
        resolve({
          exitCode: 1,
          output: '',
          error: err.message,
        });
      });
    });
  }

  generateReport() {
    // Summary
    const _successRate =
      this.results.total > 0 ? ((this.results.passed / this.results.total) * 100).toFixed(1) : 0;
    const _durationSeconds = (this.results.duration / 1000).toFixed(2);
    this.results.suites.forEach((suite) => {
      const _icon = suite.status === 'PASSED' ? '✅' : suite.status === 'ERROR' ? '💥' : '❌';
      const _critical = suite.critical ? ' [CRITICAL]' : '';
      const _duration = `${suite.duration}ms`;

      if (suite.error && this.config.verbose) {
      }
    });

    // Critical failures
    const criticalFailures = this.results.suites.filter((s) => s.critical && s.status !== 'PASSED');
    if (criticalFailures.length > 0) {
      criticalFailures.forEach((_suite) => {});
    }

    // Coverage information
    if (this.config.coverage) {
    }

    // Recommendations
    this.generateRecommendations();

    // Save results
    this.saveResults();
  }

  generateRecommendations() {
    if (this.results.failed === 0) {
      return;
    }

    const criticalFailures = this.results.suites.filter(
      (s) => s.critical && s.status !== 'PASSED',
    ).length;

    if (criticalFailures > 0) {
    }

    const performanceFailures = this.results.suites.filter(
      (s) => s.name.includes('Performance') && s.status !== 'PASSED',
    ).length;

    if (performanceFailures > 0) {
    }

    const resilienceFailures = this.results.suites.filter(
      (s) => s.name.includes('Resilience') && s.status !== 'PASSED',
    ).length;

    if (resilienceFailures > 0) {
    }
  }

  saveResults() {
    const resultsPath = path.join(__dirname, '../../test-results/integration-results.json');
    const resultsDir = path.dirname(resultsPath);

    try {
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }

      const fullResults = {
        ...this.results,
        timestamp: new Date().toISOString(),
        environment: this.config.environment,
        configuration: this.config,
      };

      fs.writeFileSync(resultsPath, JSON.stringify(fullResults, null, 2));
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Could not save results - ${error.message}`));
    }
  }
}

// Run integration tests if called directly
if (require.main === module) {
  const runner = new IntegrationTestRunner();
  runner.run().catch((error) => {
    console.error(chalk.red.bold('Fatal error:'), error);
    process.exit(1);
  });
}

module.exports = IntegrationTestRunner;
