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
  // Swarm lifecycle
  initialize(config?: SwarmConfig): Promise<void>;
  shutdown(): Promise<void>;

  // State management
  getState(): SwarmLifecycleState;
  getSwarmId(): string;

  // Agent management
  getAgentCount(): number;
  getActiveAgents(): string[];

  // Status and monitoring
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
export async function createPublicSwarmCoordinator(
  config?: SwarmConfig
): Promise<PublicSwarmCoordinator> {
  // Dynamically import to avoid circular dependencies
  const { SwarmCoordinator } = await import(
    './swarm/core/swarm-coordinator.ts'
  );

  const coordinator = new SwarmCoordinator();
  await coordinator.initialize(config);

  // Return limited public interface
  return {
    async initialize(config?: SwarmConfig) {
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

// Export types that external modules can use
export type { SwarmConfig, SwarmLifecycleState } from './swarm/core/types.ts';
// Re-export SwarmLifecycleState as SwarmState for backward compatibility
export type SwarmState = SwarmLifecycleState;
