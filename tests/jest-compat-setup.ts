/**
 * Jest Compatibility Setup for Vitest
 *
 * This file provides Jest compatibility APIs for tests that expect Jest globals.
 * It bridges the gap between Jest and Vitest APIs.
 */

import { expect, vi, describe, it, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

// Make Vitest globals available as Jest globals
global.describe = describe;
global.it = it;
global.test = it;
global.beforeEach = beforeEach;
global.afterEach = afterEach;
global.beforeAll = beforeAll;
global.afterAll = afterAll;
global.expect = expect;

// Jest-specific matchers that might be used
expect.extend({
  toBeCalled: (received: any) => {
    const pass = received.mock.calls.length > 0;
    return {
      message: () => `expected ${received} to be called`,
      pass,
    };
  },

  toBeCalledTimes: (received: any, expected: number) => {
    const pass = received.mock.calls.length === expected;
    return {
      message: () => `expected ${received} to be called ${expected} times, but was called ${received.mock.calls.length} times`,
      pass,
    };
  },

  toBeCalledWith: (received: any, ...expected: any[]) => {
    const calls = received.mock.calls;
    const pass = calls.some((call: any[]) =>
      call.length === expected.length &&
      call.every((arg, index) => arg === expected[index])
    );
    return {
      message: () => `expected ${received} to be called with ${expected.join(', ')}`,
      pass,
    };
  },
});

// Mock functions that might be expected
Object.defineProperty(global, 'jest', {
  value: {
    fn: vi.fn,
    mock: vi.mock,
    spyOn: vi.spyOn,
    clearAllMocks: vi.clearAllMocks,
    resetAllMocks: vi.resetAllMocks,
    restoreAllMocks: vi.restoreAllMocks,
    mockImplementation: vi.fn,
    mockReturnValue: vi.fn,
    mockResolvedValue: vi.fn,
    mockRejectedValue: vi.fn,
  },
  writable: true,
  configurable: true,
});
