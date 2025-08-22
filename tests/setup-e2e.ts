/**
 * End-to-End Test Setup
 *
 * @file Setup configuration for E2E testing
 * Focus: Full system workflows, user scenarios, performance validation
 */

// Import Vitest globals and utilities
import { expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { type ChildProcess, spawn } from 'node:child_process';
import * as path from 'node:path';
import './global-types';

// E2E test setup with real system components
beforeAll(async () => {
  // Setup E2E test environment
  await setupE2EEnvironment();

  // Start test services
  await startTestServices();

  // Initialize test data
  await initializeE2EData();
}, 180000); // Extended timeout for service startup

afterAll(async () => {
  // Cleanup E2E test state
  await cleanupE2EState();

  // Stop test services
  await stopTestServices();
}, 60000);

beforeEach(async () => {
  // Reset system state for each test
  await resetSystemState();
});

afterEach(async () => {
  // Collect test metrics
  await collectTestMetrics();
});

async function setupE2EEnvironment() {
  // Set E2E environment variables
  process.env.NODE_ENV = 'test';
  process.env.ZEN_E2E_MODE = 'true';
  process.env.ZEN_LOG_LEVEL = 'warn';
  process.env.ZEN_TEST_TIMEOUT = '300000';

  // E2E specific configuration
  globalThis.e2eConfig = {
    services: {
      mcp: { port: 40001, process: null },
      web: { port: 40002, process: null },
      api: { port: 40003, process: null },
      swarm: { port: 40004, process: null },
    },
    timeout: {
      startup: 60000,
      operation: 30000,
      shutdown: 30000,
    },
    paths: {
      root: process.cwd(),
      bin: path.join(process.cwd(), 'bin'),
      dist: path.join(process.cwd(), 'dist'),
    },
  };

  globalThis.testProcesses = new Map<string, ChildProcess>();
  globalThis.testMetrics = {
    startTime: Date.now(),
    operations: [],
    performance: {},
  };
}

async function startTestServices() {
  const { services } = globalThis.e2eConfig;

  // Build the project first
  await buildProject();

  // Start MCP server
  await startService('mcp', [
    'npx',
    'tsx',
    'src/interfaces/mcp/start-server.ts',
    '--port',
    services.mcp.port.toString(),
  ]);

  // Start Web server
  await startService('web', [
    'npx',
    'tsx',
    'src/interfaces/web/web-interface.ts',
    '--port',
    services.web.port.toString(),
    '--daemon',
  ]);

  // Start Swarm coordination server
  await startService('swarm', [
    'npx',
    'tsx',
    'src/coordination/mcp/mcp-server.ts',
  ]);

  // Wait for all services to be ready
  await waitForServicesReady();
}

async function buildProject() {
  return new Promise<void>((resolve, reject) => {
    const buildProcess = spawn('npm', ['run', 'build'], {
      cwd: globalThis.e2eConfig.paths.root,
      stdio: 'pipe',
    });

    buildProcess.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Build failed with code ${code}`));
    });

    setTimeout(() => {
      buildProcess.kill();
      reject(new Error('Build timeout'));
    }, 120000);
  });
}

async function startService(name: string, command: string[]) {
  return new Promise<void>((resolve, reject) => {
    const [cmd, ...args] = command;
    const childProcess = spawn(cmd, args, {
      cwd: globalThis.e2eConfig.paths.root,
      stdio: 'pipe',
      env: { ...process.env, ...getServiceEnv(name) },
    });

    globalThis.testProcesses.set(name, childProcess);

    let output = '';
    childProcess.stdout?.on('data', (data) => {
      output += data.toString();
      if (isServiceReady(name, output)) {
        resolve();
      }
    });

    childProcess.stderr?.on('data', (data) => {
      console.warn(`${name} stderr:`, data.toString();
    });

    childProcess.on('error', reject);
    childProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`${name} exited with code ${code}`));
      }
    });

    // Timeout for service startup
    setTimeout(() => {
      if (!isServiceReady(name, output)) {
        reject(new Error(`${name} startup timeout`));
      }
    }, globalThis.e2eConfig.timeout.startup);
  });
}

function getServiceEnv(serviceName: string) {
  const service = globalThis.e2eConfig.services[serviceName as keyof typeof globalThis.e2eConfig.services];
  return {
    PORT: service.port.toString(),
    ZEN_SERVICE: serviceName,
    ZEN_E2E_MODE: 'true',
  };
}

function isServiceReady(serviceName: string, output: string): boolean {
  const readyPatterns = {
    mcp: /MCP server listening on port/i,
    web: /Web server listening on port/i,
    api: /API server ready/i,
    swarm: /Swarm coordination server ready/i,
  };

  const pattern = readyPatterns[serviceName];
  return pattern ? pattern.test(output) : false;
}

async function waitForServicesReady() {
  const { services } = globalThis.e2eConfig;

  for (const [_name, config] of Object.entries(services)) {
    await waitForPort((config as any).port, globalThis.e2eConfig.timeout.startup);
  }
}

async function waitForPort(port: number, timeout: number = 30000) {
  const net = await import('node:net');
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      await new Promise<void>((resolve, reject) => {
        const socket = net.createConnection(port, 'localhost');
        socket.on('connect', () => {
          socket.destroy();
          resolve();
        });
        socket.on('error', reject);
        setTimeout(() => reject(new Error('Connection timeout')), 2000);
      });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(`Port ${port} not ready within ${timeout}ms`);
}

async function initializeE2EData() {
  // Initialize test data for E2E scenarios
  globalThis.e2eTestData = {
    users: [
      { id: 'test-user-1', name: 'Test User', role: 'admin' },
      { id: 'test-user-2', name: 'Agent User', role: 'agent' },
    ],
    swarms: [
      { id: 'test-swarm-1', name: 'Test Swarm', agents: 3 },
      { id: 'test-swarm-2', name: 'Performance Swarm', agents: 5 },
    ],
    tasks: [
      { id: 'task-1', type: 'analysis', priority: 'high' },
      { id: 'task-2', type: 'generation', priority: 'medium' },
    ],
  };
}

async function resetSystemState() {
  // Reset system state between tests
  try {
    // Clear caches
    await clearSystemCaches();

    // Reset database state
    await resetDatabaseState();

    // Clear in-memory state
    await clearMemoryState();
  } catch (error) {
    console.warn('Failed to reset system state:', error);
  }
}

async function clearSystemCaches() {
  const cacheEndpoints = [
    `http://localhost:${globalThis.e2eConfig.services.api.port}/cache/clear`,
    `http://localhost:${globalThis.e2eConfig.services.web.port}/api/cache/clear`,
  ];

  for (const endpoint of cacheEndpoints) {
    try {
      await fetch(endpoint, { method: 'POST' });
    } catch (_error) {
      // Ignore cache clear failures
    }
  }
}

async function resetDatabaseState() {
  // Reset test databases to clean state
  const dbEndpoints = [
    `http://localhost:${globalThis.e2eConfig.services.api.port}/test/reset`,
  ];

  for (const endpoint of dbEndpoints) {
    try {
      await fetch(endpoint, { method: 'POST' });
    } catch (_error) {
      // Ignore database reset failures
    }
  }
}

async function clearMemoryState() {
  // Clear in-memory state in services
  const memoryEndpoints = [
    `http://localhost:${globalThis.e2eConfig.services.web.port}/api/memory/clear`,
    `http://localhost:${globalThis.e2eConfig.services.swarm.port}/memory/clear`,
  ];

  for (const endpoint of memoryEndpoints) {
    try {
      await fetch(endpoint, { method: 'POST' });
    } catch (_error) {
      // Ignore memory clear failures
    }
  }
}

async function collectTestMetrics() {
  const endTime = Date.now();
  const testDuration = endTime - globalThis.testMetrics.startTime;

  globalThis.testMetrics.operations.push({
    timestamp: endTime,
    duration: testDuration,
    memory: process.memoryUsage(),
  });
}

async function stopTestServices() {
  // Stop all test processes
  for (const [name, childProcess] of Array.from(globalThis.testProcesses.entries())) {
    try {
      childProcess.kill('SIGTERM');
      await waitForProcessExit(childProcess, 10000);
    } catch (_error) {
      console.warn(`Failed to stop ${name} gracefully, force killing`);
      childProcess.kill('SIGKILL');
    }
  }

  globalThis.testProcesses.clear();
}

async function waitForProcessExit(childProcess: ChildProcess, timeout: number) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Process exit timeout'));
    }, timeout);

    childProcess.on('exit', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

async function cleanupE2EState() {
  // Final cleanup
  process.env.ZEN_E2E_MODE = undefined;
  process.env.ZEN_TEST_TIMEOUT = undefined;

  // Generate E2E test report
  await generateE2EReport();
}

async function generateE2EReport() {
  const _report = {
    duration: Date.now() - globalThis.testMetrics.startTime,
    operations: globalThis.testMetrics.operations,
    services: Object.keys(globalThis.e2eConfig.services),
    summary: {
      totalOperations: globalThis.testMetrics.operations.length,
      avgDuration:
        globalThis.testMetrics.operations.reduce(
          (sum, op) => sum + op.duration,
          0
        ) / globalThis.testMetrics.operations.length||0,
    },
  };
}

/**
 * HTTP request data type for E2E test operations
 *
 * @example
 */
interface HttpRequestData {
  [key: string]: unknown;
}

/**
 * HTTP client interface for E2E service interaction
 *
 * @example
 */
interface E2EHttpClient {
  get: (path: string) => Promise<Response>;
  post: (path: string, data?: HttpRequestData) => Promise<Response>;
  put: (path: string, data?: HttpRequestData) => Promise<Response>;
  delete: (path: string) => Promise<Response>;
}

/**
 * Workflow step configuration for E2E testing
 *
 * @example
 */
interface WorkflowStep {
  name: string;
  type:'http|delay|custom';
  service?: string;
  method?: 'get|post|put|delete';
  path?: string;
  data?: HttpRequestData;
  duration?: number;
  execute?: () => Promise<unknown>;
}

/**
 * Workflow execution result
 *
 * @example
 */
interface WorkflowResult {
  step: string;
  success: boolean;
  result?: unknown;
  error?: string;
  duration: number;
}

/**
 * E2E performance measurement result
 *
 * @example
 */
interface PerformanceMeasurement {
  result: unknown;
  duration: number;
  performance: {
    withinExpected: boolean;
    efficiency: number;
  };
}

// E2E test helpers
globalThis.createE2EClient = (serviceName: string): E2EHttpClient => {
  const service = globalThis.e2eConfig.services[serviceName as keyof typeof globalThis.e2eConfig.services];
  const baseURL = `http://localhost:${service.port}`;

  return {
    get: (path: string) => fetch(`${baseURL}${path}`),
    post: (path: string, data?: HttpRequestData) =>
      fetch(`${baseURL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined,
      }),
    put: (path: string, data?: HttpRequestData) =>
      fetch(`${baseURL}${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined,
      }),
    delete: (path: string) => fetch(`${baseURL}${path}`, { method: 'DELETE' }),
  };
};

globalThis.runE2EWorkflow = async (
  workflow: WorkflowStep[]
): Promise<WorkflowResult[]> => {
  const results: WorkflowResult[] = [];
  for (const step of workflow) {
    const start = Date.now();
    try {
      const result = await executeWorkflowStep(step);
      results.push({
        step: step.name,
        success: true,
        result,
        duration: Date.now() - start,
      });
    } catch (error) {
      results.push({
        step: step.name,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - start,
      });
      throw error; // Stop workflow on error
    }
  }
  return results;
};

async function executeWorkflowStep(step: WorkflowStep): Promise<unknown> {
  switch (step.type) {
    case 'http': {
      if (!(step.service && step.method && step.path)) {
        throw new Error('HTTP step requires service, method, and path');
      }
      const client = globalThis.createE2EClient(step.service);
      return await client[step.method](step.path, step.data);
    }
    case 'delay':
      if (typeof step.duration !== 'number') {
        throw new Error('Delay step requires duration');
      }
      await new Promise((resolve) => setTimeout(resolve, step.duration));
      return { delayed: step.duration };
    case 'custom':
      if (!step.execute) {
        throw new Error('Custom step requires execute function');
      }
      return await step.execute();
    default:
      throw new Error(`Unknown workflow step type: ${step.type}`);
  }
}

globalThis.measureE2EPerformance = async (
  operation: () => Promise<unknown>,
  expectedMaxTime: number
): Promise<PerformanceMeasurement> => {
  const start = Date.now();
  const result = await operation();
  const duration = Date.now() - start;

  expect(duration).toBeLessThanOrEqual(expectedMaxTime);

  return {
    result,
    duration,
    performance: {
      withinExpected: duration <= expectedMaxTime,
      efficiency: expectedMaxTime / duration,
    },
  };
};

// Extended timeout for E2E tests
// Vitest timeout configured in vitest.config.ts - vi.setTimeout(300000); // 5 minutes

/**
 * E2E service configuration
 *
 * @example
 */
interface E2EServiceConfig {
  port: number;
  process: ChildProcess | null;
}

/**
 * E2E test configuration
 *
 * @example
 */
interface E2EConfig {
  services: {
    [key: string]: E2EServiceConfig;
  };
  timeout: {
    startup: number;
    operation: number;
    shutdown: number;
  };
  paths: {
    root: string;
    bin: string;
    dist: string;
  };
}

/**
 * E2E test metrics tracking
 *
 * @example
 */
interface E2ETestMetrics {
  startTime: number;
  operations: Array<{
    timestamp: number;
    duration: number;
    memory: NodeJS.MemoryUsage;
  }>;
  performance: Record<string, unknown>;
}

/**
 * E2E test data structure
 *
 * @example
 */
interface E2ETestData {
  users: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  swarms: Array<{
    id: string;
    name: string;
    agents: number;
  }>;
  tasks: Array<{
    id: string;
    type: string;
    priority: string;
  }>;
}

// Types are now declared in global-types.ts
