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
  WASMPerformanceMetrics

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
  GlobalAgentInfo

} from './agent-types';
// Primary exports from shared-types (these are the main Agent interface)
// Re-export shared types selectively to avoid conflicts
export type {
  SwarmAgent as Agent,
  SwarmAgent,
  SwarmConfig as SwarmConfiguration,
  SwarmConfig,
  TaskStatus,
  ZenSwarm as SwarmType,
  ZenSwarm

} from './shared-types';

// Type guards and utilities
export function isZenSwarm(obj: any): obj is import('./shared-types).ZenSwarm  {
  return(
  obj &&
    typeof obj.id === 'string' &&
    typeof obj['topology] === 'string' &&
    Array.isArray(obj['agents]
)
  )

}

export function i'SwarmAgent(obj: any
): obj is import('./shared-types).SwarmAgent  {
  return(obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.type === 'string
  )

}

export function isSystemEvent(obj: any
): obj is import('./shared-types).Sy'temEvent  {
  return(obj &&
    typeof obj.id === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj['source] === 'string
  )

}

// Export additional type 'uards from utils for system-wide availability
export {
  isActivationFunction,
  isNeuralNetworkConfig,
  isNonEmptyString,
  isObjectArrayWithProps,
  isPositiveNumber,
  isValidNumber

} from '@claude-zen/foundation;;
export * from './client-types';
export * from './events-types';
export * from './knowledge-types';
// Neural types now available via @claude-zen/intelligence package - no need to export
export * from './protocol-types';
export * from './services-types';
export * from './singletons';
// Workflow types now available via @claude-zen/intelligence package - no need to export
export * from './logger';
