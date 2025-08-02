/**
 * End-to-End Test Setup
 * @fileoverview Setup configuration for E2E testing
 * Focus: Full system workflows, user scenarios, performance validation
 */

import 'jest-extended';
import { type ChildProcess, spawn } from 'child_process';
import * as path from 'path';

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
  process.env.CLAUDE_ZEN_E2E_MODE = 'true';
  process.env.CLAUDE_ZEN_LOG_LEVEL = 'warn';
  process.env.CLAUDE_ZEN_TEST_TIMEOUT = '300000';

  // E2E specific configuration
  global.e2eConfig = {
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

  global.testProcesses = new Map<string, ChildProcess>();
  global.testMetrics = {
    startTime: Date.now(),
    operations: [],
    performance: {},
  };
}

async function startTestServices() {
  const { services } = global.e2eConfig;

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
  await startService('swarm', ['npx', 'tsx', 'src/coordination/mcp/mcp-server.ts']);

  // Wait for all services to be ready
  await waitForServicesReady();
}

async function buildProject() {
  return new Promise<void>((resolve, reject) => {
    const buildProcess = spawn('npm', ['run', 'build'], {
      cwd: global.e2eConfig.paths.root,
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
    const process = spawn(cmd, args, {
      cwd: global.e2eConfig.paths.root,
      stdio: 'pipe',
      env: { ...process.env, ...getServiceEnv(name) },
    });

    global.testProcesses.set(name, process);

    let output = '';
    process.stdout?.on('data', (data) => {
      output += data.toString();
      if (isServiceReady(name, output)) {
        resolve();
      }
    });

    process.stderr?.on('data', (data) => {
      console.warn(`${name} stderr:`, data.toString());
    });

    process.on('error', reject);
    process.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`${name} exited with code ${code}`));
      }
    });

    // Timeout for service startup
    setTimeout(() => {
      if (!isServiceReady(name, output)) {
        reject(new Error(`${name} startup timeout`));
      }
    }, global.e2eConfig.timeout.startup);
  });
}

function getServiceEnv(serviceName: string) {
  const service = global.e2eConfig.services[serviceName];
  return {
    PORT: service.port.toString(),
    CLAUDE_ZEN_SERVICE: serviceName,
    CLAUDE_ZEN_E2E_MODE: 'true',
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
  const { services } = global.e2eConfig;

  for (const [name, config] of Object.entries(services)) {
    await waitForPort(config.port, global.e2eConfig.timeout.startup);
  }
}

async function waitForPort(port: number, timeout: number = 30000) {
  const net = await import('net');
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
  global.e2eTestData = {
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
    `http://localhost:${global.e2eConfig.services.api.port}/cache/clear`,
    `http://localhost:${global.e2eConfig.services.web.port}/api/cache/clear`,
  ];

  for (const endpoint of cacheEndpoints) {
    try {
      await fetch(endpoint, { method: 'POST' });
    } catch (error) {
      // Ignore cache clear failures
    }
  }
}

async function resetDatabaseState() {
  // Reset test databases to clean state
  const dbEndpoints = [`http://localhost:${global.e2eConfig.services.api.port}/test/reset`];

  for (const endpoint of dbEndpoints) {
    try {
      await fetch(endpoint, { method: 'POST' });
    } catch (error) {
      // Ignore database reset failures
    }
  }
}

async function clearMemoryState() {
  // Clear in-memory state in services
  const memoryEndpoints = [
    `http://localhost:${global.e2eConfig.services.web.port}/api/memory/clear`,
    `http://localhost:${global.e2eConfig.services.swarm.port}/memory/clear`,
  ];

  for (const endpoint of memoryEndpoints) {
    try {
      await fetch(endpoint, { method: 'POST' });
    } catch (error) {
      // Ignore memory clear failures
    }
  }
}

async function collectTestMetrics() {
  const endTime = Date.now();
  const testDuration = endTime - global.testMetrics.startTime;

  global.testMetrics.operations.push({
    timestamp: endTime,
    duration: testDuration,
    memory: process.memoryUsage(),
  });
}

async function stopTestServices() {
  // Stop all test processes
  for (const [name, process] of global.testProcesses.entries()) {
    try {
      process.kill('SIGTERM');
      await waitForProcessExit(process, 10000);
    } catch (error) {
      console.warn(`Failed to stop ${name} gracefully, force killing`);
      process.kill('SIGKILL');
    }
  }

  global.testProcesses.clear();
}

async function waitForProcessExit(process: ChildProcess, timeout: number) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Process exit timeout'));
    }, timeout);

    process.on('exit', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

async function cleanupE2EState() {
  // Final cleanup
  delete process.env.CLAUDE_ZEN_E2E_MODE;
  delete process.env.CLAUDE_ZEN_TEST_TIMEOUT;

  // Generate E2E test report
  await generateE2EReport();
}

async function generateE2EReport() {
  const report = {
    duration: Date.now() - global.testMetrics.startTime,
    operations: global.testMetrics.operations,
    services: Object.keys(global.e2eConfig.services),
    summary: {
      totalOperations: global.testMetrics.operations.length,
      avgDuration:
        global.testMetrics.operations.reduce((sum, op) => sum + op.duration, 0) /
          global.testMetrics.operations.length || 0,
    },
  };

  console.log('E2E Test Report:', JSON.stringify(report, null, 2));
}

// E2E test helpers
global.createE2EClient = (serviceName: string) => {
  const service = global.e2eConfig.services[serviceName];
  const baseURL = `http://localhost:${service.port}`;

  return {
    get: (path: string) => fetch(`${baseURL}${path}`),
    post: (path: string, data?: any) =>
      fetch(`${baseURL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined,
      }),
    put: (path: string, data?: any) =>
      fetch(`${baseURL}${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined,
      }),
    delete: (path: string) => fetch(`${baseURL}${path}`, { method: 'DELETE' }),
  };
};

global.runE2EWorkflow = async (workflow: any[]) => {
  const results = [];
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
        error: error.message,
        duration: Date.now() - start,
      });
      throw error; // Stop workflow on error
    }
  }
  return results;
};

async function executeWorkflowStep(step: any) {
  switch (step.type) {
    case 'http': {
      const client = global.createE2EClient(step.service);
      return await client[step.method](step.path, step.data);
    }
    case 'delay':
      await new Promise((resolve) => setTimeout(resolve, step.duration));
      return { delayed: step.duration };
    case 'custom':
      return await step.execute();
    default:
      throw new Error(`Unknown workflow step type: ${step.type}`);
  }
}

global.measureE2EPerformance = async (operation: () => Promise<any>, expectedMaxTime: number) => {
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
jest.setTimeout(300000); // 5 minutes

declare global {
  var e2eConfig: {
    services: {
      [key: string]: { port: number; process: any };
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
  };
  var testProcesses: Map<string, ChildProcess>;
  var testMetrics: {
    startTime: number;
    operations: any[];
    performance: any;
  };
  var e2eTestData: {
    users: any[];
    swarms: any[];
    tasks: any[];
  };

  function createE2EClient(serviceName: string): any;
  function runE2EWorkflow(workflow: any[]): Promise<any[]>;
  function measureE2EPerformance(
    operation: () => Promise<any>,
    expectedMaxTime: number
  ): Promise<any>;
}
