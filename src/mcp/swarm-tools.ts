/**
 * MCP tools for swarm orchestration
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { spawnSwarmAgent, getSwarmState } from '../cli/commands/swarm-spawn.ts';

/**
 * Dispatch agent tool for swarm orchestration
 */
export const dispatchAgentTool: Tool = {
  name: 'dispatch_agent',
  description: 'Spawn a new agent in the swarm to handle a specific task',
  inputSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['researcher', 'developer', 'analyst', 'reviewer', 'coordinator'],
        description: 'The type of agent to spawn',
      },
      task: {
        type: 'string',
        description: 'The specific task for the agent to complete',
      },
      name: {
        type: 'string',
        description: 'Optional name for the agent',
      },
    },
    required: ['type', 'task'],
  },
};

/**
 * Handle dispatch agent tool execution
 */
export async function handleDispatchAgent(args: any): Promise<any> {
  const { type, task, name } = args;
  
  // Get swarm ID from environment
  const swarmId = Deno.env.get('CLAUDE_SWARM_ID');
  if (!swarmId) {
    throw new Error('Not running in swarm context');
  }
  
  // Get parent agent ID if available
  const parentId = Deno.env.get('CLAUDE_SWARM_AGENT_ID');
  
  try {
    // Spawn the agent
    const agent = await spawnSwarmAgent(swarmId, type, task, parentId);
    
    return {
      success: true,
      agentId: agent.id,
      agentName: agent.name,
      terminalId: agent.terminalId,
      message: `Successfully spawned ${agent.name} to work on: ${task}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Memory store tool for swarm coordination
 */
export const memoryStoreTool: Tool = {
  name: 'memory_store',
  description: 'Store data in the shared swarm memory for coordination',
  inputSchema: {
    type: 'object',
    properties: {
      key: {
        type: 'string',
        description: 'The key to store data under',
      },
      value: {
        type: 'object',
        description: 'The data to store (JSON object)',
      },
    },
    required: ['key', 'value'],
  },
};

/**
 * Memory retrieve tool for swarm coordination
 */
export const memoryRetrieveTool: Tool = {
  name: 'memory_retrieve',
  description: 'Retrieve data from the shared swarm memory',
  inputSchema: {
    type: 'object',
    properties: {
      key: {
        type: 'string',
        description: 'The key to retrieve data from',
      },
    },
    required: ['key'],
  },
};

/**
 * Swarm status tool
 */
export const swarmStatusTool: Tool = {
  name: 'swarm_status',
  description: 'Get the current status of the swarm and all agents',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

/**
 * Handle swarm status tool execution
 */
export async function handleSwarmStatus(args: any): Promise<any> {
  const swarmId = Deno.env.get('CLAUDE_SWARM_ID');
  if (!swarmId) {
    throw new Error('Not running in swarm context');
  }
  
  const state = getSwarmState(swarmId);
  if (!state) {
    throw new Error('Swarm state not found');
  }
  
  const agents = Array.from(state.agents.values()).map(agent => ({
    id: agent.id,
    type: agent.type,
    name: agent.name,
    task: agent.task,
    status: agent.status,
    parentId: agent.parentId,
  }));
  
  const runtime = Math.floor((Date.now() - state.startTime) / 1000);
  
  return {
    swarmId: state.swarmId,
    objective: state.objective,
    runtime: `${runtime}s`,
    totalAgents: agents.length,
    activeAgents: agents.filter(a => a.status === 'active').length,
    completedAgents: agents.filter(a => a.status === 'completed').length,
    failedAgents: agents.filter(a => a.status === 'failed').length,
    agents,
  };
}

/**
 * Export all swarm tools
 */
export const swarmTools = [
  dispatchAgentTool,
  memoryStoreTool,
  memoryRetrieveTool,
  swarmStatusTool,
];