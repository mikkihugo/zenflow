import { vi} from 'vitest';

// Global test setup for LLM providers
beforeEach(() => {
  // Clear all mocks before each test (only for any specific test mocks)
  vi.clearAllMocks();

  // Reset environment variables
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'silent';

  // Clear any global state
  if (global.gc) {
    global.gc();
}
});

afterEach(() => {
  // Cleanup after each test
  vi.restoreAllMocks();
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log:vi.fn(),
  debug:vi.fn(),
  info:vi.fn(),
  warn:vi.fn(),
  error:vi.fn(),
};

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, ' reason:', reason);
});

// ✅ NO GLOBAL MOCKS NEEDED!
// We have the real packages available in the workspace:
// - @claude-zen/foundation (in packages/core/foundation)
// - @anthropic-ai/claude-code (in root dependencies)
