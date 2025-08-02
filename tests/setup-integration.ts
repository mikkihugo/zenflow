/**
 * Integration Test Setup
 * @fileoverview Setup configuration for integration testing
 * Focus: Component boundaries, system integration, protocol compliance
 */

import 'jest-extended';

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
  process.env.CLAUDE_ZEN_TEST_MODE = 'integration';
  process.env.CLAUDE_ZEN_LOG_LEVEL = 'error'; // Reduce noise in tests

  // Initialize test-specific configurations
  global.testConfig = {
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
  global.testDatabases = {
    main: null,
    vector: null,
    cache: null,
  };

  // Setup test data fixtures
  global.testFixtures = {
    users: [],
    swarms: [],
    agents: [],
    tasks: [],
  };
}

function setupNetworkMocking() {
  // Mock HTTP requests for external services
  global.mockFetch = jest.fn();
  global.originalFetch = global.fetch;
  global.fetch = global.mockFetch;

  // Setup WebSocket mocking
  global.mockWebSocket = jest.fn();
  global.originalWebSocket = global.WebSocket;

  // Mock process spawning for subprocess testing
  global.mockSpawn = jest.fn();
}

function resetNetworkMocks() {
  if (global.originalFetch) {
    global.fetch = global.originalFetch;
  }
  if (global.originalWebSocket) {
    global.WebSocket = global.originalWebSocket;
  }
  jest.clearAllMocks();
}

async function cleanupIntegrationState() {
  // Close test databases
  if (global.testDatabases) {
    for (const db of Object.values(global.testDatabases)) {
      if (db && typeof db.close === 'function') {
        await db.close();
      }
    }
  }

  // Clear test fixtures
  global.testFixtures = {};

  // Clean environment variables
  delete process.env.CLAUDE_ZEN_TEST_MODE;
}

// Integration test helpers
global.createTestServer = async (port: number, routes: any[] = []) => {
  const express = await import('express');
  const app = express.default();

  routes.forEach((route) => {
    app[route.method](route.path, route.handler);
  });

  return new Promise((resolve, reject) => {
    const server = app.listen(port, (err?: any) => {
      if (err) reject(err);
      else resolve(server);
    });
  });
};

global.createTestClient = (baseURL: string) => {
  return {
    get: (path: string) => fetch(`${baseURL}${path}`),
    post: (path: string, data: any) =>
      fetch(`${baseURL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    put: (path: string, data: any) =>
      fetch(`${baseURL}${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    delete: (path: string) => fetch(`${baseURL}${path}`, { method: 'DELETE' }),
  };
};

global.waitForPort = async (port: number, timeout: number = 5000) => {
  const net = await import('net');
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
  throw new Error(`Port ${port} not available within ${timeout}ms`);
};

global.setupDatabaseFixtures = async (fixtures: any) => {
  // Load test data into databases
  for (const [table, data] of Object.entries(fixtures)) {
    global.testFixtures[table] = data;
  }
};

global.createMockSwarm = (agentCount: number = 3) => {
  const swarm = {
    id: `test-swarm-${Date.now()}`,
    agents: [],
    coordinator: null,
    status: 'active',
  };

  for (let i = 0; i < agentCount; i++) {
    swarm.agents.push({
      id: `agent-${i}`,
      type: 'worker',
      status: 'idle',
      tasks: [],
    });
  }

  return swarm;
};

global.simulateSwarmWorkflow = async (swarm: any, tasks: any[]) => {
  const results = [];
  for (const task of tasks) {
    const agent = swarm.agents.find((a: any) => a.status === 'idle');
    if (agent) {
      agent.status = 'working';
      agent.tasks.push(task);

      // Simulate work
      await new Promise((resolve) => setTimeout(resolve, 10));

      results.push({
        taskId: task.id,
        agentId: agent.id,
        result: 'completed',
        timestamp: Date.now(),
      });

      agent.status = 'idle';
      agent.tasks = agent.tasks.filter((t: any) => t.id !== task.id);
    }
  }
  return results;
};

// Protocol testing helpers
global.createMockMCPClient = () => {
  return {
    send: jest.fn().mockResolvedValue({ success: true }),
    connect: jest.fn().mockResolvedValue(true),
    disconnect: jest.fn().mockResolvedValue(true),
    listTools: jest.fn().mockResolvedValue([]),
    callTool: jest.fn().mockResolvedValue({ result: 'mock' }),
  };
};

global.validateMCPProtocol = (message: any) => {
  expect(message).toHaveProperty('jsonrpc', '2.0');
  expect(message).toHaveProperty('id');
  expect(message).toHaveProperty('method');
  if (message.method !== 'notification') {
    expect(message).toHaveProperty('params');
  }
};

// Extended timeout for integration tests
jest.setTimeout(120000);

declare global {
  var testConfig: {
    database: any;
    redis: any;
    ports: any;
  };
  var testDatabases: {
    main: any;
    vector: any;
    cache: any;
  };
  var testFixtures: {
    [key: string]: any;
  };
  var mockFetch: jest.Mock;
  var originalFetch: any;
  var mockWebSocket: jest.Mock;
  var originalWebSocket: any;
  var mockSpawn: jest.Mock;

  function createTestServer(port: number, routes?: any[]): Promise<any>;
  function createTestClient(baseURL: string): any;
  function waitForPort(port: number, timeout?: number): Promise<boolean>;
  function setupDatabaseFixtures(fixtures: any): Promise<void>;
  function createMockSwarm(agentCount?: number): any;
  function simulateSwarmWorkflow(swarm: any, tasks: any[]): Promise<any[]>;
  function createMockMCPClient(): any;
  function validateMCPProtocol(message: any): void;
}
