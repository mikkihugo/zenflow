#!/usr/bin/env node

/**
 * Direct Swarm Integration Example
 *
 * This example demonstrates how to use the SwarmOrchestrator directly
 * without MCP dependencies for maximum performance and simplicity.
 */

import { SwarmOrchestrator } from '../src/hive-mind/integration/SwarmOrchestrator.js';

async function demonstrateDirectSwarmIntegration() {
  try {
    // Get orchestrator instance and initialize
    const orchestrator = SwarmOrchestrator.getInstance();
    await orchestrator.initialize();
    const _swarmId = await orchestrator.initializeSwarm({
      topology: 'hierarchical',
      maxAgents: 5,
      strategy: 'parallel',
    });
    const agents = [];

    for (const agentType of ['coordinator', 'researcher', 'analyst']) {
      const agentId = await orchestrator.spawnAgent({
        type: agentType,
        name: `${agentType}-demo`,
        capabilities: [agentType, 'general'],
      });
      agents.push(agentId);
    }
    const _taskId = await orchestrator.orchestrateTask({
      description: 'Analyze system architecture and provide recommendations',
      strategy: 'parallel',
      priority: 'high',
    });

    const status = await orchestrator.getSwarmStatus();

    if (status.agentsByType.length > 0) {
      status.agentsByType.forEach(({ type, count }) => {});
    }

    const _monitorResult = await orchestrator.startMonitoring(5);

    // Wait a bit to see the monitoring in action
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await orchestrator.shutdown();
  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateDirectSwarmIntegration();
}

export { demonstrateDirectSwarmIntegration };
