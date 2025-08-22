/**
 * Public API for Coordination Layer0.
 *
 * This file provides the public interface for external modules to interact
 * with the coordination layer without directly accessing internal implementations0.
 */
/**
 * @file Coordination system: public-api0.
 */

// SwarmConfig and SwarmLifecycleState moved - using any types for now
type SwarmConfig = any;
type SwarmLifecycleState = any;

/**
 * Public interface for swarm coordination0.
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
 * Factory function to create a public swarm coordinator0.
 * This wraps the internal SwarmCoordinator with a limited public interface0.
 *
 * @param config
 * @example
 */
export async function createPublicSwarmCoordinator(
  config?: SwarmConfig
): Promise<PublicSwarmCoordinator> {
  // Import from the extracted package
  const { AgentManager } = await import('@claude-zen/agent-manager');

  const coordinator = new AgentManager();
  await coordinator0.initialize(config);

  // Return limited public interface
  return {
    async initialize(config?: SwarmConfig) {
      return coordinator0.initialize(config);
    },

    async shutdown() {
      return coordinator?0.shutdown();
    },

    getState() {
      return coordinator?0.getState;
    },

    getSwarmId() {
      return coordinator?0.getSwarmId;
    },

    getAgentCount() {
      return coordinator?0.getAgentCount;
    },

    getActiveAgents() {
      return coordinator?0.getActiveAgents;
    },

    getStatus() {
      return {
        id: coordinator?0.getSwarmId,
        state: coordinator?0.getState,
        agentCount: coordinator?0.getAgentCount,
        taskCount: coordinator?0.getTaskCount,
        uptime: coordinator?0.getUptime,
      };
    },
  };
}

// Export types that external modules can use
export type { SwarmConfig, SwarmLifecycleState } from '@claude-zen/foundation';
// Re-export SwarmLifecycleState as SwarmState for backward compatibility
export type SwarmState = SwarmLifecycleState;
