/**
/// <reference types="./global-types" />
 * Vitest Global Setup
 *
 * This file sets up the global test environment for Vitest tests.
 * It includes enhanced matchers, test utilities, and environment configuration.
 */

// Enhanced matchers from jest-extended (similar functionality for vitest)
import { expect, vi } from 'vitest';

// Add custom matchers for better test assertions
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    }
    return {
      message: () =>
        `expected ${received} to be within range ${floor} - ${ceiling}`,
      pass: false,
    };
  },

  toHaveBeenCalledWithObjectContaining(received: jest.Mock, expected: unknown) {
    const pass = received.mock.calls.some((call: unknown[]) =>
      call.some(
        (arg) =>
          typeof arg === 'object' &&
          arg !== null &&
          Object.keys(expected).every(
            (key) => key in arg && arg[key] === expected[key],
          ),
      ),
    );

    return {
      message: () =>
        pass
          ? `expected mock not to have been called with object containing ${JSON.stringify(expected)}`
          : `expected mock to have been called with object containing ${JSON.stringify(expected)}`,
      pass,
    };
  },
});

// Global test utilities
globalThis.testUtils = {
  /**
   * Create a mock logger for tests
   */
  createMockLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
  }),

  /**
   * Create a mock configuration object
   */
  createMockConfig: (overrides = {}) => ({
    database: {
      type: 'sqlite',
      path: ':memory:',
      ...overrides.database,
    },
    memory: {
      type: 'memory',
      maxSize: 1000,
      ...overrides.memory,
    },
    neural: {
      enabled: false,
      ...overrides.neural,
    },
    ...overrides,
  }),

  /**
   * Wait for a specified amount of time
   */
  wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  /**
   * Create a temporary directory for tests
   */
  createTempDir: async () => {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const os = await import('node:os');

    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), 'claude-zen-test-'),
    );
    return tempDir;
  },

  /**
   * Clean up temporary directory
   */
  cleanupTempDir: async (dirPath: string) => {
    const fs = await import('node:fs/promises');
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
    } catch (_error) {
      // Ignore cleanup errors in tests
    }
  },
};

// Mock global console methods for cleaner test output
const originalConsole = { ...console };
globalThis.restoreConsole = () => {
  Object.assign(console, originalConsole);
};

// Suppress console output during tests (can be restored per test)
console.log = vi.fn();
console.warn = vi.fn();
console.error = vi.fn();
console.info = vi.fn();
console.debug = vi.fn();

// Environment variables for tests
process.env.NODE_ENV = 'test';
process.env.CLAUDE_ZEN_TEST_MODE = 'true';

// Global timeout for async operations in tests
vi.setConfig({ testTimeout: 30000 });

// Add custom domain matchers
import { domainMatchers } from '../src/__tests__/helpers/test-utils.js';

expect.extend(domainMatchers);
