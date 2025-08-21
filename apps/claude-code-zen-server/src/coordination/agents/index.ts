/**
 * @fileoverview Coordination Agents - ServiceContainer Implementation
 * 
 * Modern agent coordination using battle-tested ServiceContainer (Awilix) backend.
 * Provides enhanced capabilities including health monitoring, service discovery, and metrics.
 * 
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 2.1.0
 */

// =============================================================================
// AGENT COORDINATION EXPORTS
// =============================================================================

export * from './agent';
export * from './composite-system';

// =============================================================================
// REGISTRY EXPORTS - ServiceContainer-based implementation
// =============================================================================

export { 
  getAgentRegistry as AgentRegistry,
  createNewAgentRegistry as createAgentRegistry,
  registerAgent,
  getAllAgents,
  findAgentsByCapability
} from '@claude-zen/infrastructure';

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type {
  AgentInstance,
  AgentRegistrationConfig,
  AgentHealthStatus,
  AgentRegistryOptions
} from '@claude-zen/agent-registry';
