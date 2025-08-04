#!/usr/bin/env node

/**
 * Test script to verify agent-task binding mechanism
 * This tests the fix for "No agents available" issue in task orchestration
 */

import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EnhancedMCPTools } from '../src/mcp-tools-enhanced';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.chdir(path.join(__dirname, '..'));

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testAgentTaskBinding() {
  const mcpTools = new EnhancedMCPTools();

  try {
    const _swarmResult = await mcpTools.swarm_init({
      topology: 'mesh',
      maxAgents: 5,
      strategy: 'balanced',
    });
    const agents = [];

    const agentTypes = ['researcher', 'coder', 'analyst'];
    for (let i = 0; i < agentTypes.length; i++) {
      const agentResult = await mcpTools.agent_spawn({
        type: agentTypes[i],
        name: `Agent-${agentTypes[i]}-${i + 1}`,
        capabilities: [agentTypes[i], 'general'],
      });
      agents.push(agentResult);
    }
    const statusResult = await mcpTools.swarm_status({ verbose: true });
    if (statusResult.swarms && statusResult.swarms.length > 0) {
      const _swarm = statusResult.swarms[0];
    }

    const testTasks = [
      {
        description: 'Analyze system performance metrics',
        priority: 'high',
        requiredCapabilities: ['analyst'],
      },
      {
        description: 'Research best practices for optimization',
        priority: 'medium',
        requiredCapabilities: ['researcher'],
      },
      {
        description: 'Implement performance improvements',
        priority: 'medium',
        requiredCapabilities: ['coder'],
      },
    ];

    const orchestratedTasks = [];

    for (const taskConfig of testTasks) {
      try {
        const taskResult = await mcpTools.task_orchestrate({
          task: taskConfig.description,
          priority: taskConfig.priority,
          maxAgents: 2,
          requiredCapabilities: taskConfig.requiredCapabilities,
        });

        orchestratedTasks.push(taskResult);
      } catch (error) {
        console.error(`❌ Task orchestration failed: ${error.message}`);
        throw error;
      }
    }
    await delay(2000); // Wait for tasks to execute

    for (const taskResult of orchestratedTasks) {
      try {
        const statusCheck = await mcpTools.task_status({
          taskId: taskResult.taskId,
          detailed: true,
        });

        if (statusCheck.status === 'completed') {
          const _results = await mcpTools.task_results({
            taskId: taskResult.taskId,
            format: 'summary',
          });
        }
      } catch (error) {
        console.warn(`⚠️ Could not get task status: ${error.message}`);
      }
    }
    const finalStatus = await mcpTools.swarm_status({ verbose: true });
    if (finalStatus.swarms && finalStatus.swarms.length > 0) {
      const _swarm = finalStatus.swarms[0];
    }
    try {
      const _multiAgentTask = await mcpTools.task_orchestrate({
        task: 'Complex analysis requiring multiple perspectives',
        priority: 'high',
        maxAgents: 3,
        strategy: 'parallel',
      });
    } catch (error) {
      console.error(`❌ Multi-agent task failed: ${error.message}`);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Run the test
// Direct execution
testAgentTaskBinding()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });

export { testAgentTaskBinding };
