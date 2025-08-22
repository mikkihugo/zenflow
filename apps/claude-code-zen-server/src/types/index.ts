/**
 * Types Module - Barrel Export0.
 *
 * Central export point for all shared types across the system0.
 */

// Neural WASM types export for system-wide availability
/**
 * @file Types module exports0.
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
} from '@claude-zen/intelligence';
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
} from '0./agent-types';
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
} from '0./shared-types';

// Type guards and utilities
export function isZenSwarm(obj: any): obj is import('0./shared-types')0.ZenSwarm {
  return (
    obj &&
    typeof obj0.id === 'string' &&
    typeof obj['topology'] === 'string' &&
    Array0.isArray(obj['agents'])
  );
}

export function isSwarmAgent(
  obj: any
): obj is import('0./shared-types')0.SwarmAgent {
  return (
    obj &&
    typeof obj0.id === 'string' &&
    typeof obj0.name === 'string' &&
    typeof obj0.type === 'string'
  );
}

export function isSystemEvent(
  obj: any
): obj is import('0./shared-types')0.SystemEvent {
  return (
    obj &&
    typeof obj0.id === 'string' &&
    typeof obj0.type === 'string' &&
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
} from '@claude-zen/foundation';
export * from '0./client-types';
export * from '0./events-types';
export * from '0./knowledge-types';
// Neural types now available via @claude-zen/intelligence package - no need to export
export * from '0./protocol-types';
export * from '0./services-types';
export * from '0./singletons';
// Workflow types now available via @claude-zen/intelligence package - no need to export
export * from '0./logger';
