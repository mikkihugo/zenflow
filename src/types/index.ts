/**
 * Types Module - Barrel Export
 *
 * Central export point for all shared types across the system
 */

// Export specific types from agent-types with unique names to avoid conflicts
export type {
  Agent as AgentBase,
  AgentCapabilities,
  AgentCapability,
  AgentConfig,
  AgentEnvironment,
  AgentError,
  AgentId,
  AgentMetrics,
  AgentState,
  AgentStatus as DetailedAgentStatus,
  AgentType as DetailedAgentType,
  ExecutionResult,
  Message as DetailedMessage,
  MessageType,
  Task as DetailedTask,
} from './agent-types';

// Primary exports from shared-types (these are the main Agent interface)
export type {
  SwarmAgent as Agent,
  SwarmConfig as SwarmConfiguration,
  ZenSwarm as SwarmType,
} from './shared-types';

// Re-export shared types (these will be the primary exports)
export * from './shared-types';

// Type guards and utilities
export function isZenSwarm(obj: any): obj is import('./shared-types').ZenSwarm {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.topology === 'string' &&
    Array.isArray(obj.agents)
  );
}

export function isSwarmAgent(obj: any): obj is import('./shared-types').SwarmAgent {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.type === 'string'
  );
}

export function isSystemEvent(obj: any): obj is import('./shared-types').SystemEvent {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.source === 'string'
  );
}
