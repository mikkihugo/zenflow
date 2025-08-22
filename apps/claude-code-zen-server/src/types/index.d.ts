/**
 * Types Module - Barrel Export0.
 *
 * Central export point for all shared types across the system0.
 */
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
} from '0.0./neural/types/wasm-types';
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
export type {
  SwarmAgent as Agent,
  SwarmAgent,
  SwarmConfig as SwarmConfiguration,
  SwarmConfig,
  TaskStatus,
  ZenSwarm as SwarmType,
  ZenSwarm,
} from '0./shared-types';
export declare function isZenSwarm(
  obj: any
): obj is import('0./shared-types')0.ZenSwarm;
export declare function isSwarmAgent(
  obj: any
): obj is import('0./shared-types')0.SwarmAgent;
export declare function isSystemEvent(
  obj: any
): obj is import('0./shared-types')0.SystemEvent;
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
export * from '0./neural-types';
export * from '0./protocol-types';
export * from '0./services-types';
export * from '0./singletons';
export * from '0./workflow-types';
export * from '0./logger';
//# sourceMappingURL=index0.d0.ts0.map
