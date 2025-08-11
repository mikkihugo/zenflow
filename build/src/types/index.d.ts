/**
 * Types Module - Barrel Export.
 *
 * Central export point for all shared types across the system.
 */
/**
 * @file Types module exports.
 */
export type { ActivationFunction, NetworkConfig, OptimizerType, TrainingData, TrainingResult, WASMNeuralAccelerator, WASMNeuralConfig, WASMPerformanceMetrics, } from '../neural/types/wasm-types.ts';
export type { AgentCapabilities, AgentConfig, AgentEnvironment, AgentError, AgentId, AgentMetrics, AgentState, AgentStatus as DetailedAgentStatus, AgentType as DetailedAgentType, GlobalAgentInfo, } from './agent-types.ts';
export type { SwarmAgent as Agent, SwarmAgent, SwarmConfig as SwarmConfiguration, SwarmConfig, TaskStatus, ZenSwarm as SwarmType, ZenSwarm, } from './shared-types.ts';
export declare function isZenSwarm(obj: any): obj is import('./shared-types.ts').ZenSwarm;
export declare function isSwarmAgent(obj: any): obj is import('./shared-types.ts').SwarmAgent;
export declare function isSystemEvent(obj: any): obj is import('./shared-types.ts').SystemEvent;
export { isActivationFunction, isNeuralNetworkConfig, isNonEmptyString, isObjectArrayWithProps, isPositiveNumber, isValidNumber, } from '../utils/type-guards.ts';
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
//# sourceMappingURL=index.d.ts.map