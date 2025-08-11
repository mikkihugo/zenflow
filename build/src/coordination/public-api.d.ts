/**
 * Public API for Coordination Layer.
 *
 * This file provides the public interface for external modules to interact
 * with the coordination layer without directly accessing internal implementations.
 */
/**
 * @file Coordination system: public-api.
 */
import type { SwarmConfig, SwarmLifecycleState } from './swarm/core/types.ts';
/**
 * Public interface for swarm coordination.
 *
 * @example
 */
export interface PublicSwarmCoordinator {
    initialize(config?: SwarmConfig): Promise<void>;
    shutdown(): Promise<void>;
    getState(): SwarmLifecycleState;
    getSwarmId(): string;
    getAgentCount(): number;
    getActiveAgents(): string[];
    getStatus(): {
        id: string;
        state: SwarmLifecycleState;
        agentCount: number;
        taskCount: number;
        uptime: number;
    };
}
/**
 * Factory function to create a public swarm coordinator.
 * This wraps the internal SwarmCoordinator with a limited public interface.
 *
 * @param config
 * @example
 */
export declare function createPublicSwarmCoordinator(config?: SwarmConfig): Promise<PublicSwarmCoordinator>;
export type { SwarmConfig, SwarmLifecycleState } from './swarm/core/types.ts';
export type SwarmState = SwarmLifecycleState;
//# sourceMappingURL=public-api.d.ts.map