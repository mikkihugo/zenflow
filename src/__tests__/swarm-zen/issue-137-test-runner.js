#!/usr/bin/env node
/**
 * Test Runner for Issue #137 - Session Persistence and Recovery
 *
 * This comprehensive test runner executes all test suites for Issue #137
 * and generates detailed reports on coverage, performance, and resilience.
 *
 * Usage:
 *   node test/issue-137-test-runner.js [options]
 *
 * Options:
 *   --comprehensive     Run all test suites (default)
 *   --unit-only         Run only unit tests
 *   --integration-only  Run only integration tests
 *   --performance-only  Run only performance tests
 *   --chaos-only        Run only chaos engineering tests
 *   --generate-report   Generate detailed HTML report
 *   --ci                Run in CI mode (faster, less detailed)
 */

import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
class TestRunner {
  constructor() {
    this.testSuites = [
      {
        id: 'comprehensive',
        name: 'Session Persistence Comprehensive Tests',
        file: 'session-persistence-comprehensive.test.js',
        categories: ['unit', 'integration', 'failure-scenarios', 'end-to-end'],
        timeout: 300000, // 5 minutes
        priority: 1,
      },
      {
        id: 'chaos',
        name: 'Chaos Engineering Tests',
        file: 'chaos-engineering-test-suite.test.js',
        categories: ['chaos', 'resilience', 'failure-injection'],
        timeout: 600000, // 10 minutes
        priority: 2,
      },
      {
        id: 'performance',
        name: 'Performance Benchmarks',
        file: 'performance-benchmarks.test.js',
        categories: ['performance', 'scalability', 'memory'],
        timeout: 900000, // 15 minutes
        priority: 3,
      },
    ];

    this.results = new Map();
    this.startTime = Date.now();
    this.options = this.parseArgs();
  }

  parseArgs() {
    const args = process.argv.slice(2);
    const options = {
      comprehensive: true,
      unitOnly: false,
      integrationOnly: false,
      performanceOnly: false,
      chaosOnly: false,
      generateReport: false,
      ci: false,
      verbose: false,
    };

    args.forEach((arg) => {
      switch (arg) {
        case '--unit-only':
          options.comprehensive = false;
          options.unitOnly = true;
          break;
        case '--integration-only':
          options.comprehensive = false;
          options.integrationOnly = true;
          break;
        case '--performance-only':
          options.comprehensive = false;
          options.performanceOnly = true;
          break;
        case '--chaos-only':
          options.comprehensive = false;
          options.chaosOnly = true;
          break;
        case '--generate-report':
          options.generateReport = true;
          break;
        case '--ci':
          options.ci = true;
          break;
        case '--verbose':
          options.verbose = true;
          break;
      }
    });

    return options;
  }

  async runTest(testSuite) {
    const startTime = Date.now();
    const testPath = join(__dirname, testSuite.file);

    return new Promise((resolve) => {
      const jestProcess = spawn(
        'npx',
        [
          'jest',
          testPath,
          '--verbose',
          '--coverage',
          '--testTimeout',
          testSuite.timeout.toString(),
          '--forceExit',
          '--detectOpenHandles',
          '--colors',
        ],
        {
          stdio: this.options.verbose ? 'inherit' : 'pipe',
          env: {
            ...process.env,
            NODE_OPTIONS:
              '--experimental-vm-modules --experimental-wasm-modules --max-old-space-size=4096',
          },
        }
      );

      let stdout = '';
      let stderr = '';

      if (!this.options.verbose) {
        jestProcess.stdout?.on('data', (data) => {
          stdout += data.toString();
        });

        jestProcess.stderr?.on('data', (data) => {
          stderr += data.toString();
        });
      }

      jestProcess.on('close', (code) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        const result = {
          testSuite: testSuite.id,
          name: testSuite.name,
          file: testSuite.file,
          exitCode: code,
          success: code === 0,
          duration,
          stdout,
          stderr,
          timestamp: new Date(),
          systemInfo: {
            platform: os.platform(),
            cpus: os.cpus().length,
            memory: os.totalmem(),
            nodeVersion: process.version,
          },
        };

        this.results.set(testSuite.id, result);

        if (result.success) {
        } else {
          if (!this.options.verbose && stderr) {
          }
        }

        resolve(result);
      });

      jestProcess.on('error', (error) => {
        console.error(`   💥 Process error: ${error.message}`);
        const result = {
          testSuite: testSuite.id,
          name: testSuite.name,
          file: testSuite.file,
          exitCode: -1,
          success: false,
          duration: Date.now() - startTime,
          error: error.message,
          timestamp: new Date(),
        };

        this.results.set(testSuite.id, result);
        resolve(result);
      });
    });
  }

  filterTestSuites() {
    if (this.options.comprehensive) {
      return this.testSuites;
    }

    return this.testSuites.filter((suite) => {
      if (this.options.unitOnly && suite.categories.includes('unit')) return true;
      if (this.options.integrationOnly && suite.categories.includes('integration')) return true;
      if (this.options.performanceOnly && suite.categories.includes('performance')) return true;
      if (this.options.chaosOnly && suite.categories.includes('chaos')) return true;
      return false;
    });
  }

  async runAllTests() {
    const suitesToRun = this.filterTestSuites();
    suitesToRun.forEach((_suite) => {});

    // Run tests based on priority
    const sortedSuites = suitesToRun.sort((a, b) => a.priority - b.priority);

    for (const suite of sortedSuites) {
      const result = await this.runTest(suite);

      if (!result.success && !this.options.ci) {
        // In a real implementation, you might want to prompt user
        // For now, continue with all tests
      }

      // Memory cleanup between tests
      if (global.gc) {
        global.gc();
      }

      // Brief pause between tests
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return this.generateSummary();
  }

  generateSummary() {
    const totalDuration = Date.now() - this.startTime;
    const results = Array.from(this.results.values());
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    const summary = {
      timestamp: new Date(),
      totalDuration,
      testSuitesRun: results.length,
      successful: successful.length,
      failed: failed.length,
      successRate: (successful.length / results.length) * 100,
      results: results.map((r) => ({
        name: r.name,
        success: r.success,
        duration: r.duration,
        exitCode: r.exitCode,
      })),
      systemInfo: results[0]?.systemInfo || {},
      options: this.options,
      coverage: this.extractCoverageInfo(),
      recommendations: this.generateRecommendations(),
    };

    this.printSummary(summary);

    if (this.options.generateReport) {
      this.generateHTMLReport(summary);
    }

    return summary;
  }

  extractCoverageInfo() {
    // Extract coverage information from test outputs
    const coverageInfo = {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
      details: [],
    };

    this.results.forEach((result, suiteId) => {
      if (result.stdout) {
        // Simple regex to extract coverage percentages
        const coverageMatch = result.stdout.match(
          /All files.*?(\d+\.?\d*)\s*\|\s*(\d+\.?\d*)\s*\|\s*(\d+\.?\d*)\s*\|\s*(\d+\.?\d*)/
        );
        if (coverageMatch) {
          coverageInfo.details.push({
            suite: suiteId,
            statements: parseFloat(coverageMatch[1]),
            branches: parseFloat(coverageMatch[2]),
            functions: parseFloat(coverageMatch[3]),
            lines: parseFloat(coverageMatch[4]),
          });
        }
      }
    });

    // Calculate average coverage
    if (coverageInfo.details.length > 0) {
      coverageInfo.statements =
        coverageInfo.details.reduce((sum, d) => sum + d.statements, 0) /
        coverageInfo.details.length;
      coverageInfo.branches =
        coverageInfo.details.reduce((sum, d) => sum + d.branches, 0) / coverageInfo.details.length;
      coverageInfo.functions =
        coverageInfo.details.reduce((sum, d) => sum + d.functions, 0) / coverageInfo.details.length;
      coverageInfo.lines =
        coverageInfo.details.reduce((sum, d) => sum + d.lines, 0) / coverageInfo.details.length;
    }

    return coverageInfo;
  }

  generateRecommendations() {
    const recommendations = [];
    const results = Array.from(this.results.values());
    const failed = results.filter((r) => !r.success);

    if (failed.length > 0) {
      recommendations.push(`${failed.length} test suite(s) failed - review error logs for issues`);
    }

    const longRunning = results.filter((r) => r.duration > 300000); // > 5 minutes
    if (longRunning.length > 0) {
      recommendations.push('Some tests took longer than 5 minutes - consider optimization');
    }

    const coverage = this.extractCoverageInfo();
    if (coverage.statements < 90) {
      recommendations.push('Code coverage below 90% - consider adding more unit tests');
    }

    if (results.every((r) => r.success)) {
      recommendations.push('All tests passed! Consider running in different environments');
    }

    if (recommendations.length === 0) {
      recommendations.push('No issues detected - test suite is healthy');
    }

    return recommendations;
  }

  printSummary(summary) {
    if (summary.coverage.statements > 0) {
    }
    summary.results.forEach((result) => {
      const _status = result.success ? '✅' : '❌';
      const _duration = (result.duration / 1000).toFixed(2);
    });
    summary.recommendations.forEach((_rec) => {});

    if (summary.failed === 0) {
    } else {
    }
  }

  async generateHTMLReport(summary) {
    const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Issue #137 Test Report - Session Persistence</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .metric { background: white; padding: 15px; border: 1px solid #dee2e6; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .success { color: #28a745; }
        .warning { color: #ffc107; }
        .danger { color: #dc3545; }
        .test-results { background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; }
        .test-result { padding: 15px; border-bottom: 1px solid #dee2e6; display: flex; justify-content: space-between; align-items: center; }
        .test-result:last-child { border-bottom: none; }
        .test-name { font-weight: 500; }
        .test-status { padding: 4px 8px; border-radius: 4px; font-size: 0.875em; }
        .status-success { background: #d4edda; color: #155724; }
        .status-failure { background: #f8d7da; color: #721c24; }
        .coverage-bar { background: #e9ecef; height: 20px; border-radius: 10px; overflow: hidden; margin-top: 5px; }
        .coverage-fill { height: 100%; background: linear-gradient(90deg, #dc3545, #ffc107, #28a745); transition: width 0.3s; }
        .recommendations { background: #e7f3ff; border-left: 4px solid #0056b3; padding: 15px; margin-top: 20px; }
        .timestamp { color: #6c757d; font-size: 0.875em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Issue #137 Test Report</h1>
        <h2>Session Persistence and Recovery System</h2>
        <p class="timestamp">Generated: ${summary.timestamp.toISOString()}</p>
        <p>Platform: ${summary.systemInfo.platform} | Node.js: ${summary.systemInfo.nodeVersion} | CPUs: ${summary.systemInfo.cpus}</p>
    </div>

    <div class="summary">
        <div class="metric">
            <div class="metric-value ${summary.successRate === 100 ? 'success' : summary.successRate >= 80 ? 'warning' : 'danger'}">
                ${summary.successRate.toFixed(1)}%
            </div>
            <div>Success Rate</div>
        </div>
        <div class="metric">
            <div class="metric-value">${summary.testSuitesRun}</div>
            <div>Test Suites</div>
        </div>
        <div class="metric">
            <div class="metric-value">${(summary.totalDuration / 1000).toFixed(1)}s</div>
            <div>Total Duration</div>
        </div>
        <div class="metric">
            <div class="metric-value ${summary.coverage.statements >= 90 ? 'success' : summary.coverage.statements >= 75 ? 'warning' : 'danger'}">
                ${summary.coverage.statements.toFixed(1)}%
            </div>
            <div>Coverage</div>
            <div class="coverage-bar">
                <div class="coverage-fill" style="width: ${summary.coverage.statements}%"></div>
            </div>
        </div>
    </div>

    <div class="test-results">
        <h3 style="margin: 0; padding: 15px; background: #f8f9fa; border-bottom: 1px solid #dee2e6;">Test Results</h3>
        ${summary.results
          .map(
            (result) => `
            <div class="test-result">
                <div>
                    <div class="test-name">${result.name}</div>
                    <div class="timestamp">Duration: ${(result.duration / 1000).toFixed(2)}s</div>
                </div>
                <div class="test-status ${result.success ? 'status-success' : 'status-failure'}">
                    ${result.success ? '✅ PASSED' : '❌ FAILED'}
                </div>
            </div>
        `
          )
          .join('')}
    </div>

    <div class="recommendations">
        <h3>💡 Recommendations</h3>
        <ul>
            ${summary.recommendations.map((rec) => `<li>${rec}</li>`).join('')}
        </ul>
    </div>

    <script>
        // Add some interactivity
        document.querySelectorAll('.test-result').forEach(result => {
            result.addEventListener('click', () => {
                result.style.background = result.style.background ? '' : '#f8f9fa';
            });
        });
    </script>
</body>
</html>`;

    const reportPath = join(__dirname, '..', 'test-reports', 'issue-137-report.html');

    try {
      await fs.mkdir(join(__dirname, '..', 'test-reports'), { recursive: true });
      await fs.writeFile(reportPath, htmlReport);
    } catch (error) {
      console.error('Failed to generate HTML report:', error.message);
    }
  }
}

// Run the tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new TestRunner();

  runner
    .runAllTests()
    .then((summary) => {
      process.exit(summary.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
}

export default TestRunner;
