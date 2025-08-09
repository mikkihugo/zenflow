/**
 * Types Module - Barrel Export.
 *
 * Central export point for all shared types across the system.
 */

// Neural WASM types export for system-wide availability
/**
 * @file types module exports
 */


export type {
  ActivationFunction,
  NetworkConfig,
  OptimizerType,
  TrainingData,
  TrainingResult,
  WASMNeuralAccelerator,
  WASMNeuralConfig,
  WASMPerformanceMetrics,
} from '../neural/types/wasm-types';
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

// Export additional type guards from utils for system-wide availability
export {
  isActivationFunction,
  isNeuralNetworkConfig,
  isNonEmptyString,
  isObjectArrayWithProps,
  isPositiveNumber,
  isValidNumber,
} from '../utils/type-guards';

export * from './workflow-types';
export * from './mcp-types';
export * from './neural-types';
export * from './knowledge-types';
export * from './client-types';
export * from './events-types';
export * from './services-types';
export * from './protocol-types';
export * from './conversation-types';
export * from './agent-types';
export * from './singletons';
