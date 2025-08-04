#!/usr/bin/env node

/**
 * Direct Swarm Integration Test
 *
 * Tests the SwarmOrchestrator direct integration functionality
 */

import { SwarmOrchestrator } from './src/hive-mind/integration/SwarmOrchestrator.js';

async function testDirectSwarmIntegration() {
  try {
    const orchestrator = SwarmOrchestrator.getInstance();
    await orchestrator.initialize();
    const swarmId = await orchestrator.initializeSwarm({
      topology: 'hierarchical',
      maxAgents: 5,
      strategy: 'parallel',
    });
    console.log(`🐝 Test swarm initialized with ID: ${swarmId}`);
    const agents = [];

    const agentTypes = [
      { type: 'researcher', name: 'Research Agent', specialization: 'data_analysis' },
      { type: 'coder', name: 'Code Agent', specialization: 'implementation' },
      { type: 'analyst', name: 'Analysis Agent', specialization: 'quality_assurance' },
    ];

    for (const agentConfig of agentTypes) {
      const agentId = await orchestrator.spawnAgent({
        ...agentConfig,
        capabilities: [agentConfig.specialization, 'general'],
      });
      agents.push(agentId);
    }
    const tasks = [];

    const taskConfigs = [
      { description: 'Analyze system architecture', strategy: 'sequential', priority: 'high' },
      { description: 'Implement new features', strategy: 'parallel', priority: 'medium' },
      { description: 'Validate implementation', strategy: 'sequential', priority: 'low' },
    ];

    for (const taskConfig of taskConfigs) {
      const taskId = await orchestrator.orchestrateTask(taskConfig);
      tasks.push(taskId);
    }
    const status = await orchestrator.getSwarmStatus();
    console.log(`📊 Initial swarm status:`, status);
    
    const monitoring = await orchestrator.startMonitoring(5); // 5 seconds
    console.log(`📈 Monitoring started:`, monitoring);

    // Wait a bit to see monitoring in action
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const finalStatus = await orchestrator.getSwarmStatus();
    console.log(`📊 Final swarm status:`, finalStatus);

    return true;
  } catch (error) {
    console.error('\n❌ Direct swarm integration test FAILED:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Run the test
testDirectSwarmIntegration()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
