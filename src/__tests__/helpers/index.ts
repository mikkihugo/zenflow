/**
 * Test Helper Utilities - Supporting Both London and Classical TDD
 * 
 * @fileoverview Comprehensive test utilities for Claude Code Flow
 * Supports both London School (mock-heavy, interaction-focused) 
 * and Classical School (real object, state-focused) testing approaches
 */

export { MockBuilder } from './mock-builder';
export { TestDataFactory } from './test-data-factory';
export { AssertionHelpers } from './assertion-helpers';
export { PerformanceMeasurement } from './performance-measurement';
export { IntegrationTestSetup } from './integration-test-setup';

// Missing exports for compatibility
export { TestDataFactory as testDataFactory } from './test-data-factory';
export { AssertionHelpers as assertionHelpers } from './assertion-helpers';
export { PerformanceMeasurement as performanceMeasurement } from './performance-measurement';
export { IntegrationTestSetup as integrationTestSetup } from './integration-test-setup';

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

// Common test utilities
export { TestLogger } from './test-logger';
export { DatabaseTestHelper } from './database-test-helper';
export { FileSystemTestHelper } from './filesystem-test-helper';
export { NetworkTestHelper } from './network-test-helper';

// Type exports for test configurations
export type {
  MockConfiguration,
  TestDataOptions,
  PerformanceTestOptions,
  IntegrationTestConfig,
  AssertionOptions
} from './types';