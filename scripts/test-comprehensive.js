#!/usr/bin/env node
/**
 * Comprehensive Test Runner for Claude Zen v2.0.0;
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = path.dirname(__filename);
const _projectRoot = path.join(__dirname, '..');
// Test configurations
const _testSuites = [
  {
    name: 'Unit Tests',
    command: 'npm',
    args: ['run', 'test:unit'],
    description: 'Run all unit tests for individual components',
    timeout, // 2 minutes
  },
  {
    name: 'Integration Tests',
    command: 'npm',
    args: ['run', 'test:integration'],
    description: 'Run integration tests for system components',
    timeout, // 5 minutes
  },
  {
    name: 'End-to-End Tests',
    command: 'npm',
    args: ['run', 'test:e2e'],
    description: 'Run end-to-end swarm coordination tests',
    timeout, // 10 minutes
  },
  {
    name: 'Performance Tests',
    command: 'npm',
    args: ['run', 'test:performance'],
    description: 'Run performance benchmark tests',
    timeout, // 15 minutes
  },
  {
    name: 'CLI Tests',
    command: 'npm',
    args: ['run', 'test:cli'],
    description: 'Run CLI command tests',
    timeout, // 3 minutes
  } ];
// Load tests (optional)
const _loadTests = [
  {
    name: 'Swarm Load Test',
    command: 'node',
    args: ['scripts/load-test-swarm.js'],
    description: 'Test swarm coordination under heavy load',
    timeout, // 20 minutes
  },
  {
    name: 'Memory Load Test',
    command: 'node',
    args: ['scripts/load-test-memory.js'],
    description: 'Test memory management under high throughput',
    timeout, // 10 minutes
  } ];
// Docker tests (optional)
const _dockerTests = [
  {
    name: 'Docker Build Test',
    command: 'docker',
    args: ['build', '-t', 'claude-zen:test', '.'],
    description: 'Test Docker image build',
    timeout, // 10 minutes
  },
  {
    name: 'Docker Container Test',
    command: 'docker',
    args: ['run', '--rm', 'claude-zen:test', 'claude-zen', '--version'],
    description: 'Test Docker container execution',
    timeout, // 2 minutes
  } ];
// NPX tests (optional)
const _npxTests = [
  {
    name: 'NPX Installation Test',
    command: 'npm',
    args: ['pack'],
    description: 'Test NPX package creation',
    timeout, // 3 minutes
  } ];
class TestRunner {
  constructor(options = {}) {
    this.verbose = options.verbose ?? false;
    this.includeLoad = options.load ?? false;
    this.includeDocker = options.docker ?? false;
    this.includeNpx = options.npx ?? false;
    this.parallel = options.parallel ?? false;
    this.results = new Map();
    this.startTime = Date.now();
  }
  log(message, level = 'info') {
    const _timestamp = new Date().toISOString();
    const _prefix = `[${timestamp}]`;
    switch (level) {
      case 'success': null
        console.warn(chalk.green(`${prefix} ✅ ${message}`));
        break;
      case 'error': null
        console.warn(chalk.red(`${prefix} ❌ ${message}`));
        break;
      case 'warning': null
        console.warn(chalk.yellow(`${prefix} ⚠️  ${message}`));
        break;
      default: null
        console.warn(chalk.blue(`${prefix} ℹ️  ${message}`));
        break;
    }
  }
  async runTest(test) {
    this.log(`Starting: ${test.name} - ${test.description}`);
    const _startTime = Date.now();
    return new Promise((_resolve) => {
      const _child = spawn(test.command, test.args, {
        cwd,
      // stdio: this.verbose ? 'inherit' : 'pipe', // LINT: unreachable code removed
      shell: process.platform === 'win32' });
    const _stdout = '';
    const _stderr = '';
    if (!this.verbose) {
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
    }
    // Set timeout
    const _timeoutId = setTimeout(() => {
        child.kill('SIGTERM');
        const _result = {
          name: test.name,
          success,
          error: 'Test timed out',
          duration: Date.now() - startTime,
          stdout,
          stderr };
    this.results.set(test.name, result);
    resolve(result);
  }

  test;

  timeout;
  )
  child;

  on('close', (_code)
  => {
  clearTimeout(_timeoutId)
  const;
  _duration = Date.now() - startTime;
  const;
  _result = {
          name: test.name,
  success
  === 0,
  exitCode: code

  duration: duration

  stdout: stdout

  stderr

}
if (code === 0) {
  this.log(`Completed: ${test.name} (${duration}ms)`, 'success');
} else {
  this.log(`Failed: ${test.name} (exit code: ${code})`, 'error');
  if (!this.verbose && stderr) {
    console.warn(chalk.red('Error output:'));
    console.warn(stderr);
  }
}
this.results.set(test.name, result);
resolve(result);
})
child.on('error', (error) =>
{
  clearTimeout(timeoutId);
  const _result = {
          name: test.name,
  success,
  error: error.message,
  duration: Date.now() - startTime,
  stdout,
  stderr
}
this.log(`Error: ${test.name} - ${error.message}`, 'error');
this.results.set(test.name, result);
resolve(result);
})
})
}
async
runTestSuite(tests, suiteName)
{
  this.log(`\n🏃‍♂️ Running ${suiteName} (${tests.length} tests)`);
  if (this.parallel) {
// const _results = awaitPromise.all(tests.map((test) => this.runTest(test)));
    return results;
    //   // LINT: unreachable code removed} else {
    const _results = [];
    for (const test of tests) {
// const _result = awaitthis.runTest(test);
      results.push(result);
      // Short delay between tests
  // await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    return results;
    //   // LINT: unreachable code removed}
  }
  generateReport();
  {
    const _totalTime = Date.now() - this.startTime;
    const _results = Array.from(this.results.values());
    const _passed = results.filter((r) => r.success).length;
    const _failed = results.filter((r) => !r.success).length;
    const _total = results.length;
    console.warn(`\n${'='.repeat(80)}`);
    console.warn(chalk.bold.blue('📊 CLAUDE FLOW v2.0.0 TEST REPORT'));
    console.warn('='.repeat(80));
    console.warn(`\n📈 Summary:`);
    console.warn(`   Total Tests: ${total}`);
    console.warn(`   Passed: ${chalk.green(passed)}`);
    console.warn(`   Failed: ${chalk.red(failed)}`);
    console.warn(`   Success Rate: ${chalk.cyan(((passed / total) * 100).toFixed(1))}%`);
    console.warn(`   Total Time: ${chalk.yellow((totalTime / 1000).toFixed(2))}s`);
    if (failed > 0) {
      console.warn(`\n❌ Failed Tests:`);
      results;
filter((r) => !r.success)
forEach((result) =>
          console.warn(
      `   • \$chalk.red(result.name): \$result.error ?? `Exit code $
        result.exitCode
      ``
      )
      )
    }
    console.warn(`\n✅ Passed Tests:`);
    results;
filter((r) => r.success)
forEach((result) =>
        console.warn(`   • \$
      chalk.green(result.name)
    : \$
      (result.duration / 1000).toFixed(2)
    s`)
    )
    // Performance summary
    const _performanceResults = results.filter((r) => r.name.includes('Performance'));
    if (performanceResults.length > 0) {
      console.warn(`;
    \n⚡ Performance Summary:`);
      performanceResults.forEach((_result) =>
      if (result.success) {
        console.warn(;
        `   • ${result.name}: ${chalk.green('PASSED')} (${(result.duration / 1000).toFixed(2)}s)`;
        )
      } else {
        console.warn(`   • ${result.name}: ${chalk.red('FAILED')}`);
      })
    }
    console.warn(`\n${'='.repeat(80)}`);
    return {
      total,
    // passed, // LINT: unreachable code removed
    failed,
    successRate: (passed / total) * 100,
    totalTime,
    results
}
}
async;
run();
{
  this.log('🚀 Starting Claude Flow v2.0.0 Comprehensive Test Suite');
  try {
      // Core test suites
  // await this.runTestSuite(testSuites, 'Core Test Suites');
      // Optional test suites
      if (this.includeLoad) {
  // await this.runTestSuite(loadTests, 'Load Tests');
      }
      if (this.includeDocker) {
  // await this.runTestSuite(dockerTests, 'Docker Tests');
      }
      if (this.includeNpx) {
  // await this.runTestSuite(npxTests, 'NPX Tests');
      }
    } catch (error) {
      this.log(`Test runner error: ${error.message}`, 'error');
    }
  const _report = this.generateReport();
  // Exit with appropriate code
  process.exit(report.failed > 0 ? 1 );
}
}
// CLI handling
function parseArgs() {
  const _args = process.argv.slice(2);
  const _options = {
    verbose: args.includes('--verbose')  ?? args.includes('-v'),
    load: args.includes('--load')  ?? args.includes('-l'),
    docker: args.includes('--docker')  ?? args.includes('-d'),
    npx: args.includes('--npx')  ?? args.includes('-n'),
    parallel: args.includes('--parallel')  ?? args.includes('-p'),
    help: args.includes('--help')  ?? args.includes('-h')
}
return options;
}
function showHelp() {
  console.warn(`;
${chalk.bold.blue('Claude Flow v2.0.0 Comprehensive Test Runner')}
${chalk.bold('Usage:')}
  node scripts/test-comprehensive.js [options]
${chalk.bold('Options:')}
  -v, --verbose     Show detailed test output;
  -l, --load        Include load tests;
  -d, --docker      Include Docker tests;
  -n, --npx         Include NPX tests;
  -p, --parallel    Run tests in parallel (faster but less stable);
  -h, --help        Show this help message
${chalk.bold('Examples:')}
  node scripts/test-comprehensive.js                    # Run core tests;
  node scripts/test-comprehensive.js --verbose          # Run with detailed output;
  node scripts/test-comprehensive.js --load --docker    # Include load and Docker tests;
  node scripts/test-comprehensive.js --parallel         # Run tests in parallel
${chalk.bold('Test Suites:')}
  • Unit Tests - Individual component tests;
  • Integration Tests - System integration tests;
  • End-to-End Tests - Complete workflow tests;
  • Performance Tests - Benchmark and load tests;
  • CLI Tests - Command-line interface tests;
  • Load Tests - Heavy load and stress tests (optional);
  • Docker Tests - Container and deployment tests (optional);
  • NPX Tests - Package distribution tests (optional);
`);
}
// Main execution
async function main() {
  const _options = parseArgs();
  if (options.help) {
    showHelp();
    process.exit(0);
  }
  const _runner = new TestRunner(options);
  // await runner.run();
}
// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught Exception:'), error);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
  process.exit(1);
});
// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
export default TestRunner;
