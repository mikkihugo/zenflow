/** Jest 30 Configuration for Claude-Zen TypeScript ESM Project
 * @fileoverview Modern Jest configuration following 2025 best practices
 * @author Claude-Zen Team
 * @version 3.0.0
 */

import type { Config } from 'jest';

const config: Config = {
  // Modern TypeScript ESM preset
  preset: 'ts-jest/presets/default-esm',

  // Enable ESM support for .ts files
  extensionsToTreatAsEsm: ['.ts'],

  // Node test environment
  testEnvironment: 'node',

  // Test file locations
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.spec.ts',
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/src/**/*.spec.ts',
  ],

  // Modern TypeScript transformation (Jest 30 + ts-jest 29 style)
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        // Use project tsconfig.json (which already has isolatedModules: true)
        tsconfig: './tsconfig.json',
      },
    ],
  },

  // ESM-compatible module name mapping
  moduleNameMapper: {
    // Handle .js imports for TypeScript files (more flexible pattern)
    '^(\\.{1,2}/.*)\\.(js|ts)$': '$1',
    // Handle services paths
    '^../services/(.*)\\.(js|ts)$': '<rootDir>/src/services/$1',
    '^../../services/(.*)\\.(js|ts)$': '<rootDir>/src/services/$1',
    '^../../../services/(.*)\\.(js|ts)$': '<rootDir>/src/services/$1',
    // Handle core paths
    '^../../core/(.*)\\.(js|ts)$': '<rootDir>/src/core/$1',
    // Path aliases
    '^~/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^test\\.utils$': '<rootDir>/tests/test.utils.ts',
  },

  // Ignore patterns for module resolution
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/bin/', '<rootDir>/node_modules/'],

  // Transform ignore patterns - allow ESM modules to be transformed
  transformIgnorePatterns: [
    'node_modules/(?!(chalk|ora|inquirer|nanoid|fs-extra|ansi-styles|ruv-swarm|@modelcontextprotocol|better-sqlite3)/)',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/**/node_modules/**',
    '!src/**/templates/**',
    '!src/**/examples/**',
    '!src/**/fallback/**',
    '!src/plugins/**/node_modules/**',
    '!src/**/*.min.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 75, // Slightly lower for practical use
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },

  // Test setup and timeouts
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
  verbose: true,

  // Jest 30 features
  errorOnDeprecated: true,

  // File extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mts', 'cts'],

  // Mock configuration
  clearMocks: true,
  restoreMocks: true,
  resetMocks: false, // Better for ESM compatibility

  // Performance optimizations for Jest 30
  maxWorkers: '50%',
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
};

export default config;
