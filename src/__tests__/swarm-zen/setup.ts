// Test setup file
// Configure test environment

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  // Keep error for debugging
  error: console.error,
};
