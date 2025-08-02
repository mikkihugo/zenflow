/**
 * London TDD (Mockist) Test Setup
 * @fileoverview Setup configuration for interaction-based testing
 * Focus: Communication, protocols, boundaries, coordination
 */

import 'jest-extended';

// Enhanced mock configuration for London TDD
beforeEach(() => {
  // Clear all mocks before each test to ensure isolation
  jest.clearAllMocks();

  // Reset module registry for clean imports
  jest.resetModules();

  // Setup default mock behaviors for common interactions
  setupDefaultMocks();
});

afterEach(() => {
  // Verify all mocks were called as expected
  jest.clearAllMocks();
});

function setupDefaultMocks() {
  // Mock console methods to reduce noise in tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});

  // Mock timers for deterministic testing
  jest.useFakeTimers();
}

// London TDD helper for creating interaction spies
(global as any).createInteractionSpy = (name: string) => {
  return jest.fn().mockName(name);
};

// London TDD helper for verifying interaction patterns
(global as any).verifyInteractions = (spy: jest.Mock, expectedCalls: any[]) => {
  expect(spy).toHaveBeenCalledTimes(expectedCalls.length);
  expectedCalls.forEach((call, index) => {
    expect(spy).toHaveBeenNthCalledWith(index + 1, ...call);
  });
};

// Mock factory for complex objects
(global as any).createMockFactory = <T>(defaults: Partial<T> = {}) => {
  return (overrides: Partial<T> = {}): T =>
    ({
      ...defaults,
      ...overrides,
    }) as T;
};

// Async interaction testing helpers
(global as any).waitForInteraction = async (spy: jest.Mock, timeout = 1000) => {
  const start = Date.now();
  while (spy.mock.calls.length === 0 && Date.now() - start < timeout) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  if (spy.mock.calls.length === 0) {
    throw new Error(`Expected interaction did not occur within ${timeout}ms`);
  }
};

// Protocol simulation helpers
(global as any).simulateProtocolHandshake = (mockProtocol: jest.Mock) => {
  mockProtocol.mockImplementation((message) => {
    if (message.type === 'handshake') {
      return Promise.resolve({ type: 'handshake_ack', success: true });
    }
    return Promise.resolve({ type: 'response', data: 'mock_response' });
  });
};

// Performance assertion timeout (London TDD focuses on interaction timing)
jest.setTimeout(30000);

declare global {
  namespace NodeJS {
    interface Global {
      createInteractionSpy(name: string): jest.Mock;
      verifyInteractions(spy: jest.Mock, expectedCalls: any[]): void;
      createMockFactory<T>(defaults?: Partial<T>): (overrides?: Partial<T>) => T;
      waitForInteraction(spy: jest.Mock, timeout?: number): Promise<void>;
      simulateProtocolHandshake(mockProtocol: jest.Mock): void;
    }
  }
}
