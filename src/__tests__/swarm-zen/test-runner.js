#!/usr/bin/env node

/**
 * Comprehensive Test Runner for ruv-swarm
 * Handles ES modules, CommonJS compatibility, and different test frameworks
 */

import assert from 'node:assert';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Track test results
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
};

// Custom test runner for describe/it pattern
const suites = [];
let currentSuite = null;
let _currentTest = null;

global.describe = (name, fn) => {
  const suite = {
    name,
    tests: [],
    beforeEach: null,
    afterEach: null,
  };
  suites.push(suite);
  currentSuite = suite;
  fn();
  currentSuite = null;
};

global.it = (name, fn) => {
  if (!currentSuite) {
    throw new Error('it() must be inside describe()');
  }
  currentSuite.tests.push({ name, fn });
};

global.beforeEach = (fn) => {
  if (!currentSuite) {
    throw new Error('beforeEach() must be inside describe()');
  }
  currentSuite.beforeEach = fn;
};

global.afterEach = (fn) => {
  if (!currentSuite) {
    throw new Error('afterEach() must be inside describe()');
  }
  currentSuite.afterEach = fn;
};

// Enhanced assert with better error messages
global.assert = new Proxy(assert, {
  get(target, prop) {
    if (prop === 'rejects') {
      return async (promise, expectedError) => {
        try {
          await promise;
          throw new Error(`Expected promise to reject with: ${expectedError}`);
        } catch (error) {
          if (expectedError instanceof RegExp) {
            if (!expectedError.test(error.message)) {
              throw new Error(`Error message "${error.message}" does not match ${expectedError}`);
            }
          } else if (typeof expectedError === 'string') {
            if (!error.message.includes(expectedError)) {
              throw new Error(
                `Error message "${error.message}" does not include "${expectedError}"`
              );
            }
          }
        }
      };
    }
    return target[prop];
  },
});

// Run all suites
async function runSuites() {
  for (const suite of suites) {
    for (const test of suite.tests) {
      _currentTest = test;
      results.total++;

      try {
        // Run beforeEach if exists
        if (suite.beforeEach) {
          await suite.beforeEach();
        }

        // Run the test
        await test.fn();

        // Run afterEach if exists
        if (suite.afterEach) {
          await suite.afterEach();
        }
        results.passed++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          suite: suite.name,
          test: test.name,
          error: error.message,
          stack: error.stack,
        });
      }
    }
  }
}

// Run a specific test file
export async function run(testFile) {
  try {
    // Clear previous suites
    suites.length = 0;

    // Import the test file
    await import(testFile);

    // Run all suites
    await runSuites();

    if (results.failed > 0) {
      results.errors.forEach((_error) => {
        if (process.env.VERBOSE) {
        }
      });
    }

    return results;
  } catch (error) {
    console.error('Test runner error:', error);
    throw error;
  }
}

// Run all coverage test files
export async function runAll() {
  const testFiles = [
    './coverage-edge-cases.test.js',
    './neural-models-coverage.test.js',
    './hooks-coverage.test.js',
  ];

  const allResults = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  for (const file of testFiles) {
    const fileResults = await run(join(__dirname, file));
    allResults.total += fileResults.total;
    allResults.passed += fileResults.passed;
    allResults.failed += fileResults.failed;

    // Reset results for next file
    results.total = 0;
    results.passed = 0;
    results.failed = 0;
    results.errors = [];
  }

  return allResults;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAll()
    .then((results) => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
