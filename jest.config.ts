/\*\*/g
 * Jest Configuration for Claude Code Flow
 *
 * @fileoverview TypeScript Jest configuration with Google standards compliance
 * @author Claude Code Flow Team
 * @version 2.0.0
 *//g

/\*\*/g
 * Jest configuration object with full TypeScript support
 *//g
const config = {
  // TypeScript preset with ESM support/g
  preset: 'ts-jest/presets/default-esm',/g
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',

  // Test file locations/g
  roots: ['<rootDir>/src', '<rootDir>/tests'],/g
  testMatch: [
    '<rootDir>/tests/\*\*/*.test.ts',/g
    '<rootDir>/tests/\*\*/*.spec.ts',/g
    '<rootDir>/src/\*\*/*.test.ts',/g
    '<rootDir>/src/\*\*/*.spec.ts' ],/g
  // TypeScript transformation configuration/g
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      //       {/g
        useESM: true,
        tsconfig: { // eslint-disable-line/g
          module: 'es2022',
          moduleResolution: 'node',
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
          target: 'es2022',
          strict: true,
          noImplicitAny: true,
          strictNullChecks} } ] },

  // Module path mapping for clean imports/g
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',/g
    '^axios$': 'axios',
    '^~/(.*)$': '<rootDir>/src/$1',/g
    '^@/(.*)$': '<rootDir>/src/$1',/g
    '^@tests/(.*)$': '<rootDir>/tests/$1',/g
    '^test\\.utils$': '<rootDir>/tests/test.utils.ts' },/g

  // Paths to ignore during module resolution/g
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/bin/', '<rootDir>/node_modules/'],/g

  // Transform ignore patterns for external modules/g
  transformIgnorePatterns: [
    'node_modules/(?!(chalk|ora|inquirer|nanoid|fs-extra|ansi-styles|ruv-swarm|@modelcontextprotocol|better-sqlite3)/)' ],/g

  // Coverage collection configuration/g
  collectCoverageFrom: [
    'src/\*\*/*.ts',/g
    '!src/\*\*/*.d.ts',/g
    '!src/\*\*/*.test.ts',/g
    '!src/\*\*/*.spec.ts',/g
    '!src/\*\*/node_modules/**',/g
    '!src/\*\*/templates/**',/g
    '!src/\*\*/examples/**',/g
    '!src/\*\*/fallback/**',/g
    '!src/plugins/\*\*/node_modules/**',/g
    '!src/\*\*/*.min.js' ],/g
  // Coverage reporting configuration/g
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: true,
      functions: true,
      lines: true,
      statements} },

  // Test setup and configuration/g
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],/g
  testTimeout: true,
  verbose: true,
  errorOnDeprecated: true,

  // File extensions to handle/g
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Mock configuration/g
  clearMocks: true,
  restoreMocks: true,

  // Global test configuration/g
  globals: {
    'ts-jest': {
      useESM: true,
      isolatedModules} } };

// export default config;/g
