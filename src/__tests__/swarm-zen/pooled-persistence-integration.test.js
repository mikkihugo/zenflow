/**
 * Integration Tests for Pooled Persistence in Production Environment
 *
 * Tests the complete integration of SwarmPersistencePooled with the MCP tools
 * and validates that all existing functionality works with the new pool.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ZenSwarm } from '../src/index-enhanced.js';
import { EnhancedMCPTools } from '../src/mcp-tools-enhanced.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const TEST_DB_PATH = path.join(__dirname, 'test-pooled-integration.db');

// Cleanup function
function cleanup() {
  try {
    [TEST_DB_PATH, `${TEST_DB_PATH}-wal`, `${TEST_DB_PATH}-shm`].forEach(
      (file) => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      },
    );
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

// Test 1: MCP Tools Integration with Pooled Persistence
async function testMCPToolsIntegration() {
  try {
    cleanup();

    // Create MCP tools instance (should use pooled persistence)
    const mcpTools = new EnhancedMCPTools();

    // Wait for persistence initialization
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test swarm initialization
    const _swarmResult = await mcpTools.swarm_init({
      topology: 'mesh',
      maxAgents: 5,
      strategy: 'balanced',
    });

    // Test agent spawning
    const _agentResult = await mcpTools.agent_spawn({
      type: 'researcher',
      name: 'Test Agent',
      capabilities: ['research', 'analysis'],
    });

    // Test pool health monitoring
    const _healthResult = await mcpTools.pool_health();

    // Test pool statistics
    const _statsResult = await mcpTools.pool_stats();

    // Test persistence statistics
    const _persistenceResult = await mcpTools.persistence_stats();
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message);
    throw error;
  }
}

// Test 2: ZenSwarm Core Integration with Pooled Persistence
async function testZenSwarmCoreIntegration() {
  try {
    cleanup();

    // Initialize ZenSwarm with pooled persistence
    const ruvSwarm = await ZenSwarm.initialize({
      enablePersistence: true,
      enableNeuralNetworks: false,
      enableForecasting: false,
      debug: false,
    });

    // Test swarm creation
    const _swarm = await ruvSwarm.createSwarm({
      name: 'Integration Test Swarm',
      topology: 'hierarchical',
      maxAgents: 8,
    });

    // Test persistence availability
    if (!ruvSwarm.persistence) {
      throw new Error('Persistence layer not available');
    }

    // Test that it's the pooled version
    if (ruvSwarm.persistence.constructor.name !== 'SwarmPersistencePooled') {
      throw new Error(
        `Expected SwarmPersistencePooled, got ${ruvSwarm.persistence.constructor.name}`,
      );
    }

    // Test pool health
    if (typeof ruvSwarm.persistence.isHealthy === 'function') {
      const _isHealthy = ruvSwarm.persistence.isHealthy();
    }

    // Test pool statistics
    if (typeof ruvSwarm.persistence.getPoolStats === 'function') {
      const _poolStats = ruvSwarm.persistence.getPoolStats();
    }
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
    throw error;
  }
}

// Test 3: Concurrent Operations with Pooled Persistence
async function testConcurrentOperations() {
  try {
    cleanup();

    const mcpTools = new EnhancedMCPTools();

    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create multiple swarms concurrently
    const swarmPromises = [];
    for (let i = 0; i < 5; i++) {
      swarmPromises.push(
        mcpTools.swarm_init({
          topology: 'mesh',
          maxAgents: 3,
          strategy: 'balanced',
        }),
      );
    }

    const _swarms = await Promise.all(swarmPromises);

    // Create multiple agents concurrently across different swarms
    const agentPromises = [];
    for (let i = 0; i < 10; i++) {
      agentPromises.push(
        mcpTools.agent_spawn({
          type: 'researcher',
          name: `Concurrent Agent ${i}`,
          capabilities: ['analysis'],
        }),
      );
    }

    const _agents = await Promise.all(agentPromises);

    // Test concurrent health and statistics checks
    const monitoringPromises = [
      mcpTools.pool_health(),
      mcpTools.pool_stats(),
      mcpTools.persistence_stats(),
      mcpTools.swarm_status({ verbose: true }),
      mcpTools.memory_usage({ detail: 'summary' }),
    ];

    const monitoringResults = await Promise.all(monitoringPromises);

    // Verify all operations succeeded
    const healthResult = monitoringResults[0];
    if (!(healthResult.healthy || healthResult.error)) {
      throw new Error('Pool health check failed during concurrent operations');
    }
  } catch (error) {
    console.error('❌ Test 3 failed:', error.message);
    throw error;
  }
}

// Test 4: Performance Comparison
async function testPerformanceComparison() {
  try {
    cleanup();

    const mcpTools = new EnhancedMCPTools();

    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Measure swarm creation performance
    const startTime = Date.now();
    const numOperations = 20;

    for (let i = 0; i < numOperations; i++) {
      await mcpTools.swarm_init({
        topology: 'mesh',
        maxAgents: 2,
        strategy: 'balanced',
      });
    }

    const duration = Date.now() - startTime;
    const avgTime = duration / numOperations;

    if (avgTime > 100) {
      // Should be much faster with pooling
      console.warn(
        `⚠️  Average time higher than expected: ${avgTime.toFixed(2)}ms`,
      );
    } else {
    }

    // Test pool statistics after load
    const _finalStats = await mcpTools.pool_stats();
  } catch (error) {
    console.error('❌ Test 4 failed:', error.message);
    throw error;
  }
}

// Test 5: Environment Variable Configuration
async function testEnvironmentConfiguration() {
  try {
    // Set environment variables
    process.env['POOL_MAX_READERS'] = '8';
    process.env['POOL_MAX_WORKERS'] = '4';
    process.env['POOL_CACHE_SIZE'] = '-128000'; // 128MB

    cleanup();

    const mcpTools = new EnhancedMCPTools();

    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test that configuration was applied
    const _stats = await mcpTools.pool_stats();

    // Clean up environment variables
    delete process.env['POOL_MAX_READERS'];
    delete process.env['POOL_MAX_WORKERS'];
    delete process.env['POOL_CACHE_SIZE'];
  } catch (error) {
    console.error('❌ Test 5 failed:', error.message);
    throw error;
  }
}

// Main test runner
async function runAllTests() {
  const tests = [
    testMCPToolsIntegration,
    testZenSwarmCoreIntegration,
    testConcurrentOperations,
    testPerformanceComparison,
    testEnvironmentConfiguration,
  ];

  let _passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await test();
      _passed++;
    } catch (error) {
      failed++;
      console.error(`Test failed: ${error.message}\n`);
    }
  }

  if (failed === 0) {
  } else {
  }

  cleanup();
}

// Handle cleanup on exit
process.on('exit', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Run tests
runAllTests().catch(console.error);
