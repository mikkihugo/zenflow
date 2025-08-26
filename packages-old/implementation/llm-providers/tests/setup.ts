import { vi } from 'vitest';

// Global test setup for LLM providers
beforeEach(() => {
  // Clear all mocks before each test
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
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (_reason, _promise) => {'
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);'
});

// Mock external dependencies that might not be available in test environment
vi.mock('@anthropic-ai/claude-code', () => ({'
  ClaudeCodeSDK: vi.fn(() => ({
    sendMessage: vi.fn(),
    createSession: vi.fn(),
    closeSession: vi.fn(),
    streamMessage: vi.fn(),
  })),
  default: vi.fn(),
}));

// Mock Claude Code SDK query function
vi.mock('@anthropic-ai/claude-code/sdk.mjs', () => ({'
  query: vi.fn().mockResolvedValue({
    choices: [{ message: { content: 'Mocked response', role: 'assistant' } }],
    usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
  }),
}));

// Mock foundation dependencies including Zod
vi.mock('@claude-zen/foundation', () => ({'
  getLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
  Result: {
    ok: (value: any) => ({
      isOk: () => true,
      isErr: () => false,
      _unsafeUnwrap: () => value,
      value,
      error: undefined,
    }),
    err: (error: any) => ({
      isOk: () => false,
      isErr: () => true,
      _unsafeUnwrapErr: () => error,
      error: { message: error?.message||'Test error'},
      value: undefined,
    }),
  },
  ok: (value: any) => ({
    isOk: () => true,
    isErr: () => false,
    _unsafeUnwrap: () => value,
    value,
    error: undefined,
  }),
  err: (error: any) => ({
    isOk: () => false,
    isErr: () => true,
    _unsafeUnwrapErr: () => error,
    error: { message: error?.message||'Test error'},
    value: undefined,
  }),
  withRetry: vi.fn().mockImplementation(async (fn: Function, _options?: any) => {
      return await fn();
  }),
  TypedEventBase: vi.fn().mockImplementation(() => ({
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
  })),
  validateInput: vi.fn().mockImplementation((_schema: any, data: any) => {
    const result = {
      isOk: () => true,
      isErr: () => false,
      value: data||{},
      error: undefined,
    };
    return result;
  }),
  z: {
    object: vi.fn(() => {
      const chainable = {
        parse: vi.fn((data: any) => data),
        safeParse: vi.fn((data: any) => ({ success: true, data })),
      };
      return chainable;
    }),
    array: vi.fn(() => {
      const chainable = {
        parse: vi.fn((data: any) => data),
        min: vi.fn(() => chainable),
      };
      return chainable;
    }),
    string: vi.fn(() => {
      const chainable = {
        parse: vi.fn((data: any) => data),
        min: vi.fn(() => chainable),
        optional: vi.fn(() => chainable),
      };
      return chainable;
    }),
    enum: vi.fn(() => {
      const chainable = {
        parse: vi.fn((data: any) => data),
      };
      return chainable;
    }),
    optional: vi.fn(() => {
      const chainable = {
        parse: vi.fn((data: any) => data),
      };
      return chainable;
    }),
    number: vi.fn(() => {
      const chainable = {
        parse: vi.fn((data: any) => data),
        min: vi.fn(() => chainable),
        max: vi.fn(() => chainable),
        default: vi.fn(() => chainable),
        optional: vi.fn(() => chainable),
      };
      return chainable;
    }),
    boolean: vi.fn(() => {
      const chainable = {
        parse: vi.fn((data: any) => data),
        optional: vi.fn(() => chainable),
        default: vi.fn(() => chainable),
      };
      return chainable;
    }),
    record: vi.fn(() => {
      const chainable = {
        parse: vi.fn((data: any) => data),
        optional: vi.fn(() => chainable),
      };
      return chainable;
    }),
    unknown: vi.fn(() => {
      const chainable = {
        parse: vi.fn((data: any) => data),
      };
      return chainable;
    }),
  },
}));

// Mock infrastructure dependencies
vi.mock('@claude-zen/infrastructure', () => ({'
  getDatabaseAccess: vi.fn(() => ({
    query: vi.fn(),
    execute: vi.fn(),
    close: vi.fn(),
  })),
  getEventSystem: vi.fn(() => ({
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  })),
}));
