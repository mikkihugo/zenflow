#!/usr/bin/env node
/**
 * Quick validation script for NPX integration
 * Tests that all components work together correctly
 */

import { ZenSwarm } from '../src/index-enhanced';
import { EnhancedMCPTools } from '../src/mcp-tools-enhanced';
import { NeuralNetworkManager } from '../src/neural-network-manager';
import { WasmModuleLoader } from '../src/wasm-loader';

async function validateIntegration() {
  try {
    const loader = new WasmModuleLoader();
    await loader.initialize('progressive');
    const _moduleStatus = loader.getModuleStatus();
    const ruvSwarm = await ZenSwarm.initialize({
      loadingStrategy: 'progressive',
      enableNeuralNetworks: true,
    });
    const swarm = await ruvSwarm.createSwarm({
      name: 'validation-swarm',
      topology: 'mesh',
      maxAgents: 5,
    });
    const agent = await swarm.spawn({
      type: 'researcher',
      name: 'test-agent',
    });
    const mcpTools = new EnhancedMCPTools();
    await mcpTools.initialize();

    const _features = await mcpTools.features_detect({ category: 'all' });
    if (ruvSwarm.features.neural_networks) {
      const nnManager = new NeuralNetworkManager(ruvSwarm.wasmLoader);
      const network = await nnManager.createAgentNeuralNetwork(agent.id);

      // Quick forward pass test
      const input = new Array(128).fill(0.5);
      const _output = await network.forward(input);
    } else {
    }
    const _memory = await mcpTools.memory_usage({ detail: 'summary' });
    const _task = await swarm.orchestrate({
      description: 'Validation test task',
      priority: 'medium',
    });
    const { ZenSwarm: LegacyZenSwarm } = await import('../src/index.js');
    const start = performance.now();
    await ruvSwarm.createSwarm({ name: 'perf-test', maxAgents: 3 });
    const _swarmTime = performance.now() - start;
  } catch (error) {
    console.error('\n❌ Validation failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run validation when this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateIntegration();
}

export { validateIntegration };
