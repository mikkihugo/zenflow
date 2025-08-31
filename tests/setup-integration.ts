/**
 * Integration Test Setup
 *
 * @file Setup configuration for integration testing
 * Focus:Component boundaries, system integration, protocol compliance
 */

// Import Vitest globals and utilities
import { afterEach, beforeEach, expect, vi } from 'vitest';
import './global-types';

// Integration test setup with hybrid approach
beforeEach(async () => {
  // Setup integration test environment
  await setupIntegrationEnvironment();

  // Initialize test databases and storage
  await initializeTestStorage();

  // Setup network mocking for external services
  setupNetworkMocking();
});

afterEach(async () => {
  // Cleanup integration test state
  await cleanupIntegrationState();

  // Reset network mocks
  resetNetworkMocks();
});

async function setupIntegrationEnvironment() {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.ZEN_TEST_MODE = 'integration';
  process.env.ZEN_LOG_LEVEL = 'error'; // Reduce noise in tests

  // Initialize test-specific configurations
  globalThis.testConfig = {
    database: {
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      logging: false,
    },
    redis: {
      host: 'localhost',
      port: 6379,
      db: 15, // Use separate test DB
    },
    ports: {
      mcp: 30001,
      web: 30002,
      api: 30003,
    },
  };
}

async function initializeTestStorage() {
  // Create in-memory test databases
  globalThis.testDatabases = {
    main: null,
    vector: null,
    cache: null,
  };

  // Setup test data fixtures
  globalThis.testFixtures = {
    users: [],
    swarms: [],
    agents: [],
    tasks: [],
  };
}

function setupNetworkMocking() {
  // Mock HTTP requests for external services
  globalThis.mockFetch = vi.fn();
  globalThis.originalFetch = globalThis.fetch;
  globalThis.fetch = globalThis.mockFetch;

  // Setup WebSocket mocking
  globalThis.mockWebSocket = vi.fn();
  globalThis.originalWebSocket = globalThis.WebSocket;

  // Mock process spawning for subprocess testing
  globalThis.mockSpawn = vi.fn();
}

function resetNetworkMocks() {
  if (globalThis.originalFetch) {
    globalThis.fetch = globalThis.originalFetch;
  }
  if (globalThis.originalWebSocket) {
    globalThis.WebSocket = globalThis.originalWebSocket;
  }
  vi.clearAllMocks();
}

async function cleanupIntegrationState() {
  // Close test databases
  if (globalThis.testDatabases) {
    for (const db of Object.values(globalThis.testDatabases)) {
      if (db && typeof (db as any).close === 'function') {
        await (db as any).close();
      }
    }
  }

  // Clear test fixtures
  globalThis.testFixtures = {};

  // Clean environment variables
  process.env.ZEN_TEST_MODE = undefined;
}

/**
 * @file Integration test setup utilities and helpers
 */

/**
 * HTTP route configuration for test server
 *
 * @example
 */
interface TestRoute {
  /** HTTP method (get, post, put, delete) */
  method: 'get|post|put|delete';
  /** Route path */
  path: string;
  /** Route handler function */
  handler: (req: unknown, res: unknown) => void;
}

/**
 * Test HTTP client interface
 *
 * @example
 */
interface TestClient {
  /** Perform GET request */
  get: (path: string) => Promise<Response>;
  /** Perform POST request */
  post: (path: string, data: unknown) => Promise<Response>;
  /** Perform PUT request */
  put: (path: string, data: unknown) => Promise<Response>;
  /** Perform DELETE request */
  delete: (path: string) => Promise<Response>;
}

// Integration test helpers
/**
 * Creates a test Express server with specified routes
 *
 * @param port - Port number to listen on
 * @param routes - Array of route configurations
 * @returns Promise resolving to server instance
 */
globalThis.createTestServer = async (
  port: number,
  routes: TestRoute[] = []
) => {
  const express = await import('express');
  const app = (express as any).default
    ? (express as any).default()
    : (express as any)();

  routes.forEach((route) => {
    app[route.method](route.path, route.handler);
  });

  return new Promise((resolve, reject) => {
    const server = app.listen(port, (err?: Error) => {
      if (err) reject(err);
      else resolve(server);
    });
  });
};

/**
 * Creates a test HTTP client for making requests
 *
 * @param baseURL - Base URL for all requests
 * @returns Test client interface
 */
globalThis.createTestClient = (baseURL: string): TestClient => {
  return {
    get: (path: string) => fetch('${baseURL}' + path),
    post: (path: string, data: unknown) =>
      fetch('${baseURL}' + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    put: (path: string, data: unknown) =>
      fetch('${baseURL}' + path, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    delete: (path: string) => fetch('${baseURL}' + path, { method: 'DELETE' }),
  };
};

globalThis.waitForPort = async (port: number, timeout: number = 5000) => {
  const net = await import('node:net');
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      await new Promise((resolve, reject) => {
        const socket = net.createConnection(port, 'localhost');
        socket.on('connect', () => {
          socket.destroy();
          resolve(true);
        });
        socket.on('error', reject);
        setTimeout(() => reject(new Error('Timeout')), 1000);
      });
      return true;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error('Port ${port} not available within ' + timeout + 'ms');
};

/**
 * Database fixture data structure
 *
 * @example
 */
interface DatabaseFixtures {
  [table: string]: unknown;
}

/**
 * Mock agent for testing
 *
 * @example
 */
interface MockAgent {
  /** Agent ID */
  id: string;
  /** Agent type */
  type: string;
  /** Current status */
  status: 'idle' | 'working' | 'offline';
  /** Assigned tasks */
  tasks: unknown[];
}

/**
 * Mock swarm for testing
 *
 * @example
 */
interface MockSwarm {
  /** Swarm ID */
  id: string;
  /** Swarm agents */
  agents: MockAgent[];
  /** Swarm coordinator */
  coordinator: unknown | null;
  /** Swarm status */
  status: string;
}

/**
 * Sets up database fixtures for testing
 *
 * @param fixtures - Database fixtures to load
 */
globalThis.setupDatabaseFixtures = async (fixtures: DatabaseFixtures) => {
  // Load test data into databases
  for (const [table, data] of Object.entries(fixtures)) {
    globalThis.testFixtures[table] = data;
  }
};

/**
 * Creates a mock swarm for testing
 *
 * @param agentCount - Number of agents to create
 * @returns Mock swarm instance
 */
globalThis.createMockSwarm = (agentCount: number = 3): MockSwarm => {
  const swarm: MockSwarm = {
    id: 'test-swarm-' + Date.now(),
    agents: [],
    coordinator: null,
    status: 'active',
  };

  for (let i = 0; i < agentCount; i++) {
    swarm.agents.push({
      id: 'agent-' + i,
      type: 'worker',
      status: 'idle',
      tasks: [],
    });
  }

  return swarm;
};

/**
 * Simulates a swarm workflow for testing
 *
 * @param swarm - Mock swarm instance
 * @param tasks - Tasks to execute
 * @returns Promise resolving to workflow results
 */
globalThis.simulateSwarmWorkflow = async (
  swarm: MockSwarm,
  tasks: unknown[]
) => {
  const results: Array<{
    taskId: string;
    agentId: string;
    result: string;
    timestamp: number;
  }> = [];
  for (const task of tasks) {
    const agent = swarm.agents.find((a) => a.status === 'idle');
    if (agent) {
      agent.status = 'working';
      agent.tasks.push(task);

      // Simulate work
      await new Promise((resolve) => setTimeout(resolve, 10));

      results.push({
        taskId: (task as { id: string }).id,
        agentId: agent.id,
        result: 'completed',
        timestamp: Date.now(),
      });

      agent.status = 'idle';
      agent.tasks = agent.tasks.filter(
        (t) => (t as { id: string }).id !== (task as { id: string }).id
      );
    }
  }
  return results;
};

/**
 * Mock MCP client for testing
 *
 * @example
 */
interface MockMCPClient {
  /** Send message to MCP server */
  send: any;
  /** Connect to MCP server */
  connect: any;
  /** Disconnect from MCP server */
  disconnect: any;
  /** List available tools */
  listTools: any;
  /** Call a specific tool */
  callTool: any;
}

/**
 * MCP protocol message structure
 *
 * @example
 */
interface MCPMessage {
  /** JSON-RPC version */
  jsonrpc: string;
  /** Message ID */
  id: string | number;
  /** Method name */
  method: string;
  /** Method parameters */
  params?: unknown;
}

// Protocol testing helpers
/**
 * Creates a mock MCP client for testing
 *
 * @returns Mock MCP client instance
 */
globalThis.createMockMCPClient = (): MockMCPClient => {
  return {
    send: vi.fn().mockResolvedValue({ success: true }),
    connect: vi.fn().mockResolvedValue(true),
    disconnect: vi.fn().mockResolvedValue(true),
    listTools: vi.fn().mockResolvedValue([]),
    callTool: vi.fn().mockResolvedValue({ result: 'mock' }),
  };
};

/**
 * Validates MCP protocol message structure
 *
 * @param message - Message to validate
 */
globalThis.validateMCPProtocol = (message: MCPMessage) => {
  expect(message).toHaveProperty('jsonrpc', '2.0');
  expect(message).toHaveProperty('id');
  expect(message).toHaveProperty('method');
  if (message.method !== 'notification') {
    expect(message).toHaveProperty('params');
  }
};

// Extended timeout for integration tests
// Vitest timeout is configured in vitest.config.ts

/**
 * Database configuration interface
 *
 * @example
 */
interface DatabaseConfig {
  /** SQLite configuration */
  sqlite?: unknown;
  /** PostgreSQL configuration */
  postgres?: unknown;
  /** LanceDB configuration */
  lancedb?: unknown;
}

/**
 * Redis configuration interface
 *
 * @example
 */
interface RedisConfig {
  /** Redis host */
  host?: string;
  /** Redis port */
  port?: number;
  /** Redis password */
  password?: string;
}

/**
 * Port configuration interface
 *
 * @example
 */
interface PortConfig {
  /** HTTP API port */
  api?: number;
  /** WebSocket port */
  websocket?: number;
  /** MCP server port */
  mcp?: number;
}

// Types are now declared in global-types.ts
