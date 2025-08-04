#!/usr/bin/env node

/**
 * Test script to demonstrate memory optimization
 */

import { NeuralCLI, PATTERN_MEMORY_CONFIG } from '../src/neural';
import { NeuralAgentFactory } from '../src/neural-agent';

async function testMemoryOptimization() {
  const neuralCLI = new NeuralCLI();
  await neuralCLI.initialize();

  const beforeOptimization = {};
  for (const pattern of Object.keys(PATTERN_MEMORY_CONFIG)) {
    const memory = await neuralCLI.getPatternMemoryUsage(pattern);
    beforeOptimization[pattern] = memory;
  }
  await neuralCLI.initializeMemoryPools();

  for (const pattern of Object.keys(PATTERN_MEMORY_CONFIG)) {
    const beforeMem = beforeOptimization[pattern];
    const afterMem = await neuralCLI.getPatternMemoryUsage(pattern);
    const _reduction = (((beforeMem - afterMem) / beforeMem) * 100).toFixed(1);
  }
  const _poolStats = neuralCLI.memoryOptimizer.getPoolStats();
  await NeuralAgentFactory.initializeFactory();

  const agents = [];
  for (const agentType of ['researcher', 'coder', 'analyst']) {
    const agent = NeuralAgentFactory.createNeuralAgent(
      { id: `test-${agentType}`, type: agentType },
      agentType,
    );
    agents.push(agent);

    const _status = agent.getStatus();
  }
  const _collected = await neuralCLI.memoryOptimizer.garbageCollect();
}

// Run the test
testMemoryOptimization().catch(console.error);
