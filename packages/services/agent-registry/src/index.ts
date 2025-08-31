/**
 * @fileoverview Agent Registry Package - Dedicated agent management system
 *
 * Provides centralized agent registration, discovery, and lifecycle management
 * using battle-tested dependency injection patterns and service container integration.
 *
 * This package was extracted from @claude-zen/foundation to provide dedicated
 * agent management capabilities while keeping the foundation package focused
 * on core utilities.
 *
 * Key Features:
 * - Agent registration with template-based configuration
 * - Health monitoring and performance tracking
 * - Service discovery and capability-based queries
 * - Persistent storage with automatic cleanup
 * - Type-safe registration with lifecycle management
 * - Event-driven notifications for registry changes
 *
 * @package @claude-zen/agent-registry
 * @version 1.0.0
 *
 * @example Basic Usage
 * '''typescript'
 * import { AgentRegistry, createAgentRegistry} from '@claude-zen/agent-registry';
 *
 * const registry = createAgentRegistry();
 * await registry.initialize();
 *
 * // Register an agent
 * const agent = await registry.registerAgent({
 *   templateId: 'coder-template', *   name: 'Code Generator', *   type: 'coder', *   config:{ maxTasks: 10}
 *});
 *
 * // Query agents by capability
 * const coders = registry.findAgentsByCapability('code-generation');`) * `
 */

// Core agent registry implementation
// Factory functions
import { AgentRegistry } from './agent-registry';
import type { AgentRegistryOptions } from './types';

export { AgentRegistry } from './agent-registry';

// Registry adapter for migration and compatibility
export {
  AgentRegistryAdapter,
  createAgentRegistryAdapter,
  type MigrationStats,
  type RegistryAdapterOptions,
} from './registry-adapter';

// Type definitions
export type {
  AgentHealthStatus,
  AgentInstance,
  AgentRegistrationConfig,
  AgentRegistryOptions,
  AgentTemplate,
  RegistryStats,
} from './types';

/**
 * Create a new agent registry instance with default configuration
 */
export function createAgentRegistry(
  options?: AgentRegistryOptions
): AgentRegistry {
  return new AgentRegistry(options);
}

/**
 * Global registry instance for singleton pattern usage
 */
let globalAgentRegistry: AgentRegistry | null = null;

/**
 * Get or create the global agent registry instance
 */
export function getGlobalAgentRegistry(
  options?: AgentRegistryOptions
): AgentRegistry {
  if (!globalAgentRegistry) {
    globalAgentRegistry = new AgentRegistry(options);
  }
  return globalAgentRegistry;
}

/**
 * Reset the global agent registry (primarily for testing)
 */
export function resetGlobalAgentRegistry(): void {
  globalAgentRegistry = null;
}
