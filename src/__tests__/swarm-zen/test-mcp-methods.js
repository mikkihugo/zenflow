#!/usr/bin/env node

/**
 * Test script for the new MCP tool methods
 * Tests: agent_metrics, swarm_monitor, neural_train, task_results
 */

import { EnhancedMCPTools } from '../src/mcp-tools-enhanced';

async function runTests() {
  const mcpTools = new EnhancedMCPTools();
  let testsPassed = 0;
  let testsTotal = 0;

  try {
    await mcpTools.initialize();

    // Test 1: Initialize a swarm
    testsTotal++;
    const swarmResult = await mcpTools.swarm_init({
      topology: 'mesh',
      maxAgents: 5,
      strategy: 'balanced',
    });
    testsPassed++;

    // Test 2: Spawn agents
    testsTotal++;
    const agents = [];
    for (let i = 0; i < 3; i++) {
      const agent = await mcpTools.agent_spawn({
        type: ['researcher', 'coder', 'analyst'][i],
        name: `TestAgent${i + 1}`,
        swarmId: swarmResult.id,
      });
      agents.push(agent.agent);
    }
    testsPassed++;

    // Test 3: Agent Metrics
    testsTotal++;
    try {
      const _metrics = await mcpTools.agent_metrics({
        swarmId: swarmResult.id,
        metricType: 'all',
      });

      // Test specific agent metrics
      const _agentMetrics = await mcpTools.agent_metrics({
        agentId: agents[0].id,
        metricType: 'performance',
      });

      testsPassed++;
    } catch (_error) {}

    // Test 4: Swarm Monitor
    testsTotal++;
    try {
      const _monitoring = await mcpTools.swarm_monitor({
        swarmId: swarmResult.id,
        includeAgents: true,
        includeTasks: true,
        includeMetrics: true,
      });

      testsPassed++;
    } catch (_error) {}

    // Test 5: Neural Training
    testsTotal++;
    try {
      const _neuralResult = await mcpTools.neural_train({
        agentId: agents[0].id,
        iterations: 5,
        learningRate: 0.001,
        modelType: 'feedforward',
      });

      testsPassed++;
    } catch (_error) {}

    // Test 6: Create and test task results
    testsTotal++;
    try {
      // Create a task
      const taskResult = await mcpTools.task_orchestrate({
        task: 'Test data processing task',
        priority: 'high',
        strategy: 'parallel',
        swarmId: swarmResult.id,
      });

      // Simulate task completion by updating database
      mcpTools.persistence.updateTask(taskResult.taskId, {
        status: 'completed',
        result: JSON.stringify({ output: 'Task completed successfully', data: [1, 2, 3, 4, 5] }),
        execution_time_ms: 1500,
        completed_at: new Date().toISOString(),
      });

      // Test task results - summary format
      const _results = await mcpTools.task_results({
        taskId: taskResult.taskId,
        format: 'summary',
      });

      // Test task results - detailed format
      const _detailedResults = await mcpTools.task_results({
        taskId: taskResult.taskId,
        format: 'detailed',
        includeAgentResults: true,
      });

      testsPassed++;
    } catch (_error) {}

    // Test 7: Error handling - Invalid task ID
    testsTotal++;
    try {
      await mcpTools.task_results({
        taskId: 'invalid-task-id-12345',
        format: 'summary',
      });
    } catch (error) {
      if (error.message.includes('Task not found')) {
        testsPassed++;
      } else {
      }
    }

    // Test 8: Error handling - Missing required parameters
    testsTotal++;
    try {
      await mcpTools.neural_train({
        // Missing agentId
        iterations: 10,
      });
    } catch (error) {
      if (error.message.includes('agentId is required')) {
        testsPassed++;
      } else {
      }
    }

    if (testsPassed === testsTotal) {
    } else {
    }
  } catch (error) {
    console.error('💥 Fatal error during testing:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch((error) => {
    console.error('💥 Test execution failed:', error.message);
    process.exit(1);
  });
}

export { runTests };
