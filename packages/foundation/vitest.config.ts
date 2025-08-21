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
 * - ANTHROPIC_API_KEY - Required for Claude API tests
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test file patterns - gold standard structure
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules/**', 'dist/**'],
    
    // Environment setup
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    
    // Test timeouts
    testTimeout: 120000, // 2 minutes for unit tests (Claude SDK can be slow)
    hookTimeout: 30000, // 30 seconds for setup/teardown
    
    // Coverage configuration
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', '*.ts'],
      exclude: [
        'tests/**/*.ts',
        '**/types.ts',
        '**/index.ts', 
        'dist/**',
        'node_modules/**',
        'scripts/**'
      ],
      thresholds: {
        global: {
          branches: 90, // High coverage for critical foundation package
          functions: 95,
          lines: 95,
          statements: 95
        }
      }
    },
    
    // Retry configuration for flaky API tests
    retry: process.env['RUN_INTEGRATION'] === 'true' ? 2 : 0,
    
    // Pool configuration for concurrent tests
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1
      }
    },
    
    // Reporter configuration
    reporters: [['default', { summary: false }]],
    
    // Test categorization
    sequence: {
      shuffle: false, // Keep deterministic order
      concurrent: true
    }
  },
  
  // TypeScript configuration
  esbuild: {
    target: 'node18'
  }
});