#!/usr/bin/env node

/**
 * Docker Performance Test Suite for ruv-swarm v1.0.6
 * Comprehensive performance benchmarks across all features
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { NeuralAgent, ZenSwarm } from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const results = {
  testSuite: 'performance-benchmarks',
  version: '1.0.6',
  timestamp: new Date().toISOString(),
  environment: {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    cpus: require('node:os').cpus().length,
    memory: require('node:os').totalmem(),
  },
  benchmarks: [],
  summary: {},
};

// Benchmark utilities
function benchmark(name, fn, iterations = 1000) {
  return new Promise(async (resolve) => {
    const timings = [];

    // Warmup
    for (let i = 0; i < 10; i++) {
      await fn();
    }

    // Actual benchmark
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      timings.push(end - start);

      if (i % 100 === 0) {
        process.stdout.write('.');
      }
    }

    // Calculate statistics
    timings.sort((a, b) => a - b);
    const stats = {
      name,
      iterations,
      min: timings[0],
      max: timings[timings.length - 1],
      mean: timings.reduce((a, b) => a + b) / timings.length,
      median: timings[Math.floor(timings.length / 2)],
      p95: timings[Math.floor(timings.length * 0.95)],
      p99: timings[Math.floor(timings.length * 0.99)],
    };

    results.benchmarks.push(stats);
    resolve(stats);
  });
}

// Benchmark tests
async function benchmarkSwarmCreation() {
  await benchmark('Swarm Creation (Small)', () => {
    const swarm = new ZenSwarm({ maxAgents: 4 });
    return swarm;
  });

  await benchmark('Swarm Creation (Medium)', () => {
    const swarm = new ZenSwarm({ maxAgents: 16 });
    return swarm;
  });

  await benchmark(
    'Swarm Creation (Large)',
    () => {
      const swarm = new ZenSwarm({ maxAgents: 64 });
      return swarm;
    },
    100
  );
}

async function benchmarkAgentOperations() {
  const swarm = new ZenSwarm({ maxAgents: 32 });

  await benchmark('Agent Spawn', () => {
    swarm.spawnAgent(`agent-${Date.now()}`, 'researcher');
  });

  await benchmark('Agent Communication', async () => {
    const agent1 = swarm.agents[0];
    const agent2 = swarm.agents[1];
    if (agent1 && agent2) {
      await agent1.sendMessage(agent2.id, { type: 'test', data: 'benchmark' });
    }
  });

  await benchmark('Agent Task Assignment', async () => {
    const agent = swarm.agents[0];
    if (agent) {
      await agent.assignTask({ type: 'analyze', data: 'benchmark-data' });
    }
  });
}

async function benchmarkNeuralOperations() {
  const agent = new NeuralAgent('neural-bench', 'researcher');
  await agent.initialize();

  await benchmark('Neural Forward Pass', async () => {
    const input = new Float32Array(128).fill(0.5);
    await agent.neuralNetwork.forward(input);
  });

  await benchmark(
    'Neural Training Step',
    async () => {
      const input = new Float32Array(128).fill(0.5);
      const target = new Float32Array(64).fill(0.8);
      await agent.neuralNetwork.train(input, target);
    },
    100
  );

  await benchmark('Pattern Recognition', async () => {
    const pattern = { type: 'test', features: new Array(32).fill(0.5) };
    await agent.recognizePattern(pattern);
  });
}

async function benchmarkMemoryOperations() {
  const swarm = new ZenSwarm({ maxAgents: 8 });

  await benchmark('Memory Store', () => {
    const key = `key-${Date.now()}`;
    const value = { data: 'test', timestamp: Date.now(), array: new Array(100).fill(0) };
    swarm.memory.store(key, value);
  });

  await benchmark('Memory Retrieve', () => {
    const key = Object.keys(swarm.memory.data)[0];
    return swarm.memory.retrieve(key);
  });

  await benchmark('Memory Pattern Match', () => {
    return swarm.memory.search('test');
  });
}

async function benchmarkTaskOrchestration() {
  const swarm = new ZenSwarm({
    topology: 'hierarchical',
    maxAgents: 16,
  });

  // Spawn agents
  for (let i = 0; i < 8; i++) {
    swarm.spawnAgent(`worker-${i}`, 'researcher');
  }

  await benchmark(
    'Simple Task Orchestration',
    async () => {
      await swarm.orchestrateTask({
        type: 'analyze',
        data: 'benchmark-task',
        priority: 'high',
      });
    },
    100
  );

  await benchmark(
    'Complex Task Orchestration',
    async () => {
      await swarm.orchestrateTask({
        type: 'multi-phase',
        phases: ['collect', 'analyze', 'synthesize'],
        data: new Array(1000).fill(0),
        priority: 'critical',
      });
    },
    10
  );
}

async function benchmarkWASMSpecific() {
  // Direct WASM function calls if available
  try {
    const wasmModule = global._wasmModule || global.__ruv_swarm_wasm;
    if (wasmModule?.benchmark_operation) {
      await benchmark('Direct WASM Call', () => {
        return wasmModule.benchmark_operation();
      });
    } else {
    }
  } catch (_error) {}
}

async function generatePerformanceReport() {
  // Calculate aggregate statistics
  const aggregateStats = {
    totalBenchmarks: results.benchmarks.length,
    avgMeanTime: results.benchmarks.reduce((sum, b) => sum + b.mean, 0) / results.benchmarks.length,
    avgP95Time: results.benchmarks.reduce((sum, b) => sum + b.p95, 0) / results.benchmarks.length,
    fastestOperation: results.benchmarks.reduce((min, b) => (b.mean < min.mean ? b : min)),
    slowestOperation: results.benchmarks.reduce((max, b) => (b.mean > max.mean ? b : max)),
  };

  results.summary = aggregateStats;

  // Performance grade
  let grade = 'A';
  if (aggregateStats.avgMeanTime > 10) {
    grade = 'B';
  }
  if (aggregateStats.avgMeanTime > 50) {
    grade = 'C';
  }
  if (aggregateStats.avgMeanTime > 100) {
    grade = 'D';
  }
  if (aggregateStats.avgMeanTime > 500) {
    grade = 'F';
  }

  results.summary.performanceGrade = grade;

  // Save results
  const resultsPath = path.join(__dirname, '..', 'test-results', 'performance-benchmarks.json');
  await fs.mkdir(path.dirname(resultsPath), { recursive: true });
  await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));
}

// Run all benchmarks
async function runBenchmarks() {
  try {
    await benchmarkSwarmCreation();
    await benchmarkAgentOperations();
    await benchmarkNeuralOperations();
    await benchmarkMemoryOperations();
    await benchmarkTaskOrchestration();
    await benchmarkWASMSpecific();
    await generatePerformanceReport();
  } catch (error) {
    console.error('Benchmark suite failed:', error);
    process.exit(1);
  }
}

runBenchmarks();
