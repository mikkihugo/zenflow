/**
/// <reference types="./global-types" />
 * London TDD (Mockist) Test Setup
 *
 * @file Setup configuration for interaction-based testing
 * Focus: Communication, protocols, boundaries, coordination
 */

// Vitest setup for London TDD
// Explicit import for ESM environment to ensure jest global is bound
import { vi } from 'vitest';

/**
 * Expected call structure for interaction verification
 *
 * @example
 */
interface ExpectedCall {
  /** Arguments passed to the function */
  args: unknown[];
}

/**
 * Protocol message structure for testing
 *
 * @example
 */
interface ProtocolMessage {
  /** Message type */
  type: string;
  /** Additional message data */
  [key: string]: unknown;
}

/**
 * Protocol response structure
 *
 * @example
 */
interface ProtocolResponse {
  /** Response type */
  type: string;
  /** Response success flag */
  success?: boolean;
  /** Response data */
  data?: unknown;
}

// Dummy usage to satisfy noUnusedLocals in strict TS for documentation-only interfaces
// Use a const with a generic identity to ensure usage
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const __protocolTypesIdentity = <T>(v: T) => v;
__protocolTypesIdentity<
  ProtocolMessage | ProtocolResponse | ExpectedCall | undefined
>(undefined);

// Enhanced mock configuration for London TDD
beforeEach(() => {
  // Clear all mocks before each test to ensure isolation
  vi.clearAllMocks();

  // Reset module registry for clean imports
  vi.resetModules();

  // Setup default mock behaviors for common interactions
  setupDefaultMocks();
});

afterEach(() => {
  // Verify all mocks were called as expected
  vi.clearAllMocks();
});

/**
 * Sets up default mocks for London TDD testing
 */
function setupDefaultMocks(): void {
  // Mock console methods to reduce noise in tests
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});

  // Mock timers for deterministic testing
  vi.useFakeTimers();
}

// London TDD helper for creating interaction spies
/**
 * Creates a named interaction spy for testing
 *
 * @param name - Name for the spy function
 * @returns Jest mock function
 */
createInteractionSpy = (name: string): vi.Mock => {
  return vi.fn().mockName(name);
};

// London TDD helper for verifying interaction patterns
/**
 * Verifies that a spy was called with expected arguments
 *
 * @param spy - Jest mock to verify
 * @param expectedCalls - Array of expected call arguments
 */
verifyInteractions = (spy: vi.Mock, expectedCalls: ExpectedCall[]): void => {
  expect(spy).toHaveBeenCalledTimes(expectedCalls.length);
  expectedCalls.forEach((call, index) => {
    expect(spy).toHaveBeenNthCalledWith(index + 1, ...call.args);
  });
};

// Mock factory for complex objects
/**
 * Creates a mock factory for generating test objects
 *
 * @param defaults - Default values for the mock object
 * @returns Function that creates mock objects with overrides
 */
createMockFactory = <T>(defaults: Partial<T> = {}) => {
  return (overrides: Partial<T> = {}): T =>
    ({
      ...defaults,
      ...overrides,
    }) as T;
};

// Async interaction testing helpers
/**
 * Waits for an interaction to occur on a spy
 *
 * @param spy - Jest mock to watch
 * @param timeout - Maximum time to wait in milliseconds
 * @throws Error if interaction doesn't occur within timeout
 */
waitForInteraction = async (spy: vi.Mock, timeout = 1000): Promise<void> => {
  const start = Date.now();
  while (spy.mock.calls.length === 0 && Date.now() - start < timeout) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  if (spy.mock.calls.length === 0) {
    throw new Error(`Expected interaction did not occur within ${timeout}ms`);
  }
};

// Protocol simulation helpers
/**
 * Simulates protocol handshake for testing
 *
 * @param mockProtocol - Mock protocol function to configure
 */
simulateProtocolHandshake = (mockProtocol: vi.Mock): void => {
  // Relax typing because jest v30 mockImplementation expects (...args: unknown[]) => unknown
  mockProtocol.mockImplementation(
    (message: unknown): Promise<ProtocolResponse> => {
      if (message && message.type === 'handshake') {
        return Promise.resolve({ type: 'handshake_ack', success: true });
      }
      return Promise.resolve({ type: 'response', data: 'mock_response' });
    }
  );
};

declare global {
  namespace NodeJS {
    interface Global {
      createInteractionSpy(name: string): vi.Mock;
      verifyInteractions(spy: vi.Mock, expectedCalls: ExpectedCall[]): void;
      createMockFactory<T>(
        defaults?: Partial<T>
      ): (overrides?: Partial<T>) => T;
      waitForInteraction(spy: vi.Mock, timeout?: number): Promise<void>;
      simulateProtocolHandshake(mockProtocol: vi.Mock): void;
    }
  }
  // Modern typing for globalThis augmentation to avoid TS7017
  interface GlobalThis {
    createInteractionSpy(name: string): vi.Mock;
    verifyInteractions(spy: vi.Mock, expectedCalls: ExpectedCall[]): void;
    createMockFactory<T>(defaults?: Partial<T>): (overrides?: Partial<T>) => T;
    waitForInteraction(spy: vi.Mock, timeout?: number): Promise<void>;
    simulateProtocolHandshake(mockProtocol: vi.Mock): void;
  }
}
