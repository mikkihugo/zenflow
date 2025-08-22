/**
 * Types Module - Barrel Export.
 *
 * Central export point for all shared types across the system.
 */
/**
 * @file Types module exports.
 */
export type { ActivationFunction, NetworkConfig, OptimizerType, TrainingData, TrainingResult, WASMNeuralAccelerator, WASMNeuralConfig, WASMPerformanceMetrics,
} from './neural/types/wasm-types';
export type { AgentCapabilities, AgentConfig, AgentEnvironment, AgentError, AgentId, AgentMetrics, AgentState, AgentStatus as DetailedAgentStatus, AgentType as DetailedAgentType, GlobalAgentInfo,
} from "./agent-types";
export type { SwarmAgent as Agent, SwarmAgent, SwarmConfig as SwarmConfiguration, SwarmConfig, TaskStatus, ZenSwarm as SwarmType, ZenSwarm,
} from "./shared-types";
export declare function isZenSwarm( obj: any
): obj is import(/shared-types).ZenSwarm;
export declare function isSwarmAgent( obj: any
): obj is import(/shared-types).SwarmAgent;
export declare function isSystemEvent( obj: any
): obj is import(/shared-types).SystemEvent;
export { isActivationFunction, isNeuralNetworkConfig, isNonEmptyString, isObjectArrayWithProps, isPositiveNumber, isValidNumber,
} from '@claude-zen/foundation';
export * from "./client-types";
export * from "./events-types";
export * from "./knowledge-types";
export * from "./neural-types";
export * from "./protocol-types";
export * from "./services-types";
export * from "./singletons";
export * from "./workflow-types";
export * from "./logger";
//# sourceMappingURL=index.d.ts.map
