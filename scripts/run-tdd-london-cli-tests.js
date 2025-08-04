#!/usr/bin/env node

/**
 * TDD London CLI Tests Runner
 *
 * Executes the London School TDD tests for CLI command processing
 * with proper setup and reporting.
 */

import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

/**
 * Run Jest tests for CLI commands with London TDD configuration
 */
async function runCLITests() {
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
      '^.+\\.tsx?$': [
        'ts-jest',
        {
          useESM: true,
          tsconfig: {
            module: 'esnext',
            target: 'es2022',
            moduleResolution: 'node',
            allowSyntheticDefaultImports: true,
            esModuleInterop: true,
          },
        },
      ],
    },
    setupFilesAfterEnv: [join(rootDir, 'jest.setup.ts')],
    collectCoverageFrom: ['src/cli/**/*.ts', '!src/cli/**/*.test.ts', '!src/cli/**/*.d.ts'],
    coverageDirectory: 'coverage/london-cli',
    coverageReporters: ['text', 'lcov', 'html'],
    verbose: true,
    testTimeout: 30000,
  };

  const jestArgs = [
    '--config',
    JSON.stringify(jestConfig),
    '--testPathPatterns',
    testPattern,
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
        resolve(code);
      } else {
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
function displayTestInfo() {}

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
  process.exit(0);
}

main().catch(console.error);
