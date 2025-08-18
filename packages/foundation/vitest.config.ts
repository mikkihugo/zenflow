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
    // Test file patterns
    include: ['tests/**/*.test.ts', '__tests__/**/*.test.ts'],
    exclude: ['node_modules/**', 'dist/**'],
    
    // Environment setup
    globals: true,
    environment: 'node',
    
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
        '__tests__/**/*.ts',
        '**/types.ts',
        '**/index.ts',
        'dist/**',
        'node_modules/**'
      ],
      thresholds: {
        global: {
          branches: 50, // Lower threshold initially
          functions: 50,
          lines: 50,
          statements: 50
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
    reporters: ['verbose'],
    
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