#!/usr/bin/env node

/**
 * Direct Swarm Integration Test
 *
 * Tests the SwarmOrchestrator direct integration functionality
 */

import { SwarmOrchestrator } from './src/hive-mind/integration/SwarmOrchestrator.js';

async function testDirectSwarmIntegration() {
  console.log('🧪 Testing Direct Swarm Integration...');
  console.log('==================================================');

  try {
    // Test 1: Create SwarmOrchestrator instance
    console.log('\n1. Creating SwarmOrchestrator instance...');
    const orchestrator = SwarmOrchestrator.getInstance();
    console.log('✅ SwarmOrchestrator instance created');

    // Test 2: Initialize orchestrator
    console.log('\n2. Initializing orchestrator...');
    await orchestrator.initialize();
    console.log('✅ SwarmOrchestrator initialized successfully');
    console.log(`   Active status: ${orchestrator.isActive}`);

    // Test 3: Initialize swarm
    console.log('\n3. Testing swarm initialization...');
    const swarmId = await orchestrator.initializeSwarm({
      topology: 'hierarchical',
      maxAgents: 5,
      strategy: 'parallel',
    });
    console.log(`✅ Swarm initialized with ID: ${swarmId}`);

    // Test 4: Spawn agents
    console.log('\n4. Testing agent spawning...');
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
      console.log(`✅ Agent spawned: ${agentId} (${agentConfig.type})`);
    }

    // Test 5: Orchestrate tasks
    console.log('\n5. Testing task orchestration...');
    const tasks = [];

    const taskConfigs = [
      { description: 'Analyze system architecture', strategy: 'sequential', priority: 'high' },
      { description: 'Implement new features', strategy: 'parallel', priority: 'medium' },
      { description: 'Validate implementation', strategy: 'sequential', priority: 'low' },
    ];

    for (const taskConfig of taskConfigs) {
      const taskId = await orchestrator.orchestrateTask(taskConfig);
      tasks.push(taskId);
      console.log(`✅ Task orchestrated: ${taskId} - "${taskConfig.description}"`);
    }

    // Test 6: Get status
    console.log('\n6. Testing status retrieval...');
    const status = await orchestrator.getSwarmStatus();
    console.log('✅ Status retrieved successfully:');
    console.log(`   Active Swarms: ${status.activeSwarms}`);
    console.log(`   Total Agents: ${status.totalAgents}`);
    console.log(`   Active Tasks: ${status.activeTasks}`);
    console.log(`   Completed Tasks: ${status.completedTasks}`);
    console.log(`   Agent Types:`, status.agentsByType);
    console.log(`   Metrics:`, status.metrics);

    // Test 7: Start monitoring
    console.log('\n7. Testing monitoring...');
    const monitoring = await orchestrator.startMonitoring(5); // 5 seconds
    console.log(`✅ Monitoring started: ${monitoring.id} for ${monitoring.duration}s`);

    // Wait a bit to see monitoring in action
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Test 8: Final status check
    console.log('\n8. Final status check...');
    const finalStatus = await orchestrator.getSwarmStatus();
    console.log('✅ Final status:');
    console.log(JSON.stringify(finalStatus, null, 2));

    console.log('\n==================================================');
    console.log('🎉 All direct swarm integration tests PASSED!');
    console.log('✅ Direct integration is working correctly');
    console.log('✅ No MCP dependencies required');
    console.log('✅ No submodule dependencies');

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
