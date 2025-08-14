export function adaptAgentForCoordination(baseAgent) {
    return {
        ...baseAgent,
        connections: [],
        async communicate(message) {
            if (baseAgent.handleMessage) {
                await baseAgent.handleMessage(message);
            }
        },
        update(state) {
            if (baseAgent.updateState) {
                baseAgent.updateState(state);
            }
        },
    };
}
export function adaptTaskForExecution(coordinationTask) {
    return {
        ...coordinationTask,
        dependencies: [],
        assignedAgents: [],
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
export async function executeTaskWithAgent(agent, task) {
    const baseTask = adaptTaskForExecution(task);
    return await agent.execute(baseTask);
}
export function createAgentPoolEntry(agent) {
    return {
        agent: adaptAgentForCoordination(agent),
        id: agent.id,
        type: agent.type,
        state: agent.state,
        config: agent.config,
        metrics: agent.metrics,
    };
}
//# sourceMappingURL=agent-adapter.js.map