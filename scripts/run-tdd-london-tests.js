#!/usr/bin/env node

/**
 * Claude-Zen TDD London School Test Runner
 *
 * Executes the London School (mockist) test suite for Claude-Zen components:
 * - Outside-in development validation
 * - Mock-driven contract verification
 * - Behavior-focused integration tests
 * - Component interaction validation
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(message) {
  log('\n' + '='.repeat(60), 'blue');
  log(`🧪 ${message}`, 'bold');
  log('='.repeat(60), 'blue');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️ ${message}`, 'cyan');
}

class TDDLondonTestRunner {
  constructor() {
    this.testSuites = [
      {
        name: 'TDD London School Architecture Tests',
        pattern: 'src/__tests__/tdd-london-swarm.test.ts',
        description: 'Core TDD London School patterns and swarm coordination',
      },
      {
        name: 'Claude-Zen Architecture Tests',
        pattern: 'src/__tests__/claude-zen-tdd-architecture.test.ts',
        description: 'Claude-Zen specific architecture and Queen coordination',
      },
      {
        name: 'MCP Server Integration Tests',
        pattern: 'src/__tests__/integration/mcp-server-london-tdd.test.ts',
        description: 'MCP protocol compliance and component integration',
      },
      {
        name: 'WebSocket Client Integration Tests',
        pattern: 'src/__tests__/integration/websocket-client-london-tdd.test.ts',
        description: 'Real-time communication and connection resilience',
      },
      {
        name: 'Web ↔ MCP Integration Layer Tests',
        pattern: 'src/__tests__/integration/web-mcp-integration-london-tdd.test.ts',
        description: 'HTTP to MCP protocol bridging and transformation',
      },
    ];

    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
    };
  }

  validateEnvironment() {
    header('Environment Validation');

    // Check if Jest is available
    try {
      execSync('npx jest --version', { stdio: 'pipe' });
      success('Jest is available');
    } catch (error) {
      console.error('Jest is not available');
      return false;
    }

    // Check if test files exist
    let allTestsExist = true;
    for (const suite of this.testSuites) {
      if (existsSync(suite.pattern)) {
        success(`Test suite found: ${suite.name}`);
      } else {
        error(`Test suite missing: ${suite.pattern}`);
        allTestsExist = false;
      }
    }

    return allTestsExist;
  }

  async runTestSuite(suite) {
    info(`Running: ${suite.name}`);
    log(`Description: ${suite.description}`, 'cyan');

    try {
      const command = `NODE_OPTIONS='--experimental-vm-modules' npx jest ${suite.pattern} --verbose --no-coverage`;

      const output = execSync(command, {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      // Parse Jest output for results
      const lines = output.split('\n');
      const passedMatch = output.match(/(\d+) passed/);
      const failedMatch = output.match(/(\d+) failed/);
      const skippedMatch = output.match(/(\d+) skipped/);

      const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
      const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
      const skipped = skippedMatch ? parseInt(skippedMatch[1]) : 0;

      this.results.passed += passed;
      this.results.failed += failed;
      this.results.skipped += skipped;
      this.results.total += passed + failed + skipped;

      if (failed === 0) {
        success(`✨ ${suite.name}: ${passed} tests passed`);
      } else {
        error(`💥 ${suite.name}: ${failed} tests failed, ${passed} passed`);
      }

      return { success: failed === 0, passed, failed, skipped };
    } catch (error) {
      console.error(`Failed to run ${suite.name}`);
      log(error.message, 'red');

      this.results.failed += 1;
      this.results.total += 1;

      return { success: false, passed: 0, failed: 1, skipped: 0 };
    }
  }

  async runAllTests() {
    header('Claude-Zen TDD London School Test Suite');

    if (!this.validateEnvironment()) {
      console.error('Environment validation failed. Cannot run tests.');
      return false;
    }

    info('Running London School TDD tests...');
    log('Focus: Mock-driven contracts, behavior verification, outside-in development', 'cyan');

    const suiteResults = [];

    for (const suite of this.testSuites) {
      log('\n' + '-'.repeat(50), 'blue');
      const result = await this.runTestSuite(suite);
      suiteResults.push({ suite, result });
    }

    this.generateReport(suiteResults);

    return this.results.failed === 0;
  }

  generateReport(suiteResults) {
    header('TDD London School Test Results');

    log('📊 Test Suite Summary:', 'bold');
    for (const { suite, result } of suiteResults) {
      const status = result.success ? '✅' : '❌';
      const stats = `${result.passed}P/${result.failed}F/${result.skipped}S`;
      log(`   ${status} ${suite.name} (${stats})`, result.success ? 'green' : 'red');
    }

    log('\n📈 Overall Results:', 'bold');
    log(`   Total Tests: ${this.results.total}`, 'cyan');
    log(`   Passed: ${this.results.passed}`, 'green');
    log(`   Failed: ${this.results.failed}`, this.results.failed > 0 ? 'red' : 'green');
    log(`   Skipped: ${this.results.skipped}`, 'yellow');

    const successRate =
      this.results.total > 0 ? Math.round((this.results.passed / this.results.total) * 100) : 0;

    log(`\n🎯 Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'red');

    if (this.results.failed === 0) {
      log('\n🎉 All TDD London School tests passed!', 'green');
      log('✨ Mock-driven contracts verified', 'green');
      log('✨ Behavior verification complete', 'green');
      log('✨ Outside-in development validated', 'green');
    } else {
      log('\n🚨 Some tests failed. Review the output above.', 'red');
      log('💡 London School principle: Focus on fixing interaction contracts', 'yellow');
    }

    // London School specific recommendations
    log('\n🧠 TDD London School Insights:', 'magenta');
    log('   • Mock all collaborators to isolate units', 'cyan');
    log('   • Test behavior, not implementation details', 'cyan');
    log('   • Use mocks to drive interface design', 'cyan');
    log('   • Verify object conversations and interactions', 'cyan');
    log('   • Keep tests focused on component contracts', 'cyan');
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new TDDLondonTestRunner();

  runner
    .runAllTests()
    .then((success) => {
      if (success) {
        log('\n🎯 TDD London School validation complete!', 'green');
        process.exit(0);
      } else {
        log('\n💥 TDD London School validation failed!', 'red');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Test runner crashed:');
      console.error(error);
      process.exit(1);
    });
}

export { TDDLondonTestRunner };
