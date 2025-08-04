#!/usr/bin/env node

/**
 * Comprehensive orchestration test covering edge cases and different scenarios
 */

import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
process.chdir(path.join(__dirname, '..'));

import { EnhancedMCPTools } from '../src/mcp-tools-enhanced';

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function comprehensiveOrchestrationTest() {
  const mcpTools = new EnhancedMCPTools();

  try {
    const _swarm1 = await mcpTools.swarm_init({
      topology: 'mesh',
      maxAgents: 3,
      strategy: 'balanced',
    });
    const _swarm2 = await mcpTools.swarm_init({
      topology: 'star',
      maxAgents: 2,
      strategy: 'balanced',
    });
    const agentTypes = ['researcher', 'coder', 'analyst', 'optimizer', 'coordinator'];
    let _agentCount = 0;

    for (let i = 0; i < agentTypes.length; i++) {
      await mcpTools.agent_spawn({
        type: agentTypes[i],
        name: `${agentTypes[i]}-agent-${i}`,
        capabilities: [agentTypes[i], 'general', 'task-execution'],
      });
      _agentCount++;
    }
    const _allAgents = await mcpTools.agent_list({ filter: 'all' });
    const _idleAgents = await mcpTools.agent_list({ filter: 'idle' });
    const capabilityTasks = [
      {
        description: 'Research quantum computing applications',
        capabilities: ['researcher'],
        priority: 'high',
      },
      {
        description: 'Optimize database queries',
        capabilities: ['optimizer'],
        priority: 'medium',
      },
      {
        description: 'Coordinate team activities',
        capabilities: ['coordinator'],
        priority: 'low',
      },
    ];

    const capabilityResults = [];
    for (const task of capabilityTasks) {
      const result = await mcpTools.task_orchestrate({
        task: task.description,
        priority: task.priority,
        requiredCapabilities: task.capabilities,
        maxAgents: 1,
      });
      capabilityResults.push(result);
    }
    const _multiAgentTask = await mcpTools.task_orchestrate({
      task: 'Large-scale data analysis requiring multiple agents',
      priority: 'high',
      maxAgents: 3,
      strategy: 'parallel',
    });
    // First, make all agents busy with long-running tasks
    const longRunningTasks = [];
    for (let i = 0; i < 3; i++) {
      const task = await mcpTools.task_orchestrate({
        task: `Long running task ${i + 1}`,
        priority: 'medium',
        maxAgents: 2,
      });
      longRunningTasks.push(task);
    }

    // Wait a bit, then try to orchestrate when agents are busy
    await delay(100);

    try {
      await mcpTools.task_orchestrate({
        task: 'Task when all agents are busy',
        priority: 'high',
        maxAgents: 1,
      });
    } catch (error) {
      if (error.message.includes('No agents available')) {
      } else {
        throw error;
      }
    }

    // Wait for tasks to complete
    await delay(1000);
    for (const taskResult of capabilityResults) {
      const status = await mcpTools.task_status({
        taskId: taskResult.taskId,
        detailed: true,
      });

      if (status.status === 'completed') {
        const _results = await mcpTools.task_results({
          taskId: taskResult.taskId,
          format: 'summary',
        });
      }
    }
    const _swarmStatus = await mcpTools.swarm_status({ verbose: true });
    const _memoryUsage = await mcpTools.memory_usage({ detail: 'summary' });
    try {
      await mcpTools.task_orchestrate({
        task: 'Task with invalid swarm',
        priority: 'high',
      });
      // If we get here, clear the swarms first
      mcpTools.activeSwarms.clear();
      await mcpTools.task_orchestrate({
        task: 'Task with no swarm',
        priority: 'high',
      });
    } catch (error) {
      if (error.message.includes('No active swarm found')) {
      } else {
        throw error;
      }
    }

    return true;
  } catch (error) {
    console.error('\n❌ Comprehensive test failed:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Run the comprehensive test
// Direct execution
comprehensiveOrchestrationTest()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });

export { comprehensiveOrchestrationTest };
