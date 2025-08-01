/**
 * Test Helper Utilities - Supporting Both London and Classical TDD
 *
 * @fileoverview Comprehensive test utilities for Claude Code Flow
 * Supports both London School (mock-heavy, interaction-focused)
 * and Classical School (real object, state-focused) testing approaches
 */

export { AssertionHelpers, AssertionHelpers as assertionHelpers } from './assertion-helpers';
export {
  IntegrationTestSetup,
  IntegrationTestSetup as integrationTestSetup,
} from './integration-test-setup';
export { MockBuilder } from './mock-builder';
export {
  PerformanceMeasurement,
  PerformanceMeasurement as performanceMeasurement,
} from './performance-measurement';
// Missing exports for compatibility
export { TestDataFactory, TestDataFactory as testDataFactory } from './test-data-factory';

// Factory functions
export function createLondonMocks(config?: any) {
  return new MockBuilder().withLondonStyle().build(config);
}

export function createClassicalMocks(config?: any) {
  return new MockBuilder().withClassicalStyle().build(config);
}

export function createTestLogger(config?: any) {
  return new TestLogger(config);
}

export { DatabaseTestHelper } from './database-test-helper';
export { FileSystemTestHelper } from './filesystem-test-helper';
export { NetworkTestHelper } from './network-test-helper';
// Common test utilities
export { TestLogger } from './test-logger';

// Type exports for test configurations
export type {
  AssertionOptions,
  IntegrationTestConfig,
  MockConfiguration,
  PerformanceTestOptions,
  TestDataOptions,
} from './types';
