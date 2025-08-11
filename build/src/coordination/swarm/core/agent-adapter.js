/**
 * Agent Interface Adapter - Compatibility Layer.
 *
 * This module provides adapter functions to bridge the interface differences.
 * Between the base Agent interface and coordination-specific requirements..
 *
 * @file Agent interface compatibility adapter.
 */
/**
 * Adapter function to convert base Agent to coordination Agent.
 *
 * @param baseAgent
 * @example
 */
export function adaptAgentForCoordination(baseAgent) {
    return {
        ...baseAgent,
        connections: [], // Initialize empty connections
        // Add coordination-specific methods
        async communicate(message) {
            // Default communication implementation
            // In practice, this would delegate to the agent's message handling
            if (baseAgent.handleMessage) {
                await baseAgent.handleMessage(message);
            }
        },
        update(state) {
            // Default update implementation
            // In practice, this would call the agent's updateState method
            if (baseAgent.updateState) {
                baseAgent.updateState(state);
            }
        },
    };
}
/**
 * Adapter function to convert coordination Task to base Task.
 *
 * @param coordinationTask
 * @example
 */
export function adaptTaskForExecution(coordinationTask) {
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
        metadata: {},
    };
}
/**
 * Type-safe agent execution with adaptation.
 *
 * @param agent
 * @param task
 * @example
 */
export async function executeTaskWithAgent(agent, task) {
    // Convert coordination task to base task format
    const baseTask = adaptTaskForExecution(task);
    // Execute using the base agent's execute method
    return await agent.execute(baseTask);
}
/**
 * Create agent pool entry with proper typing.
 *
 * @param agent
 * @example
 */
export function createAgentPoolEntry(agent) {
    // Return properly typed entry for agent pool
    return {
        agent: adaptAgentForCoordination(agent),
        id: agent.id,
        type: agent.type,
        state: agent.state,
        config: agent.config,
        metrics: agent.metrics,
    };
}
