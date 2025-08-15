/**
 * Enhanced Test Helper Utilities - Hybrid TDD Support
 *
 * @file Comprehensive test utilities for Claude-Zen
 * Supports both London School (mock-heavy, interaction-focused)
 * and Classical School (real object, state-focused) testing approaches
 * Enhanced with domain-specific helpers for coordination, neural, and interface testing
 */

// Legacy Test Helpers (backward compatibility)
export {
  AssertionHelpers,
  AssertionHelpers as assertionHelpers,
} from './assertion-helpers.ts';
export * from './coordination-test-helpers.ts';
// Enhanced Hybrid TDD Helpers
export * from './hybrid-test-utilities.ts';
export {
  IntegrationTestSetup,
  IntegrationTestSetup as integrationTestSetup,
} from './integration-test-setup.ts';
export { MockBuilder } from './mock-builder.ts';
export * from './neural-test-helpers.ts';
export {
  PerformanceMeasurement,
  PerformanceMeasurement as performanceMeasurement,
} from './performance-measurement.ts';
export * from './performance-test-suite.ts';
export {
  TestDataFactory,
  TestDataFactory as testDataFactory,
} from './test-data-factory.ts';

// Factory functions
export function createLondonMocks(config?: unknown) {
  const { MockBuilder } = require('./mock-builder.ts');
  return new MockBuilder().createCommonMocks();
}

export function createClassicalMocks(config?: unknown) {
  const { MockBuilder } = require('./mock-builder.ts');
  return new MockBuilder().createCommonMocks();
}

export function createTestLogger(config?: unknown) {
  const { TestLogger } = require('./test-logger.ts');
  return new TestLogger(config as string);
}

export type { DatabaseTestHelper } from './database-test-helper.ts';
export type { FileSystemTestHelper } from './filesystem-test-helper.ts';
export type { NetworkTestHelper } from './network-test-helper.ts';
// Common test utilities
export { TestLogger } from './test-logger.ts';

// Type exports for test configurations
export type {
  AssertionOptions,
  IntegrationTestConfig,
  MockConfiguration,
  PerformanceTestOptions,
  TestDataOptions,
} from './types.ts';
