#!/usr/bin/env node
/**
 * SQLite Integration Test Runner
 * Validates SQLite functionality and runs integration tests
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runTest(testName, testCommand) {
  log(`\n🔍 Running: ${testName}`, 'blue');
  
  try {
    const result = await new Promise((resolve, reject) => {
      const child = spawn('npm', testCommand, {
        cwd: rootDir,
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        process.stdout.write(data);
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });

      child.on('close', (code) => {
        resolve({ code, stdout, stderr });
      });

      child.on('error', (error) => {
        reject(error);
      });
    });

    if (result.code === 0) {
      log(`✅ ${testName} - PASSED`, 'green');
      return true;
    } else {
      log(`❌ ${testName} - FAILED (exit code: ${result.code})`, 'red');
      return false;
    }
  } catch (error) {
    log(`💥 ${testName} - ERROR: ${error.message}`, 'red');
    return false;
  }
}

async function checkSQLiteAvailability() {
  log('\n🔍 Checking SQLite availability...', 'cyan');
  
  try {
    // Try to import better-sqlite3
    const { isSQLiteAvailable, getLoadError } = await import('../../src/memory/sqlite-wrapper.js');
    const available = await isSQLiteAvailable();
    
    if (available) {
      log('✅ SQLite (better-sqlite3) is available', 'green');
      return true;
    } else {
      const error = getLoadError();
      log(`⚠️  SQLite not available: ${error?.message || 'Unknown error'}`, 'yellow');
      log('   Tests will run with fallback behavior', 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ Error checking SQLite: ${error.message}`, 'red');
    return false;
  }
}

async function runIntegrationTests() {
  log('🧪 SQLite Integration Test Runner', 'blue');
  log('=' .repeat(50), 'blue');

  const results = [];
  let sqliteAvailable = false;

  try {
    // Check SQLite availability first
    sqliteAvailable = await checkSQLiteAvailability();

    // Run specific SQLite integration tests
    const testResults = await Promise.all([
      runTest(
        'SQLite Memory Store Tests',
        ['run', 'test', '--', 'tests/integration/sqlite-memory-store.test.js']
      ),
      runTest(
        'CLI Integration Tests', 
        ['run', 'test', '--', 'tests/integration/cli-integration.test.js']
      ),
      runTest(
        'Hive Mind Schema Tests',
        ['run', 'test', '--', 'tests/integration/hive-mind-schema.test.js']
      )
    ]);

    results.push(...testResults);

    // Run additional tests if SQLite is available
    if (sqliteAvailable) {
      log('\n💾 Running SQLite-specific tests...', 'cyan');
      
      const sqliteSpecificResults = await Promise.all([
        runTest(
          'Cross-platform Portability Tests',
          ['run', 'test', '--', 'tests/integration/cross-platform-portability.test.js']
        ),
        runTest(
          'Real Metrics Tests',
          ['run', 'test', '--', 'tests/integration/real-metrics.test.js']
        )
      ]);
      
      results.push(...sqliteSpecificResults);
    } else {
      log('\n⚠️  Skipping SQLite-specific tests (SQLite not available)', 'yellow');
    }

  } catch (error) {
    log(`💥 Fatal error during test execution: ${error.message}`, 'red');
    results.push(false);
  }

  // Generate summary
  log('\n📊 Test Summary', 'blue');
  log('=' .repeat(30), 'blue');
  
  const passed = results.filter(r => r === true).length;
  const failed = results.filter(r => r === false).length;
  const total = results.length;

  log(`Total Tests: ${total}`);
  log(`Passed: ${passed}`, passed > 0 ? 'green' : 'reset');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'reset');
  
  if (failed === 0) {
    log('\n🎉 All SQLite integration tests passed!', 'green');
    log(`📋 SQLite Status: ${sqliteAvailable ? 'Available' : 'Not Available (using fallbacks)'}`, 'cyan');
  } else {
    log(`\n⚠️  ${failed} test(s) failed. Review the output above.`, 'red');
  }

  // Save test results
  const timestamp = new Date().toISOString();
  const testReport = {
    timestamp,
    sqliteAvailable,
    totalTests: total,
    passed,
    failed,
    results: results.map((result, index) => ({
      test: index,
      passed: result
    }))
  };

  const reportPath = path.join(__dirname, 'sqlite-test-results.json');
  await fs.writeFile(reportPath, JSON.stringify(testReport, null, 2));
  log(`\n📁 Test report saved: ${reportPath}`, 'cyan');

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  log('\n\n🛑 Test execution interrupted', 'yellow');
  process.exit(130);
});

process.on('SIGTERM', () => {
  log('\n\n🛑 Test execution terminated', 'yellow');
  process.exit(143);
});

// Run the test suite
runIntegrationTests().catch((error) => {
  log(`💥 Unhandled error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});