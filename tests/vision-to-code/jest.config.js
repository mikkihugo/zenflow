module.exports = {
  displayName: 'Vision-to-Code Tests',
testEnvironment: 'node',
roots: ['<rootDir>'],
testMatch: [;
    '**/__tests__/**/*.js',
    '**/__tests__/**/*.ts',
    '**/*.test.js',
    '**/*.test.ts',
    '**/*.spec.js',
    '**/*.spec.ts' ],
// {
  ('^.+\\.(ts|tsx)$');
  : 'ts-jest',
  ('^.+\\.(js|jsx)$')
  : 'babel-jest'
// }
moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
coverageDirectory: '<rootDir>/coverage',
collectCoverageFrom: [
'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{js,ts}',
    '!src/**/__tests__/**',
    '!src/**/node_modules/**' ],
// {
  branches,
  functions,
  lines,
  statements }

setupFilesAfterEnv: ['<rootDir>/test-setup.js'],
testTimeout,
verbose,
bail,
maxWorkers: '50%',
// {
  ('^@/(.*)$');
  : '<rootDir>/src/$1',
  ('^@services/(.*)$')
  : '<rootDir>/src/services/$1',
  ('^@utils/(.*)$')
  : '<rootDir>/src/utils/$1',
  ('^@models/(.*)$')
  : '<rootDir>/src/models/$1',
  ('^@config/(.*)$')
  : '<rootDir>/src/config/$1'
// }
// {
  ('ts-jest');
  : null
        jsx: 'react',
  esModuleInterop,
  allowSyntheticDefaultImports,
// }
projects: [
// {
  displayName: 'Unit Tests',
  testMatch: ['<rootDir>/unit/**/*.test.{js,ts}']
// }
// {
  displayName: 'Integration Tests',
  testMatch: ['<rootDir>/integration/**/*.test.{js,ts}']
// }
// {
  displayName: 'E2E Tests',
  testMatch: ['<rootDir>/e2e/**/*.test.{js,ts}']
// }
// {
  displayName: 'Performance Tests',
  testMatch: ['<rootDir>/performance/**/*.test.{js,ts}']
// }
// {
  displayName: 'Security Tests',
  testMatch: ['<rootDir>/security/**/*.test.{js,ts}']
// }
// ]
// }