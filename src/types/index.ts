/**
 * Types Module - Barrel Export.
 *
 * Central export point for all shared types across the system.
 */

// Neural WASM types export for system-wide availability
/**
 * @file Types module exports.
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
} from '../neural/types/wasm-types.ts';
// Export specific types from agent-types with unique names to avoid conflicts
export type {
  AgentCapabilities,
  AgentConfig,
  AgentEnvironment,
  AgentError,
  AgentId,
  AgentMetrics,
  AgentState,
  AgentStatus as DetailedAgentStatus,
  AgentType as DetailedAgentType,
  GlobalAgentInfo,
} from './agent-types.ts';
// Primary exports from shared-types (these are the main Agent interface)
// Re-export shared types selectively to avoid conflicts
export type {
  SwarmAgent as Agent,
  SwarmAgent,
  SwarmConfig as SwarmConfiguration,
  SwarmConfig,
  TaskStatus,
  ZenSwarm as SwarmType,
  ZenSwarm,
} from './shared-types.ts';

// Type guards and utilities
export function isZenSwarm(obj: any): obj is import('./shared-types.ts').ZenSwarm {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj['topology'] === 'string' &&
    Array.isArray(obj['agents'])
  );
}

export function isSwarmAgent(obj: any): obj is import('./shared-types.ts').SwarmAgent {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.type === 'string'
  );
}

export function isSystemEvent(obj: any): obj is import('./shared-types.ts').SystemEvent {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj['source'] === 'string'
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
} from '../utils/type-guards.ts';
export * from './client-types.ts';
export * from './conversation-types.ts';
export * from './events-types.ts';
export * from './knowledge-types.ts';
export * from './mcp-types.ts';
export * from './neural-types.ts';
export * from './protocol-types.ts';
export * from './services-types.ts';
export * from './singletons.ts';
export * from './workflow-types.ts';
