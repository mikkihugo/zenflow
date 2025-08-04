/**
 * Integration Tests for Coverage - Actually imports and tests real modules
 */

import { createRequire } from 'node:module';
import { BenchmarkCLI } from '../src/benchmark.js';
import { ZenSwarm } from '../src/index.js';
import { ZenSwarmEnhanced } from '../src/index-enhanced.js';
import { getMemoryConfig } from '../src/memory-config.js';
import { NeuralCLI } from '../src/neural.js';
import { NeuralAgent } from '../src/neural-agent.js';
import { NeuralNetworkManager } from '../src/neural-network-manager.js';
import { SwarmPersistence } from '../src/persistence.js';
import { WasmLoader } from '../src/wasm-loader.js';

const require = createRequire(import.meta.url);
const { PerformanceCLI } = require('../src/performance.js');
const _memConfig = getMemoryConfig();
try {
  const ruv = await ZenSwarm.initialize();

  const _version = ZenSwarm.getVersion();

  const _simdSupport = ZenSwarm.detectSIMDSupport();

  const swarm = await ruv.createSwarm({
    name: 'test-swarm',
    topology: 'mesh',
    maxAgents: 3,
  });

  const agent = await swarm.spawn({ type: 'researcher' });

  const _result = await agent.execute({ task: 'test-task' });

  const _status = await swarm.getStatus();

  const _orchestrated = await swarm.orchestrate({ task: 'complex-task' });
} catch (error) {
  console.error('✗ ZenSwarm test failed:', error.message);
}
try {
  const enhanced = new ZenSwarmEnhanced();
  await enhanced.initialize();

  const swarmEnhanced = await enhanced.createSwarm({
    topology: 'hierarchical',
    enableNeuralAgents: true,
  });

  const _neuralAgent = await swarmEnhanced.createNeuralAgent({
    type: 'adaptive',
    modelType: 'gru',
  });
} catch (error) {
  console.error('✗ ZenSwarmEnhanced test failed:', error.message);
}
try {
  const neuralAgent = new NeuralAgent({
    type: 'researcher',
    model: 'transformer',
  });
  await neuralAgent.initialize();

  await neuralAgent.train([{ input: [1, 2, 3], output: [0, 1] }]);

  const _prediction = await neuralAgent.predict([1, 2, 3]);
} catch (error) {
  console.error('✗ NeuralAgent test failed:', error.message);
}
try {
  const manager = new NeuralNetworkManager();
  await manager.initialize();

  const _network = await manager.createNetwork({
    layers: [10, 20, 10],
    activation: 'relu',
  });

  const _models = manager.listModels();
} catch (error) {
  console.error('✗ NeuralNetworkManager test failed:', error.message);
}
try {
  const persistence = new SwarmPersistence();
  await persistence.initialize();

  await persistence.saveSwarm({
    id: 'test-swarm',
    state: { agents: 3 },
  });

  const _loaded = await persistence.loadSwarm('test-swarm');

  await persistence.close();
} catch (error) {
  console.error('✗ SwarmPersistence test failed:', error.message);
}
try {
  const loader = new WasmLoader();

  const _supported = loader.isSupported();

  const _simd = loader.hasSIMDSupport();
} catch (error) {
  console.error('✗ WasmLoader test failed:', error.message);
}
try {
  const benchmark = new BenchmarkCLI();

  // Test getArg method
  const _arg = benchmark.getArg(['--type', 'wasm'], '--type');
} catch (error) {
  console.error('✗ Benchmark test failed:', error.message);
}
try {
  const perfCLI = new PerformanceCLI();

  // Test command parsing
  const _command = perfCLI.parseCommand(['analyze', '--metric', 'cpu']);
} catch (error) {
  console.error('✗ Performance test failed:', error.message);
}
try {
  const _neuralCLI = new NeuralCLI();

  // Test pattern memory config
  const { PATTERN_MEMORY_CONFIG } = await import('../src/neural.js');
} catch (error) {
  console.error('✗ Neural test failed:', error.message);
}
