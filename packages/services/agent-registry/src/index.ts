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
 * const coders = registry.findAgentsByCapability('code-generation');); * `
 */

// Core agent registry implementation (event-driven)
import { EventDrivenAgentRegistry } from './agent-registry-event-driven';
import type { AgentRegistryOptions } from './types';

// Export event-driven registry as main AgentRegistry
export { EventDrivenAgentRegistry as AgentRegistry } from './agent-registry-event-driven';
export { EventDrivenAgentRegistry, createEventDrivenAgentRegistry } from './agent-registry-event-driven';

// Registry adapter for migration and compatibility
export {
  RegistryAdapter as AgentRegistryAdapter,
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
): EventDrivenAgentRegistry {
  return new EventDrivenAgentRegistry(options);
}

/**
 * Global registry instance for singleton pattern usage
 */
let globalAgentRegistry: EventDrivenAgentRegistry | null = null;

/**
 * Get or create the global agent registry instance
 */
export function getGlobalAgentRegistry(
  options?: AgentRegistryOptions
): EventDrivenAgentRegistry {
  if (!globalAgentRegistry) {
    globalAgentRegistry = new EventDrivenAgentRegistry(options);
  }
  return globalAgentRegistry;
}

/**
 * Reset the global agent registry (primarily for testing)
 */
export function resetGlobalAgentRegistry(): void {
  globalAgentRegistry = null;
}
