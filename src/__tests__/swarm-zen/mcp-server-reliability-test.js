#!/usr/bin/env node

/**
 * Enhanced MCP Server Reliability Test
 * Comprehensive testing for MCP server startup and operation
 */

import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const results = {
  testSuite: 'mcp-server-reliability',
  version: '1.0.13',
  timestamp: new Date().toISOString(),
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
  },
};

let mcpProcess = null;

// Test utilities
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function addTestResult(name, status, message, error = null, duration = null) {
  const result = { name, status, message };
  if (error) {
    result.error = error;
  }
  if (duration !== null) {
    result.duration = duration;
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

// Enhanced server startup test with detailed diagnostics
async function testServerStartup() {
  const startTime = Date.now();
  let serverReady = false;
  const initializationLogs = [];

  return new Promise((resolve, reject) => {
    mcpProcess = spawn('node', ['bin/ruv-swarm-clean.js', 'mcp', 'start'], {
      env: { ...process.env, MCP_TEST_MODE: 'true', LOG_LEVEL: 'DEBUG' },
      cwd: path.join(__dirname, '..'),
    });

    mcpProcess.stdout.on('data', (data) => {
      const output = data.toString();
      initializationLogs.push({
        type: 'stdout',
        data: output.trim(),
        timestamp: Date.now(),
      });
    });

    mcpProcess.stderr.on('data', (data) => {
      const output = data.toString();
      initializationLogs.push({
        type: 'stderr',
        data: output.trim(),
        timestamp: Date.now(),
      });

      // Enhanced readiness detection
      if (
        output.includes('MCP server ready') ||
        output.includes('Listening on') ||
        output.includes('stdin/stdout') ||
        output.includes('stdio mode')
      ) {
        const duration = Date.now() - startTime;
        serverReady = true;
        addTestResult(
          'MCP Server Startup',
          'passed',
          'Server started successfully',
          null,
          duration,
        );
        resolve({ serverReady: true, logs: initializationLogs });
      }
    });

    mcpProcess.on('error', (error) => {
      const duration = Date.now() - startTime;
      addTestResult(
        'MCP Server Startup',
        'failed',
        'Failed to start server process',
        error.message,
        duration,
      );
      reject({ error, logs: initializationLogs });
    });

    mcpProcess.on('exit', (code, signal) => {
      if (!serverReady) {
        const duration = Date.now() - startTime;
        addTestResult(
          'MCP Server Startup',
          'failed',
          `Server exited unexpectedly (code: ${code}, signal: ${signal})`,
          null,
          duration,
        );
        reject({
          error: `Process exited with code ${code}`,
          logs: initializationLogs,
        });
      }
    });

    // Increased timeout with progress monitoring
    setTimeout(() => {
      if (!serverReady) {
        const duration = Date.now() - startTime;
        initializationLogs.forEach((_log, _index) => {});
        addTestResult(
          'MCP Server Startup',
          'failed',
          'Server startup timeout (30s)',
          null,
          duration,
        );
        reject({ error: 'Server startup timeout', logs: initializationLogs });
      }
    }, 30000); // 30 second timeout
  });
}

// Test stdio communication protocol
async function testStdioCommunication() {
  if (!mcpProcess || mcpProcess.killed) {
    addTestResult('Stdio Communication', 'failed', 'Server not running');
    return;
  }

  return new Promise((resolve) => {
    const testRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'ruv-swarm/swarm_status',
      params: {},
    };

    let responseReceived = false;
    const startTime = Date.now();

    mcpProcess.stdout.once('data', (data) => {
      const duration = Date.now() - startTime;
      try {
        const response = JSON.parse(data.toString().trim());
        if (response.jsonrpc === '2.0' && response.id === 1) {
          responseReceived = true;
          addTestResult(
            'Stdio Communication',
            'passed',
            'JSON-RPC communication working',
            null,
            duration,
          );
        } else {
          addTestResult(
            'Stdio Communication',
            'failed',
            'Invalid JSON-RPC response format',
          );
        }
      } catch (error) {
        addTestResult(
          'Stdio Communication',
          'failed',
          'Invalid JSON response',
          error.message,
        );
      }
      resolve();
    });

    setTimeout(() => {
      if (!responseReceived) {
        const duration = Date.now() - startTime;
        addTestResult(
          'Stdio Communication',
          'failed',
          'Response timeout',
          null,
          duration,
        );
        resolve();
      }
    }, 10000);

    // Send test request
    try {
      mcpProcess.stdin.write(`${JSON.stringify(testRequest)}\n`);
    } catch (error) {
      addTestResult(
        'Stdio Communication',
        'failed',
        'Failed to write to stdin',
        error.message,
      );
      resolve();
    }
  });
}

// Test multiple rapid requests for stability
async function testServerStability() {
  if (!mcpProcess || mcpProcess.killed) {
    addTestResult('Server Stability', 'failed', 'Server not running');
    return;
  }

  const requests = [
    { method: 'ruv-swarm/swarm_status', params: {} },
    { method: 'ruv-swarm/memory_usage', params: { action: 'status' } },
    { method: 'ruv-swarm/features_detect', params: {} },
    { method: 'ruv-swarm/neural_status', params: {} },
    { method: 'ruv-swarm/benchmark_run', params: { type: 'quick' } },
  ];

  let responsesReceived = 0;
  const expectedResponses = requests.length;
  const startTime = Date.now();

  return new Promise((resolve) => {
    const responseHandler = (data) => {
      try {
        const lines = data
          .toString()
          .split('\n')
          .filter((line) => line.trim());
        for (const line of lines) {
          const response = JSON.parse(line);
          if (response.jsonrpc === '2.0' && response.id !== undefined) {
            responsesReceived++;
            if (responsesReceived === expectedResponses) {
              const duration = Date.now() - startTime;
              addTestResult(
                'Server Stability',
                'passed',
                `All ${expectedResponses} requests handled successfully`,
                null,
                duration,
              );
              mcpProcess.stdout.removeListener('data', responseHandler);
              resolve();
            }
          }
        }
      } catch (error) {
        addTestResult(
          'Server Stability',
          'failed',
          'Invalid JSON in stability test',
          error.message,
        );
        mcpProcess.stdout.removeListener('data', responseHandler);
        resolve();
      }
    };

    mcpProcess.stdout.on('data', responseHandler);

    // Send all requests rapidly
    requests.forEach((req, index) => {
      const request = {
        jsonrpc: '2.0',
        id: index + 10,
        method: req.method,
        params: req.params,
      };

      mcpProcess.stdin.write(`${JSON.stringify(request)}\n`);
    });

    setTimeout(() => {
      if (responsesReceived < expectedResponses) {
        const duration = Date.now() - startTime;
        addTestResult(
          'Server Stability',
          'failed',
          `Only ${responsesReceived}/${expectedResponses} responses received`,
          null,
          duration,
        );
        mcpProcess.stdout.removeListener('data', responseHandler);
        resolve();
      }
    }, 15000);
  });
}

// Test graceful shutdown
async function testGracefulShutdown() {
  if (!mcpProcess || mcpProcess.killed) {
    addTestResult('Graceful Shutdown', 'failed', 'Server not running');
    return;
  }

  return new Promise((resolve) => {
    const startTime = Date.now();
    let shutdownCompleted = false;

    mcpProcess.on('exit', (code, signal) => {
      const duration = Date.now() - startTime;
      shutdownCompleted = true;
      if (code === 0 || signal === 'SIGTERM') {
        addTestResult(
          'Graceful Shutdown',
          'passed',
          'Server shutdown gracefully',
          null,
          duration,
        );
      } else {
        addTestResult(
          'Graceful Shutdown',
          'failed',
          `Unexpected exit code: ${code}, signal: ${signal}`,
          null,
          duration,
        );
      }
      resolve();
    });

    // Attempt graceful shutdown
    try {
      mcpProcess.stdin.end();

      setTimeout(() => {
        if (!shutdownCompleted) {
          mcpProcess.kill('SIGTERM');
        }
      }, 5000);

      setTimeout(() => {
        if (!shutdownCompleted) {
          const duration = Date.now() - startTime;
          addTestResult(
            'Graceful Shutdown',
            'failed',
            'Shutdown timeout',
            null,
            duration,
          );
          mcpProcess.kill('SIGKILL');
          resolve();
        }
      }, 10000);
    } catch (error) {
      addTestResult(
        'Graceful Shutdown',
        'failed',
        'Failed to initiate shutdown',
        error.message,
      );
      resolve();
    }
  });
}

// Generate comprehensive report
async function generateReport() {
  results.summary.passRate = (
    (results.summary.passed / results.summary.total) *
    100
  ).toFixed(2);

  const resultsDir = path.join(
    __dirname,
    '..',
    'docker',
    'test-results',
    'mcp-reliability',
  );
  const resultsPath = path.join(resultsDir, 'mcp-server-reliability.json');

  await fs.mkdir(resultsDir, { recursive: true });
  await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));

  // Determine overall status
  if (results.summary.failed === 0) {
  } else {
  }
}

// Cleanup function
async function cleanup() {
  if (mcpProcess && !mcpProcess.killed) {
    mcpProcess.kill('SIGKILL');
  }
}

// Run all tests
async function runReliabilityTests() {
  try {
    await testServerStartup();
    await sleep(1000); // Let server stabilize
    await testStdioCommunication();
    await sleep(500);
    await testServerStability();
    await sleep(500);
    await testGracefulShutdown();
  } catch (error) {
    console.error('Test execution error:', error);
    if (error.logs) {
      error.logs.forEach((_log, _index) => {});
    }
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

runReliabilityTests();
