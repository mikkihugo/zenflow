#!/usr/bin/env node

/**
 * Direct Swarm Integration Example
 *
 * This example demonstrates how to use the SwarmOrchestrator directly
 * without MCP dependencies for maximum performance and simplicity.
 */

import { SwarmOrchestrator } from '../src/hive-mind/integration/SwarmOrchestrator.js';

async function demonstrateDirectSwarmIntegration() {
  console.log('🐝 Direct Swarm Integration Demo');
  console.log('='.repeat(50));

  try {
    // Get orchestrator instance and initialize
    const orchestrator = SwarmOrchestrator.getInstance();

    console.log('📋 Step 1: Initializing orchestrator...');
    await orchestrator.initialize();
    console.log('✅ Orchestrator initialized successfully');

    // Initialize a swarm
    console.log('\n📋 Step 2: Creating swarm...');
    const swarmId = await orchestrator.initializeSwarm({
      topology: 'hierarchical',
      maxAgents: 5,
      strategy: 'parallel',
    });
    console.log(`✅ Swarm created: ${swarmId}`);

    // Spawn some agents
    console.log('\n📋 Step 3: Spawning agents...');
    const agents = [];

    for (const agentType of ['coordinator', 'researcher', 'analyst']) {
      const agentId = await orchestrator.spawnAgent({
        type: agentType,
        name: `${agentType}-demo`,
        capabilities: [agentType, 'general'],
      });
      agents.push(agentId);
      console.log(`✅ Spawned ${agentType}: ${agentId}`);
    }

    // Create a task
    console.log('\n📋 Step 4: Creating task...');
    const taskId = await orchestrator.orchestrateTask({
      description: 'Analyze system architecture and provide recommendations',
      strategy: 'parallel',
      priority: 'high',
    });
    console.log(`✅ Task created: ${taskId}`);

    // Get status
    console.log('\n📋 Step 5: Checking swarm status...');
    const status = await orchestrator.getSwarmStatus();

    console.log('\n📊 Swarm Status:');
    console.log(`  Active Swarms: ${status.activeSwarms}`);
    console.log(`  Total Agents: ${status.totalAgents}`);
    console.log(`  Active Tasks: ${status.activeTasks}`);
    console.log(`  Completed Tasks: ${status.completedTasks}`);

    if (status.agentsByType.length > 0) {
      console.log('\n  Agent Distribution:');
      status.agentsByType.forEach(({ type, count }) => {
        console.log(`    ${type}: ${count}`);
      });
    }

    console.log('\n  Performance Metrics:');
    console.log(`    Average Task Time: ${status.metrics.avgTaskTime}ms`);
    console.log(`    Success Rate: ${status.metrics.successRate}%`);
    console.log(`    Memory Usage: ${status.metrics.memoryUsage}MB`);

    // Start monitoring for a short time
    console.log('\n📋 Step 6: Starting monitoring...');
    const monitorResult = await orchestrator.startMonitoring(5);
    console.log(`✅ Monitoring started: ${monitorResult.id} (${monitorResult.duration}s)`);

    // Wait a bit to see the monitoring in action
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Shutdown gracefully
    console.log('\n📋 Step 7: Shutting down swarm...');
    await orchestrator.shutdown();
    console.log('✅ Swarm shut down successfully');

    console.log('\n🎉 Direct integration demo completed successfully!');
    console.log('\n💡 Key Benefits:');
    console.log('  - ✅ No MCP dependencies');
    console.log('  - ✅ Direct function calls for maximum performance');
    console.log('  - ✅ Simplified architecture');
    console.log('  - ✅ Real-time orchestration');
    console.log('  - ✅ Full Claude Code integration');
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
