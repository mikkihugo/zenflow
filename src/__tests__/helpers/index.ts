/**
 * Enhanced Test Helper Utilities - Hybrid TDD Support
 *
 * @fileoverview Comprehensive test utilities for Claude-Zen
 * Supports both London School (mock-heavy, interaction-focused)
 * and Classical School (real object, state-focused) testing approaches
 * Enhanced with domain-specific helpers for coordination, neural, and interface testing
 */

// Legacy Test Helpers (backward compatibility)
export { AssertionHelpers, AssertionHelpers as assertionHelpers } from './assertion-helpers';
export * from './coordination-test-helpers';
// Enhanced Hybrid TDD Helpers
export * from './hybrid-test-utilities';
export {
  IntegrationTestSetup,
  IntegrationTestSetup as integrationTestSetup,
} from './integration-test-setup';
export { MockBuilder } from './mock-builder';
export * from './neural-test-helpers';
export {
  PerformanceMeasurement,
  PerformanceMeasurement as performanceMeasurement,
} from './performance-measurement';
export * from './performance-test-suite';
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
