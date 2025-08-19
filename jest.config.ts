/**
 * @fileoverview Jest Primary Configuration for AI-Focused Development
 * 
 * Enhanced Jest configuration optimized for AI development workflows including
 * claude-code-cli, gemini-cli, and other AI tool testing patterns. This serves
 * as the primary test runner for new tests while Vitest remains for legacy tests.
 * 
 * Key Features:
 * - ESM + TypeScript with ts-jest for modern AI tools
 * - AI-focused testing patterns (async operations, LLM calls, tool chains)
 * - Comprehensive monorepo path mapping for all @claude-zen packages
 * - Extended matchers for AI workflow assertions
 * - Optimized timeouts for LLM response testing
 * - Parallel execution with intelligent resource management
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.44
 * @version 2.0.0
 */

import type { Config } from 'jest';

const config: Config = {
  // Primary configuration for AI testing
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  verbose: true,
  
  // Extended timeout for AI operations (LLM calls, tool chains)
  testTimeout: 60000, // 60 seconds for AI operations
  
  // Transform configuration for TypeScript and ESM
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          moduleResolution: 'bundler',
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
        },
      },
    ],
  },

  // Comprehensive monorepo path mapping for all @claude-zen packages
  moduleNameMapper: {
    // Main application modules
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@coordination/(.*)$': '<rootDir>/src/coordination/$1',
    '^@neural/(.*)$': '<rootDir>/src/neural/$1',
    '^@memory/(.*)$': '<rootDir>/src/memory/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@interfaces/(.*)$': '<rootDir>/src/interfaces/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@database/(.*)$': '<rootDir>/src/database/$1',
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    
    // @claude-zen package mappings for testing
    '^@claude-zen/foundation/(.*)$': '<rootDir>/packages/foundation/src/$1',
    '^@claude-zen/foundation$': '<rootDir>/packages/foundation/src/index.ts',
    '^@claude-zen/event-system/(.*)$': '<rootDir>/packages/event-system/src/$1',
    '^@claude-zen/event-system$': '<rootDir>/packages/event-system/src/index.ts',
    '^@claude-zen/brain/(.*)$': '<rootDir>/packages/brain/src/$1',
    '^@claude-zen/brain$': '<rootDir>/packages/brain/src/index.ts',
    '^@claude-zen/workflows/(.*)$': '<rootDir>/packages/workflows/src/$1',
    '^@claude-zen/workflows$': '<rootDir>/packages/workflows/src/index.ts',
    '^@claude-zen/knowledge/(.*)$': '<rootDir>/packages/knowledge/src/$1',
    '^@claude-zen/knowledge$': '<rootDir>/packages/knowledge/src/index.ts',
    '^@claude-zen/teamwork/(.*)$': '<rootDir>/packages/teamwork/src/$1',
    '^@claude-zen/teamwork$': '<rootDir>/packages/teamwork/src/index.ts',
    '^@claude-zen/database/(.*)$': '<rootDir>/packages/database/src/$1',
    '^@claude-zen/database$': '<rootDir>/packages/database/src/index.ts',
    '^@claude-zen/agui/(.*)$': '<rootDir>/packages/agui/src/$1',
    '^@claude-zen/agui$': '<rootDir>/packages/agui/src/index.ts',
  },

  // ESM and file extension handling
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'mjs'],

  // Test discovery patterns - Jest as primary for new tests
  roots: ['<rootDir>/tests'],
  testMatch: [
    // Primary Jest test patterns (new tests)
    '<rootDir>/tests/jest/**/*.test.ts',
    '<rootDir>/tests/jest/**/*.test.tsx',
    
    // AI-specific test patterns
    '<rootDir>/tests/ai/**/*.test.ts',
    '<rootDir>/tests/integration/ai-*.test.ts',
    '<rootDir>/tests/e2e/ai-*.test.ts',
  ],

  // Exclude Vitest-specific tests to prevent conflicts
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
    // Exclude Vitest legacy tests
    '/tests/vitest/',
    '/src/__tests__/vitest/',
    'vitest.test.ts',
    'vitest.test.tsx',
  ],

  // AI-focused test setup with extended matchers and utilities
  setupFilesAfterEnv: [
    'jest-extended/all',
    '<rootDir>/tests/jest-setup.ts',
    '<rootDir>/tests/ai-test-setup.ts',
  ],

  // Coverage configuration optimized for AI development
  collectCoverage: false, // Disabled by default, enable with --coverage
  coverageProvider: 'v8',
  coverageDirectory: 'coverage-jest',
  coverageReporters: ['text', 'json', 'html', 'lcov'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'packages/*/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.test.{ts,tsx}',
    '!**/__tests__/**',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Performance optimization for large monorepo
  maxWorkers: '50%',
  workerIdleMemoryLimit: '1GB',
  
  // AI testing optimizations
  detectOpenHandles: true, // Important for AI async operations
  forceExit: false, // Let AI operations complete naturally
  
  // Module resolution improvements
  resolver: undefined, // Use default resolver with enhanced moduleNameMapper
  
  // Transform ignore for faster processing
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))',
  ],
  
  // Additional Jest configuration for package testing
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  
  // Remove deprecated globals config
  
  // Environment variables for AI testing
  setupFiles: ['<rootDir>/tests/jest-env-setup.ts'],
};

export default config;