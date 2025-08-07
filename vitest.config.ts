import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment using happy-dom (4x faster than jsdom)
    environment: 'happy-dom',

    // Test files patterns
    include: [
      'src/__tests__/**/*.test.ts',
      'src/__tests__/**/*.test.tsx',
      'tests/**/*.test.ts',
      'tests/**/*.test.tsx',
    ],

    // Exclude patterns
    exclude: ['node_modules', 'dist', '.git', 'coverage', 'src/__tests__/swarm-zen/**/*.js'],

    // Global test setup
    globals: true,

    // Performance settings
    testTimeout: 30000,
    hookTimeout: 10000,
    teardownTimeout: 10000,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/__tests__/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/**/*.d.ts',
        'src/types/**',
        'node_modules',
        'dist',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },

    // Setup files
    setupFiles: ['./tests/vitest-setup.ts'],

    // Reporter options
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './test-results.json',
    },

    // Pool options for parallel execution
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 2,
      },
    },
  },

  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/core'),
      '@coordination': resolve(__dirname, 'src/coordination'),
      '@neural': resolve(__dirname, 'src/neural'),
      '@memory': resolve(__dirname, 'src/memory'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
      '@interfaces': resolve(__dirname, 'src/interfaces'),
      '@swarm-zen': resolve(__dirname, 'src/swarm-zen'),
      '@api': resolve(__dirname, 'src/api'),
      '@mcp': resolve(__dirname, 'src/mcp'),
      '@config': resolve(__dirname, 'src/config'),
      '@terminal': resolve(__dirname, 'src/terminal'),
      '@tools': resolve(__dirname, 'src/tools'),
      '@knowledge': resolve(__dirname, 'src/knowledge'),
      '@database': resolve(__dirname, 'src/database'),
    },
  },
});
