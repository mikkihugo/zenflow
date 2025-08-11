#!/usr/bin/env node

/**
 * MCP Server Validation Test for ruv-swarm v1.0.6
 * Tests Model Context Protocol server functionality
 */

import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import WebSocket from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const results = {
  testSuite: 'mcp-server-validation',
  version: '1.0.6',
  timestamp: new Date().toISOString(),
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
  },
};

let mcpProcess = null;
let ws = null;

// Test utilities
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function addTestResult(name, status, message, error = null) {
  const result = { name, status, message };
  if (error) {
    result.error = error;
  }
  results.tests.push(result);
  results.summary.total++;
  if (status === 'passed') {
    results.summary.passed++;
  }
  if (status === 'failed') {
    results.summary.failed++;
  }
}

// Start MCP server
async function startMCPServer() {
  return new Promise((resolve, reject) => {
    mcpProcess = spawn('node', ['bin/ruv-swarm-clean.js', 'mcp', 'start'], {
      env: { ...process.env, MCP_TEST_MODE: 'true' },
    });

    let serverReady = false;

    mcpProcess.stdout.on('data', (data) => {
      const _output = data.toString();
    });

    mcpProcess.stderr.on('data', (data) => {
      const output = data.toString();

      if (
        output.includes('MCP server ready') ||
        output.includes('Listening on')
      ) {
        serverReady = true;
        addTestResult(
          'MCP Server Start',
          'passed',
          'Server started successfully',
        );
        resolve();
      }
    });

    mcpProcess.on('error', (error) => {
      addTestResult(
        'MCP Server Start',
        'failed',
        'Failed to start server',
        error.message,
      );
      reject(error);
    });

    // Increased timeout to 30 seconds for reliability
    setTimeout(() => {
      if (!serverReady) {
        addTestResult('MCP Server Start', 'failed', 'Server startup timeout');
        reject(new Error('Server startup timeout'));
      }
    }, 30000);
  });
}

// Test WebSocket connection
async function testWebSocketConnection() {
  return new Promise((resolve, reject) => {
    ws = new WebSocket('ws://localhost:3000');

    ws.on('open', () => {
      addTestResult(
        'WebSocket Connection',
        'passed',
        'Connected to MCP server',
      );
      resolve();
    });

    ws.on('error', (error) => {
      addTestResult(
        'WebSocket Connection',
        'failed',
        'Connection failed',
        error.message,
      );
      reject(error);
    });

    setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        addTestResult('WebSocket Connection', 'failed', 'Connection timeout');
        reject(new Error('Connection timeout'));
      }
    }, 5000);
  });
}

// Test MCP protocol methods
async function testMCPMethods() {
  const methods = [
    {
      name: 'swarm_init',
      params: { topology: 'mesh', maxAgents: 4 },
    },
    {
      name: 'agent_spawn',
      params: { type: 'researcher', name: 'Test Agent' },
    },
    {
      name: 'swarm_status',
      params: {},
    },
    {
      name: 'agent_list',
      params: {},
    },
    {
      name: 'memory_usage',
      params: { action: 'status' },
    },
    {
      name: 'neural_status',
      params: {},
    },
  ];

  for (const method of methods) {
    await testMethod(method.name, method.params);
    await sleep(100); // Small delay between tests
  }
}

async function testMethod(method, params) {
  return new Promise((resolve) => {
    const request = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: `ruv-swarm/${method}`,
      params,
    };

    const timeout = setTimeout(() => {
      addTestResult(`MCP Method: ${method}`, 'failed', 'Response timeout');
      resolve();
    }, 5000);

    ws.once('message', (data) => {
      clearTimeout(timeout);
      try {
        const response = JSON.parse(data.toString());
        if (response.error) {
          addTestResult(
            `MCP Method: ${method}`,
            'failed',
            response.error.message,
          );
        } else {
          addTestResult(
            `MCP Method: ${method}`,
            'passed',
            'Method executed successfully',
          );
        }
      } catch (error) {
        addTestResult(
          `MCP Method: ${method}`,
          'failed',
          'Invalid response',
          error.message,
        );
      }
      resolve();
    });

    ws.send(JSON.stringify(request));
  });
}

// Test task orchestration
async function testTaskOrchestration() {
  // First create a swarm
  await testMethod('swarm_init', { topology: 'hierarchical', maxAgents: 8 });
  await sleep(500);

  // Spawn some agents
  for (let i = 0; i < 4; i++) {
    await testMethod('agent_spawn', { type: 'researcher', name: `Agent-${i}` });
    await sleep(100);
  }

  // Orchestrate a task
  await testMethod('task_orchestrate', {
    task: 'Test orchestration task',
    strategy: 'adaptive',
  });

  // Check task status
  await testMethod('task_status', {});
}

// Test memory persistence
async function testMemoryPersistence() {
  const testData = {
    key: 'test-memory-key',
    value: {
      data: 'test-value',
      timestamp: Date.now(),
      array: [1, 2, 3, 4, 5],
    },
  };

  // Store memory
  await testMethod('memory_usage', {
    action: 'store',
    key: testData.key,
    value: testData.value,
  });

  // Retrieve memory
  await testMethod('memory_usage', {
    action: 'retrieve',
    key: testData.key,
  });

  // List memory
  await testMethod('memory_usage', {
    action: 'list',
  });
}

// Test neural operations
async function testNeuralOperations() {
  await testMethod('neural_status', {});
  await testMethod('neural_train', { epochs: 10 });
  await testMethod('neural_patterns', {});
}

// Test performance monitoring
async function testPerformanceMonitoring() {
  await testMethod('benchmark_run', { type: 'quick' });
  await testMethod('swarm_monitor', { duration: 2000 });
}

// Cleanup
async function cleanup() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close();
  }

  if (mcpProcess) {
    mcpProcess.kill();
  }
}

// Generate report
async function generateReport() {
  results.summary.passRate = (
    (results.summary.passed / results.summary.total) *
    100
  ).toFixed(2);

  const resultsPath = path.join(
    __dirname,
    '..',
    'test-results',
    'mcp-validation.json',
  );
  await fs.mkdir(path.dirname(resultsPath), { recursive: true });
  await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));
}

// Run all tests
async function runTests() {
  try {
    await startMCPServer();
    await sleep(2000); // Let server fully initialize
    await testWebSocketConnection();
    await testMCPMethods();
    await testTaskOrchestration();
    await testMemoryPersistence();
    await testNeuralOperations();
    await testPerformanceMonitoring();
  } catch (error) {
    console.error('Test failed:', error);
    addTestResult(
      'Test Suite',
      'failed',
      'Suite execution failed',
      error.message,
    );
  } finally {
    await cleanup();
    await generateReport();
    process.exit(results.summary.failed > 0 ? 1 : 0);
  }
}

// Handle interrupts
process.on('SIGINT', async () => {
  await cleanup();
  process.exit(1);
});

runTests();
