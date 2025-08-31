/**
 * @fileoverview Vitest Global Setup for Foundation Package
 *
 * Global test setup, teardown, and utilities for all test types.
 */

import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { getLogger } from '../../src/core/logging';

// Global test setup
beforeAll(async () => {
  // Initialize logging for tests
  const logger = getLogger('foundation-tests');
  logger.info(' Starting Foundation test suite');

  // Set test environment variables
  process.env['NODE_ENV'] = 'test';
  process.env['LOG_LEVEL'] = 'warn'; // Reduce noise during tests
});

afterAll(async () => {
  const logger = getLogger('foundation-tests');
  logger.info(' Foundation test suite completed');
});

// Per-test setup
beforeEach(() => {
  // Reset any global state before each test
});

afterEach(() => {
  // Clean up after each test
  vi.clearAllMocks?.();
});

// Test utilities
export const testUtils = {
  mockLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  }),

  createMockConfig: () => ({
    debug: false,
    metrics: false,
    storage: { type: 'memory' },
    neural: { enabled: false },
  }),

  // Helper to wait for async operations
  waitFor: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  // Helper to create test IDs
  createTestId: () =>
    'test-${Date.now()}-' + Math.random().toString(36).substr(2, 9),
};

declare global {
  const testUtils: {
    mockLogger: () => {
      debug: any;
      info: any;
      warn: any;
      error: any;
      fatal: any;
    };
    createMockConfig: () => {
      debug: boolean;
      metrics: boolean;
      storage: { type: string };
      neural: { enabled: boolean };
    };
    waitFor: (ms: number) => Promise<unknown>;
    createTestId: () => string;
  };
}

// Make testUtils globally available
(globalThis as any).testUtils = testUtils;
