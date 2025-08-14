export async function createPublicSwarmCoordinator(config) {
    const { SwarmCoordinator } = await import('./swarm/core/swarm-coordinator.ts');
    const coordinator = new SwarmCoordinator();
    await coordinator.initialize(config);
    return {
        async initialize(config) {
            return coordinator.initialize(config);
        },
        async shutdown() {
            return coordinator.shutdown();
        },
        getState() {
            return coordinator.getState();
        },
        getSwarmId() {
            return coordinator.getSwarmId();
        },
        getAgentCount() {
            return coordinator.getAgentCount();
        },
        getActiveAgents() {
            return coordinator.getActiveAgents();
        },
        getStatus() {
            return {
                id: coordinator.getSwarmId(),
                state: coordinator.getState(),
                agentCount: coordinator.getAgentCount(),
                taskCount: coordinator.getTaskCount(),
                uptime: coordinator.getUptime(),
            };
        },
    };
}
//# sourceMappingURL=public-api.js.map