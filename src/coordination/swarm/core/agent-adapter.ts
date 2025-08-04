/**
 * Agent Interface Adapter - Compatibility Layer
 * 
 * This module provides adapter functions to bridge the interface differences
 * between the base Agent interface and coordination-specific requirements.
 * 
 * @fileoverview Agent interface compatibility adapter
 */

import type { Agent as BaseAgent, Task as BaseTask } from '../../../types/agent-types';
import type { Agent as CoordinationAgent, Task as CoordinationTask, Message } from './types';

/**
 * Adapter function to convert base Agent to coordination Agent
 */
export function adaptAgentForCoordination(baseAgent: BaseAgent): CoordinationAgent {
  return {
    ...baseAgent,
    connections: [], // Initialize empty connections
    
    // Add coordination-specific methods
    async communicate(message: Message): Promise<void> {
      // Default communication implementation
      // In practice, this would delegate to the agent's message handling
      if (baseAgent.handleMessage) {
        await baseAgent.handleMessage(message as any);
      }
    },
    
    update(state: Partial<any>): void {
      // Default update implementation
      // In practice, this would call the agent's updateState method
      if (baseAgent.updateState) {
        baseAgent.updateState(state as any);
      }
    }
  };
}

/**
 * Adapter function to convert coordination Task to base Task
 */
export function adaptTaskForExecution(coordinationTask: CoordinationTask): BaseTask {
  return {
    ...coordinationTask,
    // Add missing base task properties with defaults
    dependencies: [], // Required by BaseTask interface
    assignedAgents: [], // Required by BaseTask interface
    swarmId: 'default',
    strategy: 'direct',
    progress: 0,
    requireConsensus: false,
    maxAgents: 1,
    requiredCapabilities: [],
    createdAt: new Date(),
    metadata: {}
  };
}

/**
 * Type-safe agent execution with adaptation
 */
export async function executeTaskWithAgent(
  agent: BaseAgent | CoordinationAgent, 
  task: CoordinationTask
): Promise<any> {
  // Convert coordination task to base task format
  const baseTask = adaptTaskForExecution(task);
  
  // Execute using the base agent's execute method
  return await agent.execute(baseTask);
}

/**
 * Create agent pool entry with proper typing
 */
export function createAgentPoolEntry(agent: BaseAgent): any {
  // Return properly typed entry for agent pool
  return {
    agent: adaptAgentForCoordination(agent),
    id: agent.id,
    type: agent.type,
    state: agent.state,
    config: agent.config,
    metrics: agent.metrics
  };
}