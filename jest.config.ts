/**
 * Jest Configuration for Claude Code Flow;
 *;
 * @fileoverview TypeScript Jest configuration with Google standards compliance;
 * @author Claude Code Flow Team;
 * @version 2.0.0;
 */

import type { Config } from '@jest/types';

/**
 * Jest configuration object with full TypeScript support;
 */
const _config: Config.InitialOptions = {
  // TypeScript preset with ESM support
  preset: 'ts-jest/presets/default-esm',;
extensionsToTreatAsEsm: ['.ts'],;
testEnvironment: 'node',
;
// Test file locations
roots: ['<rootDir>/src', '<rootDir>/tests'],;
testMatch: [;
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.spec.ts',
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/src/**/*.spec.ts',
  ],
;
// TypeScript transformation configuration
{
  ('^.+\\.ts$');
  : [
  'ts-jest',
  useESM: true,
  module: 'es2022',;
  moduleResolution: 'node',;
  allowSyntheticDefaultImports: true,;
  esModuleInterop: true,;
  target: 'es2022',;
  strict: true,;
  noImplicitAny: true,;
  strictNullChecks: true,;
  ,
  ,
  ],
}
,
// Module path mapping for clean imports
{
  ('^(\\.{1,2}/.*)\\.js$');
  : '$1',
  ('^axios$')
  : 'axios',
  ('^~/(.*)$')
  : '<rootDir>/src/$1',
  ('^@/(.*)$')
  : '<rootDir>/src/$1',
  ('^@tests/(.*)$')
  : '<rootDir>/tests/$1',
  ('^test\\.utils$')
  : '<rootDir>/tests/test.utils.ts',
}
,
// Paths to ignore during module resolution
modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/bin/', '<rootDir>/node_modules/'],
// Transform ignore patterns for external modules
transformIgnorePatterns: [
'node_modules/(?!(chalk|ora|inquirer|nanoid|fs-extra|ansi-styles|ruv-swarm|@modelcontextprotocol|better-sqlite3)/)',
],
// Coverage collection configuration
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
// Coverage reporting configuration
coverageDirectory: 'coverage',
coverageReporters: ['text', 'lcov', 'html'],
{
  branches: 80,;
  functions: 80,;
  lines: 80,;
  statements: 80,;
  ,
}
,
// Test setup and configuration
setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
testTimeout: 30000,
verbose: true,
errorOnDeprecated: false,
// File extensions to handle
moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
// Mock configuration
clearMocks: true,
restoreMocks: true,
;
// Global test configuration
{
  ('ts-jest');
  : 
      useESM: true,
  isolatedModules: true,
  ,
}
,
}
export default config;
