/**
 * Jest Test Setup
 * Global configuration and mocks for all tests
 */

// Global test configuration
global.console = {
  ...console,
  // Uncomment to suppress console output during tests
  // log: vi.fn(),
  // debug: vi.fn(),
  // info: vi.fn(),
  // warn: vi.fn(),
  error: console.error, // Keep errors visible
};

// WebAssembly polyfill for Node.js environments that might not have it
if (typeof global.WebAssembly === 'undefined') {
  global.WebAssembly = {
    Memory: class MockMemory {
      constructor(descriptor) {
        this.descriptor = descriptor;
        this.buffer = new ArrayBuffer(descriptor.initial * 65536);
      }
    },
    Module: class MockModule {},
    Instance: class MockInstance {
      constructor(_module, imports) {
        this.exports = {
          memory: new global.WebAssembly.Memory({ initial: 1 }),
          ...(imports?.env || {}),
        };
      }
    },
    instantiate: vi.fn().mockResolvedValue({
      instance: new global.WebAssembly.Instance(),
      module: new global.WebAssembly.Module(),
    }),
    instantiateStreaming: vi.fn().mockResolvedValue({
      instance: new global.WebAssembly.Instance(),
      module: new global.WebAssembly.Module(),
    }),
  };
}

// Mock worker_threads for environments that don't support it
jest.mock(
  'worker_threads',
  () => ({
    Worker: vi.fn(),
    isMainThread: true,
    parentPort: null,
    workerData: null,
    MessageChannel: vi.fn(),
    MessagePort: vi.fn(),
    moveMessagePortToContext: vi.fn(),
    receiveMessageOnPort: vi.fn(),
    threadId: 0,
  }),
  { virtual: true }
);

// Mock fs/promises for Node.js compatibility
jest.mock(
  'fs/promises',
  () => ({
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn(),
    access: vi.fn(),
  }),
  { virtual: true }
);

// Mock better-sqlite3 for tests that don't need real database
jest.mock(
  'better-sqlite3',
  () => {
    return vi.fn().mockImplementation(() => ({
      prepare: vi.fn().mockReturnValue({
        run: vi.fn(),
        get: vi.fn(),
        all: vi.fn().mockReturnValue([]),
        iterate: vi.fn(),
      }),
      exec: vi.fn(),
      close: vi.fn(),
      transaction: vi.fn().mockReturnValue(() => {}),
      pragma: vi.fn(),
    }));
  },
  { virtual: true }
);

// Mock UUID generation for consistent test results
jest.mock(
  'uuid',
  () => ({
    v4: vi.fn(
      () =>
        `mock-uuid-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    ),
  }),
  { virtual: true }
);

// Mock WebSocket for MCP tests
jest.mock(
  'ws',
  () => ({
    WebSocket: vi.fn().mockImplementation(() => ({
      on: vi.fn(),
      send: vi.fn(),
      close: vi.fn(),
      readyState: 1, // OPEN
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3,
    })),
    WebSocketServer: vi.fn().mockImplementation(() => ({
      on: vi.fn(),
      close: vi.fn(),
    })),
  }),
  { virtual: true }
);

// Performance polyfill for older Node.js versions
if (typeof global.performance === 'undefined') {
  global.performance = {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    getEntries: () => [],
    getEntriesByName: () => [],
    getEntriesByType: () => [],
    clearMarks: () => {},
    clearMeasures: () => {},
  };
}

// Set up default timeouts
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  /**
   * Wait for a specific amount of time
   */
  wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),

  /**
   * Create a mock agent configuration
   */
  createMockAgent: (overrides = {}) => ({
    id: `mock-agent-${Date.now()}`,
    type: 'researcher',
    name: 'test-agent',
    capabilities: ['research', 'analysis'],
    status: 'idle',
    ...overrides,
  }),

  /**
   * Create a mock swarm configuration
   */
  createMockSwarm: (overrides = {}) => ({
    id: `mock-swarm-${Date.now()}`,
    name: 'test-swarm',
    topology: 'mesh',
    maxAgents: 10,
    strategy: 'balanced',
    ...overrides,
  }),

  /**
   * Create a mock task configuration
   */
  createMockTask: (overrides = {}) => ({
    id: `mock-task-${Date.now()}`,
    description: 'Test task',
    priority: 'medium',
    status: 'pending',
    dependencies: [],
    ...overrides,
  }),

  /**
   * Mock WASM module loader
   */
  createMockWasmModule: () => ({
    exports: {
      initialize: vi.fn().mockReturnValue(true),
      getVersion: vi.fn().mockReturnValue('0.2.0'),
      createAgent: vi.fn().mockReturnValue('mock-agent'),
      createSwarm: vi.fn().mockReturnValue('mock-swarm'),
      getMemoryUsage: vi
        .fn()
        .mockReturnValue({ heapUsed: 1024, heapTotal: 2048 }),
    },
  }),
};

// Environment detection
global.testEnv = {
  isCI: process.env.CI === 'true',
  isGitHub: process.env.GITHUB_ACTIONS === 'true',
  nodeVersion: process.version,
  platform: process.platform,
  arch: process.arch,
};

// Suppress deprecation warnings in tests
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning') {
    return; // Suppress deprecation warnings
  }
  console.warn(warning);
});

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in tests, just log
});

// Cleanup after each test
afterEach(() => {
  // Clear all timers
  jest.clearAllTimers();

  // Clear all mocks
  jest.clearAllMocks();

  // Reset modules
  jest.resetModules();
});

// Global cleanup
afterAll(() => {
  // Final cleanup
  jest.restoreAllMocks();
});
