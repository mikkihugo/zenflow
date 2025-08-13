// Jest compatibility shim for Vitest migration.
// Provides minimal jest namespace mapping to vi for transitional period.
// Remove after all tests are refactored to pure Vitest APIs.

import { expect, vi } from 'vitest';

// Map common jest methods to vi equivalents
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const jest: unknown = {
  fn: vi.fn.bind(vi),
  spyOn: vi.spyOn.bind(vi),
  mock: vi.fn.bind(vi),
  clearAllMocks: vi.clearAllMocks.bind(vi),
  resetAllMocks: vi.resetAllMocks.bind(vi),
  restoreAllMocks: vi.restoreAllMocks.bind(vi),
};

// Expose on globalThis for tests using global jest
// @ts-ignore - define global
(globalThis as any).jest = jest;

// Extend expect if needed (placeholder for jest-extended parity if required)
// Example: expect.extend({ toBeWithinRange(received, floor, ceiling) { ... } })
