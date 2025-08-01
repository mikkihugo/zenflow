#!/usr/bin/env node

/**
 * TDD London CLI Tests Runner
 *
 * Executes the London School TDD tests for CLI command processing
 * with proper setup and reporting.
 */

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

/**
 * Run Jest tests for CLI commands with London TDD configuration
 */
async function runCLITests() {
  console.log('🧪 Running TDD London Tests for CLI Command Processing...\n');

  const testPattern = 'src/__tests__/unit/london/cli-commands/*.test.ts';

  const jestConfig = {
    testMatch: [`**/${testPattern}`],
    testEnvironment: 'node',
    preset: 'ts-jest/presets/default-esm',
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapping: {
      '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
      '^.+\\.tsx?$': ['ts-jest', {
        useESM: true,
        tsconfig: {
          module: 'esnext',
          target: 'es2022',
          moduleResolution: 'node',
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
        },
      }],
    },
    setupFilesAfterEnv: [join(rootDir, 'jest.setup.ts')],
    collectCoverageFrom: [
      'src/cli/**/*.ts',
      '!src/cli/**/*.test.ts',
      '!src/cli/**/*.d.ts',
    ],
    coverageDirectory: 'coverage/london-cli',
    coverageReporters: ['text', 'lcov', 'html'],
    verbose: true,
    testTimeout: 30000,
  };

  const jestArgs = [
    '--config', JSON.stringify(jestConfig),
    '--testPathPatterns', testPattern,
    '--detectOpenHandles',
    '--forceExit',
    '--runInBand', // Run tests serially for better output
    '--colors',
  ];

  return new Promise((resolve, reject) => {
    const jest = spawn('npx', ['jest', ...jestArgs], {
      stdio: 'inherit',
      cwd: rootDir,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        TDD_SCHOOL: 'london',
      },
    });

    jest.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ All London TDD CLI tests passed!');
        resolve(code);
      } else {
        console.log(`\n❌ Tests failed with exit code ${code}`);
        reject(new Error(`Tests failed with exit code ${code}`));
      }
    });

    jest.on('error', (error) => {
      console.error('Failed to start test runner:', error);
      reject(error);
    });
  });
}

/**
 * Display test information and patterns
 */
function displayTestInfo() {
  console.log('📋 Test Configuration:');
  console.log('  - School: London TDD (Interaction-based testing)');
  console.log('  - Focus: CLI command processing behavior');
  console.log('  - Components: CommandRegistry, BaseCommand, ArgumentParser, OutputFormatter, ErrorHandler');
  console.log('  - Approach: Mock external dependencies, test collaborations');
  console.log('  - Pattern: Given-When-Then with behavior verification\n');

  console.log('🧩 Test Structure:');
  console.log('  src/__tests__/unit/london/cli-commands/');
  console.log('  ├── command-registry.test.ts     - Command registration and discovery');
  console.log('  ├── base-command.test.ts         - Command lifecycle and validation');
  console.log('  ├── argument-parser.test.ts      - Command-line argument parsing');
  console.log('  ├── output-formatter.test.ts     - Output formatting and rendering');
  console.log('  ├── error-handler.test.ts        - Error handling and recovery');
  console.log('  └── index.test.ts                - Integration between components\n');
}

/**
 * Main execution
 */
async function main() {
  try {
    displayTestInfo();
    await runCLITests();
    process.exit(0);
  } catch (error) {
    console.error('Test execution failed:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
TDD London CLI Tests Runner

Usage: node scripts/run-tdd-london-cli-tests.js [options]

Options:
  --help, -h          Show this help message
  --verbose          Enable verbose output
  --coverage         Generate coverage report
  --watch            Run in watch mode

Examples:
  node scripts/run-tdd-london-cli-tests.js
  node scripts/run-tdd-london-cli-tests.js --coverage
  node scripts/run-tdd-london-cli-tests.js --watch
`);
  process.exit(0);
}

main().catch(console.error);
