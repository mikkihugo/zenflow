/**
 * Public API for Coordination Layer.
 *
 * This file provides the public interface for external modules to interact
 * with the coordination layer without directly accessing internal implementations.
 */
/**
 * @file Coordination system: public-api.
 */
/**
 * Factory function to create a public swarm coordinator.
 * This wraps the internal SwarmCoordinator with a limited public interface.
 *
 * @param config
 * @example
 */
export async function createPublicSwarmCoordinator(config) {
    // Dynamically import to avoid circular dependencies
    const { SwarmCoordinator } = await import('./swarm/core/swarm-coordinator.ts');
    const coordinator = new SwarmCoordinator();
    await coordinator.initialize(config);
    // Return limited public interface
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
