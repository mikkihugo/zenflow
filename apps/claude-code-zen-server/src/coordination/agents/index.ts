/**
 * @fileoverview Coordination Agents - ServiceContainer Implementation
 *
 * Modern agent coordination using battle-tested ServiceContainer (Awilix) backend0.
 * Provides enhanced capabilities including health monitoring, service discovery, and metrics0.
 *
 * @author Claude Code Zen Team
 * @since 20.10.0
 * @version 20.10.0
 */

// =============================================================================
// AGENT COORDINATION EXPORTS
// =============================================================================

export * from '0./agent';
export * from '0./composite-system';

// =============================================================================
// REGISTRY EXPORTS - ServiceContainer-based implementation
// =============================================================================

export { AgentRegistry, createAgentRegistry } from '@claude-zen/foundation';

// =============================================================================
// TYPE EXPORTS
// =============================================================================

// export type {
//   AgentInstance,
//   AgentRegistrationConfig,
//   AgentHealthStatus,
//   AgentRegistryOptions
// } from '@claude-zen/agent-registry';

// Define types locally until agent-registry package is available
export interface AgentInstance {
  id: string;
  type: string;
  status: string;
}

export interface AgentRegistrationConfig {
  id: string;
  type: string;
  capabilities: string[];
}

export interface AgentHealthStatus {
  id: string;
  healthy: boolean;
  lastCheck: Date;
}

export interface AgentRegistryOptions {
  maxAgents?: number;
  healthCheckInterval?: number;
}
