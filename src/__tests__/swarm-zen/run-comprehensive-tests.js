#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * Executes all test suites with coverage and performance tracking
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import chalk from 'chalk';

const TEST_SUITES = [
  {
    name: 'Unit Tests - WASM Functions',
    command: 'vitest run test/unit/wasm-functions.test.js',
    critical: true,
  },
  {
    name: 'Integration Tests - JS-WASM Communication',
    command: 'vitest run test/integration/js-wasm-communication.test.js',
    critical: true,
  },
  {
    name: 'E2E Tests - Workflow Scenarios',
    command: 'vitest run test/e2e/workflow-scenarios.test.js',
    critical: true,
  },
  {
    name: 'Browser Tests - Cross-Browser Compatibility',
    command: 'vitest run test/browser/cross-browser-compatibility.test.js',
    critical: false,
    requiresBrowser: true,
  },
  {
    name: 'Performance Tests - Comprehensive Benchmarks',
    command: 'vitest run test/performance/comprehensive-benchmarks.test.js',
    critical: true,
  },
  {
    name: 'Existing Tests - Legacy Suite',
    command: 'npm run test:all',
    critical: false,
  },
];

class TestRunner {
  constructor() {
    this.results = [];
    this.startTime = performance.now();
    this.coverageData = {};
  }

  async run() {
    // Check prerequisites
    await this.checkPrerequisites();

    // Run each test suite
    for (const suite of TEST_SUITES) {
      await this.runTestSuite(suite);
    }

    // Generate reports
    await this.generateReports();

    // Display summary
    this.displaySummary();

    // Exit with appropriate code
    const failedCritical = this.results.some((r) => r.critical && !r.success);
    process.exit(failedCritical ? 1 : 0);
  }

  async checkPrerequisites() {
    // Check WASM files
    const wasmExists = await fs
      .access(path.join(process.cwd(), 'wasm/ruv_swarm_wasm_bg.wasm'))
      .then(() => true)
      .catch(() => false);

    if (!wasmExists) {
      await this.runCommand('npm run build:wasm');
    }

    // Check node version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1), 10);
    if (majorVersion < 14) {
      console.error(chalk.red(`❌ Node.js ${nodeVersion} is too old. Required: >= 14.0.0`));
      process.exit(1);
    }
  }

  async runTestSuite(suite) {
    if (suite.requiresBrowser && process.env.CI) {
      this.results.push({
        ...suite,
        success: true,
        skipped: true,
        duration: 0,
      });
      return;
    }

    const suiteStart = performance.now();

    try {
      const result = await this.runCommand(suite.command, {
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_ENV: 'test',
          FORCE_COLOR: '1',
        },
      });

      const duration = performance.now() - suiteStart;

      this.results.push({
        ...suite,
        success: result.code === 0,
        duration,
        output: result.output,
      });

      if (result.code === 0) {
      } else {
      }
    } catch (error) {
      const duration = performance.now() - suiteStart;
      console.error(chalk.red(`❌ ${suite.name} error: ${error.message}`));

      this.results.push({
        ...suite,
        success: false,
        duration,
        error: error.message,
      });
    }
  }

  async runCommand(command, options = {}) {
    return new Promise((resolve) => {
      const [cmd, ...args] = command.split(' ');
      const child = spawn(cmd, args, {
        shell: true,
        ...options,
      });

      let output = '';

      if (options.stdio !== 'inherit') {
        child.stdout.on('data', (data) => {
          output += data.toString();
        });

        child.stderr.on('data', (data) => {
          output += data.toString();
        });
      }

      child.on('close', (code) => {
        resolve({ code, output });
      });
    });
  }

  async generateReports() {
    const reportDir = path.join(process.cwd(), 'test-reports');
    await fs.mkdir(reportDir, { recursive: true });

    // Test results report
    const testReport = {
      timestamp: new Date().toISOString(),
      duration: performance.now() - this.startTime,
      suites: this.results,
      summary: {
        total: this.results.length,
        passed: this.results.filter((r) => r.success).length,
        failed: this.results.filter((r) => !r.success && !r.skipped).length,
        skipped: this.results.filter((r) => r.skipped).length,
      },
    };

    await fs.writeFile(
      path.join(reportDir, `test-report-${Date.now()}.json`),
      JSON.stringify(testReport, null, 2),
    );

    // Coverage report
    try {
      const coverageFile = path.join(process.cwd(), 'coverage/coverage-summary.json');
      const coverageData = JSON.parse(await fs.readFile(coverageFile, 'utf-8'));

      this.coverageData = coverageData.total;

      // Generate coverage badge
      const coveragePercent = coverageData.total.lines.pct;
      const _badgeColor =
        coveragePercent >= 90 ? 'green' : coveragePercent >= 80 ? 'yellow' : 'red';
    } catch (_error) {}

    // Performance summary
    const perfReport = await this.generatePerformanceReport();
    await fs.writeFile(
      path.join(reportDir, 'performance-summary.json'),
      JSON.stringify(perfReport, null, 2),
    );
  }

  async generatePerformanceReport() {
    // Extract performance metrics from test results
    const metrics = {
      wasmInitialization: { target: 200, actual: null },
      agentCreation: { target: 5, actual: null },
      neuralInference: { target: 5, actual: null },
      messageThoughput: { target: 10000, actual: null },
    };

    // Parse performance test output
    const perfTest = this.results.find((r) => r.name.includes('Performance'));
    if (perfTest?.output) {
      // Extract metrics from output (simplified)
      const lines = perfTest.output.split('\n');
      lines.forEach((line) => {
        if (line.includes('initialization:')) {
          const match = line.match(/avg=(\d+\.?\d*)/);
          if (match) {
            metrics.wasmInitialization.actual = parseFloat(match[1]);
          }
        }
        // ... parse other metrics
      });
    }

    return {
      timestamp: new Date().toISOString(),
      metrics,
      meetsTargets: Object.values(metrics).every((m) => m.actual === null || m.actual <= m.target),
    };
  }

  displaySummary() {
    const _totalDuration = (performance.now() - this.startTime) / 1000;
    this.results.forEach((result) => {
      const _icon = result.skipped ? '⚪' : result.success ? '✅' : '❌';
      const _time = result.duration ? ` (${(result.duration / 1000).toFixed(2)}s)` : '';
    });

    // Coverage summary
    if (this.coverageData.lines) {
    }

    // Overall summary
    const _passed = this.results.filter((r) => r.success).length;
    const failed = this.results.filter((r) => !r.success && !r.skipped).length;
    const _skipped = this.results.filter((r) => r.skipped).length;

    if (failed === 0) {
    } else {
    }
  }
}

// Run tests
const runner = new TestRunner();
runner.run().catch((error) => {
  console.error(chalk.red('Fatal error:', error));
  process.exit(1);
});
