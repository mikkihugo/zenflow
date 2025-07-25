export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.ts',
    '<rootDir>/tests/**/*.spec.js',
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/src/**/*.test.js',
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/src/**/*.spec.js'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'es2022',
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        target: 'es2022'
      }
    }],
    '^.+\\.js$': ['babel-jest', {
      presets: [['@babel/preset-env', { modules: 'auto' }]]
    }]
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^axios$': 'axios',
    '^~/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^test\\.utils$': '<rootDir>/tests/test.utils.ts'
  },
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/bin/',
    '<rootDir>/node_modules/'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(chalk|ora|inquirer|nanoid|fs-extra|ansi-styles|ruv-swarm|@modelcontextprotocol|better-sqlite3)/)'
  ],
  resolver: undefined,
  collectCoverageFrom: [
    'src/**/*.ts',
    'src/**/*.js',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.test.js',
    '!src/**/*.spec.ts',
    '!src/**/*.spec.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 30000,
  verbose: true,
  errorOnDeprecated: false,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  clearMocks: true,
  restoreMocks: true
};