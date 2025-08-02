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

  // Test file locations - Hybrid TDD Structure
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.spec.ts',
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/src/__tests__/**/*.test.{ts,js}',
    '<rootDir>/src/__tests__/**/*.spec.{ts,js}',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/bin/',
    '/build/',
    '/templates/',
    '/examples/',
    '\\.min\\.(js|ts)$',
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

  // Coverage configuration - Enhanced for Hybrid TDD
  collectCoverageFrom: [
    'src/**/*.ts',
    'src/**/*.js',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/**/node_modules/**',
    '!src/**/templates/**',
    '!src/**/examples/**',
    '!src/**/fallback/**',
    '!src/plugins/**/node_modules/**',
    '!src/**/*.min.js',
    '!src/**/build/**',
    '!src/**/dist/**',
    '!src/**/binaries/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'cobertura', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 90, // Enhanced target for comprehensive testing
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // Domain-specific thresholds for hybrid TDD
    'src/coordination/**/*.{ts,js}': {
      branches: 95, // London TDD - high interaction coverage
      functions: 95,
      lines: 95,
      statements: 95,
    },
    'src/neural/**/*.{ts,js}': {
      branches: 85, // Classical TDD - focus on algorithm correctness
      functions: 90,
      lines: 85,
      statements: 85,
    },
    'src/interfaces/**/*.{ts,js}': {
      branches: 95, // London TDD - critical user interfaces
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },

  // Test setup and timeouts - Enhanced for Hybrid TDD
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 60000, // Increased for complex swarm coordination tests
  verbose: true,
  detectOpenHandles: true,
  forceExit: true, // Prevent hanging processes in swarm tests

  // Jest 30 features
  errorOnDeprecated: true,

  // File extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mts', 'cts'],

  // Mock configuration
  clearMocks: true,
  restoreMocks: true,
  resetMocks: false, // Better for ESM compatibility

  // Performance optimizations for Jest 30 - Hybrid TDD
  maxWorkers: '75%', // Increased for parallel London/Classical test execution
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Hybrid TDD test organization
  projects: [
    {
      displayName: 'London TDD (Mockist)',
      testMatch: ['<rootDir>/src/__tests__/unit/london/**/*.test.{ts,js}'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup-london.ts'],
    },
    {
      displayName: 'Classical TDD (Detroit)',
      testMatch: ['<rootDir>/src/__tests__/unit/classical/**/*.test.{ts,js}'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup-classical.ts'],
    },
    {
      displayName: 'Integration Tests',
      testMatch: ['<rootDir>/src/__tests__/integration/**/*.test.{ts,js}'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup-integration.ts'],
    },
    {
      displayName: 'E2E Tests',
      testMatch: ['<rootDir>/src/__tests__/e2e/**/*.test.{ts,js}'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup-e2e.ts'],
    },
  ],
};

export default config;
