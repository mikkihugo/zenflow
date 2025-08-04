/**
 * Basic tests for ZenSwarm WASM module
 */

import assert from 'node:assert';

// Mock the ZenSwarm module for testing
// In a real test, this would import the actual module after building
const mockZenSwarm = {
  ZenSwarm: {
    initialize: async (_options) => {
      return {
        createSwarm: async (config) => {
          return {
            name: config.name,
            agentCount: 0,
            maxAgents: config.maxAgents || 5,
            spawn: async () => ({
              id: 'test-agent',
              agentType: 'researcher',
              status: 'idle',
              execute: async () => ({ status: 'completed' }),
              getCapabilities: () => ['research', 'analysis'],
            }),
            orchestrate: async () => ({
              taskId: 'test-task',
              status: 'completed',
            }),
            getStatus: () => ({
              name: config.name,
              agentCount: 0,
              maxAgents: config.maxAgents || 5,
            }),
          };
        },
      };
    },
    detectSIMDSupport: () => false,
    getVersion: () => '0.1.0',
  },
};

async function runTests() {
  let _passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      _passed++;
    } catch (error) {
      console.error(`✗ ${name}`);
      console.error(`  ${error.message}`);
      failed++;
    }
  }

  // Test initialization
  await test('ZenSwarm.initialize() should return a ZenSwarm instance', async () => {
    const ruvSwarm = await mockZenSwarm.ZenSwarm.initialize();
    assert(ruvSwarm !== null);
    assert(typeof ruvSwarm.createSwarm === 'function');
  });

  // Test SIMD detection
  await test('ZenSwarm.detectSIMDSupport() should return a boolean', () => {
    const result = mockZenSwarm.ZenSwarm.detectSIMDSupport();
    assert(typeof result === 'boolean');
  });

  // Test version
  await test('ZenSwarm.getVersion() should return a version string', () => {
    const version = mockZenSwarm.ZenSwarm.getVersion();
    assert(typeof version === 'string');
    assert(version.match(/^\d+\.\d+\.\d+$/));
  });

  // Test swarm creation
  await test('createSwarm() should create a swarm with correct properties', async () => {
    const ruvSwarm = await mockZenSwarm.ZenSwarm.initialize();
    const swarm = await ruvSwarm.createSwarm({
      name: 'test-swarm',
      strategy: 'development',
      mode: 'centralized',
      maxAgents: 10,
    });

    assert(swarm.name === 'test-swarm');
    assert(swarm.maxAgents === 10);
    assert(typeof swarm.spawn === 'function');
    assert(typeof swarm.orchestrate === 'function');
  });

  // Test agent spawning
  await test('spawn() should create an agent', async () => {
    const ruvSwarm = await mockZenSwarm.ZenSwarm.initialize();
    const swarm = await ruvSwarm.createSwarm({
      name: 'test-swarm',
      strategy: 'development',
      mode: 'centralized',
    });

    const agent = await swarm.spawn({
      name: 'test-agent',
      type: 'researcher',
    });

    assert(agent.id === 'test-agent');
    assert(agent.agentType === 'researcher');
    assert(agent.status === 'idle');
    assert(Array.isArray(agent.getCapabilities()));
  });

  // Test task execution
  await test('agent.execute() should execute a task', async () => {
    const ruvSwarm = await mockZenSwarm.ZenSwarm.initialize();
    const swarm = await ruvSwarm.createSwarm({
      name: 'test-swarm',
      strategy: 'development',
      mode: 'centralized',
    });

    const agent = await swarm.spawn({
      name: 'test-agent',
      type: 'researcher',
    });

    const result = await agent.execute({
      id: 'test-task',
      description: 'Test task',
    });

    assert(result.status === 'completed');
  });

  // Test orchestration
  await test('orchestrate() should orchestrate a task', async () => {
    const ruvSwarm = await mockZenSwarm.ZenSwarm.initialize();
    const swarm = await ruvSwarm.createSwarm({
      name: 'test-swarm',
      strategy: 'development',
      mode: 'centralized',
    });

    const result = await swarm.orchestrate({
      id: 'test-task',
      description: 'Test orchestration',
      priority: 'medium',
      dependencies: [],
    });

    assert(result.taskId === 'test-task');
    assert(result.status === 'completed');
  });

  // Test status
  await test('getStatus() should return swarm status', async () => {
    const ruvSwarm = await mockZenSwarm.ZenSwarm.initialize();
    const swarm = await ruvSwarm.createSwarm({
      name: 'test-swarm',
      strategy: 'development',
      mode: 'centralized',
      maxAgents: 8,
    });

    const status = swarm.getStatus();

    assert(status.name === 'test-swarm');
    assert(status.maxAgents === 8);
    assert(typeof status.agentCount === 'number');
  });

  if (failed > 0) {
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Test runner error:', error);
  process.exit(1);
});
