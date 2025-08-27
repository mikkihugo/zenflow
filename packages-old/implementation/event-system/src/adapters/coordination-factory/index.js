/**
 * @file Coordination Event Factory - Main Export
 *
 * Exports the modular coordination event factory system with all components.
 */
// Main factory class
export { CoordinationEventFactory } from './factory';
// Helper functions and utilities
export { CoordinationFactoryHelpers } from './helpers';
// Factory function for creating CoordinationEventFactory instances
import { CoordinationEventFactory } from './factory';
import { CoordinationFactoryHelpers } from './helpers';
export function createCoordinationEventFactory(config) {
    return new CoordinationEventFactory(config);
}
// Convenience functions for creating coordination event adapters
export async function createCoordinationAdapter(config) {
    const factory = new CoordinationEventFactory();
    return await factory.create(config);
}
export async function createSwarmCoordinationAdapter(name, overrides) {
    const config = CoordinationFactoryHelpers.createDefaultCoordinationConfig(name, {
        swarmCoordination: {
            enabled: true,
            wrapLifecycleEvents: true,
            wrapPerformanceEvents: true,
            wrapTopologyEvents: true,
            wrapHealthEvents: true,
            coordinators: ['swarm-coordinator', 'sparc-coordinator'],
        },
        agentManagement: { enabled: false },
        taskOrchestration: { enabled: false },
        protocolManagement: { enabled: false },
        ...overrides,
    });
    return createCoordinationAdapter(config);
}
export async function createAgentManagementAdapter(name, overrides) {
    const config = CoordinationFactoryHelpers.createDefaultCoordinationConfig(name, {
        agentManagement: {
            enabled: true,
            wrapAgentEvents: true,
            wrapHealthEvents: true,
            wrapRegistryEvents: true,
            wrapLifecycleEvents: true,
        },
        swarmCoordination: { enabled: false },
        taskOrchestration: { enabled: false },
        protocolManagement: { enabled: false },
        ...overrides,
    });
    return createCoordinationAdapter(config);
}
export async function createTaskOrchestrationAdapter(name, overrides) {
    const config = CoordinationFactoryHelpers.createDefaultCoordinationConfig(name, {
        taskOrchestration: {
            enabled: true,
            wrapTaskEvents: true,
            wrapDistributionEvents: true,
            wrapExecutionEvents: true,
            wrapCompletionEvents: true,
        },
        swarmCoordination: { enabled: false },
        agentManagement: { enabled: false },
        protocolManagement: { enabled: false },
        ...overrides,
    });
    return createCoordinationAdapter(config);
}
export async function createProtocolManagementAdapter(name, overrides) {
    const config = CoordinationFactoryHelpers.createDefaultCoordinationConfig(name, {
        protocolManagement: {
            enabled: true,
            wrapCommunicationEvents: true,
            wrapTopologyEvents: true,
            wrapLifecycleEvents: true,
            wrapCoordinationEvents: true,
        },
        swarmCoordination: { enabled: false },
        agentManagement: { enabled: false },
        taskOrchestration: { enabled: false },
        ...overrides,
    });
    return createCoordinationAdapter(config);
}
export async function createComprehensiveCoordinationAdapter(name, overrides) {
    const config = CoordinationFactoryHelpers.createDefaultCoordinationConfig(name, {
        swarmCoordination: { enabled: true },
        agentManagement: { enabled: true },
        taskOrchestration: { enabled: true },
        protocolManagement: { enabled: true },
        ...overrides,
    });
    return createCoordinationAdapter(config);
}
// Global factory instance
export const coordinationEventFactory = new CoordinationEventFactory();
// Default export
export default CoordinationEventFactory;
