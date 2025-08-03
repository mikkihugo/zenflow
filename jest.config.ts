import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  verbose: true,
  testTimeout: 30000, // 30 seconds per test

  transform: {
    '^.+\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },

  moduleNameMapper: {
    // Map TypeScript path aliases
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: '<rootDir>/src/',
    }),
  },

  // Use custom resolver approach
  resolver: '<rootDir>/tests/jest-resolver.cjs',

  // Remove custom resolver
  // resolver: '<rootDir>/tests/jest-resolver.cjs',

  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['<rootDir>/tests/**/*.test.ts', '<rootDir>/src/__tests__/**/*.test.ts'],

  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};

export default config;
