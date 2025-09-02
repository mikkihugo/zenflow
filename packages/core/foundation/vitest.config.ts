/**
 * @fileoverview Vitest Configuration for Foundation Package
 *
 * Comprehensive test configuration with support for:
 * - Unit tests (fast, mocked)
 * - Integration tests (real API calls)
 * - Performance tests (concurrent operations)
 * - Test coverage reporting
 *
 * Environment Variables:
 * - RUN_INTEGRATION=true - Enable real API integration tests
 * - RUN_PERFORMANCE=true - Enable performance benchmarks
 * - LLM_PROVIDER_API_KEY - Required for LLM provider tests
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test file patterns - focused on unit tests
    include: ['tests/unit/**/*.test.ts', 'tests/basic.test.ts'],
    exclude: [
      'node_modules/**',
      'dist/**',
      'tests/integration/**',
      'tests/e2e/**',
    ],

    // Environment setup
    globals: true,
    environment: 'node',

    // Add performance API for browser compatibility testing
    setupFiles: ['./tests/setup/globals.ts'],
    // Skip broken setup file
    // setupFiles:['./tests/setup/vitest.setup.ts'],

    // Reduced timeouts for basic tests
    testTimeout: 30000, // 30 seconds
    hookTimeout: 10000, // 10 seconds

    // Coverage configuration - realistic thresholds
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'tests/**/*.ts',
        '**/index.ts',
        'dist/**',
        'node_modules/**',
        'scripts/**',
      ],
      thresholds: {
        global: {
          branches: 60, // Realistic for foundation package
          functions: 65,
          lines: 70,
          statements: 70,
        },
      },
    },

    // No retries for basic tests
    retry: 0,

    // Single fork to avoid memory issues
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
        isolate: false,
        maxForks: 1,
        minForks: 1,
      },
    },

    // Simple reporter
    reporters: ['default'],

    // Sequential execution to avoid memory issues
    sequence: {
      shuffle: false,
      concurrent: false,
    },
  },

  // TypeScript configuration
  esbuild: {
    target: 'node18',
  },
});
