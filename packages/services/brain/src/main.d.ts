/**
* @fileoverview Brain Package - Enterprise Foundation Integration
*
* Professional neural coordination system leveraging comprehensive @claude-zen/foundation utilities.
* Transformed to match memory package pattern with battle-tested enterprise architecture.
*
* Foundation Integration:
* - Result pattern for type-safe error handling
* - Circuit breakers for resilience
* - Performance tracking and telemetry
* - Error aggregation and comprehensive logging
* - Dependency injection with TSyringe
* - Structured validation and type safety
*
* The brain acts as an intelligent orchestrator that:
* - Routes neural tasks based on complexity analysis
* - Lazy loads neural-ml for heavy ML operations
* - Orchestrates storage strategy across multiple backends
* - Learns from usage patterns to optimize decisions
*
* ENHANCEMENT:434 → 600+ lines with comprehensive enterprise features
* PATTERN:Matches memory package's comprehensive foundation integration') */
import { ContextError, type Result } from '@claude-zen/foundation';
import type { BrainConfig } from './brain-coordinator';
import type { NeuralData, NeuralResult, NeuralTask } from './neural-orchestrator';
import { NeuralOrchestrator, StorageStrategy, TaskComplexity } from './neural-orchestrator';
/**
* Brain coordinator configuration
*/
export declare class BrainError extends ContextError {
constructor(message: string, context?: Record<string, unknown>, code?: string);
}
export type { BrainConfig } from './brain-coordinator';
/**
* Foundation brain coordinator with comprehensive enterprise features
*/
export declare class FoundationBrainCoordinator {
private brainConfig;
private initialized;
private logger;
private errorAggregator;
private neuralDataStore;
private configStore;
private knowledgeGraph;
private eventBus;
constructor(config?: BrainConfig);
/**
* Initialize brain coordinator with foundation utilities - LAZY LOADING
*/
initialize(): Promise<Result<void, BrainError>>;
const result: any;
}
/**
* Neural bridge for neural network operations
*/
export declare class NeuralBridge {
private initialized;
initialize(): Promise<void>;
}
export declare function createNeuralNetwork(config?: Record<string, unknown>): Promise<{
id: string;
config: Record<string, unknown>;
}>;
export declare function predictWithNetwork(network: {
id: string;
}, input: number[]): Promise<number[]>;
export { AgentPerformancePredictor } from './agent-performance-predictor';
export { AutonomousOptimizationEngine } from './autonomous-optimization-engine';
export { TaskComplexityEstimator } from './task-complexity-estimator';
export declare const BrainCoordinator: typeof FoundationBrainCoordinator;
declare const _default: {
BrainCoordinator: typeof FoundationBrainCoordinator;
NeuralBridge: typeof NeuralBridge;
BehavioralIntelligence: any;
createNeuralNetwork: typeof createNeuralNetwork;
trainNeuralNetwork: any;
predictWithNetwork: typeof predictWithNetwork;
detectGPUCapabilities: any;
initializeGPUAcceleration: any;
demoBehavioralIntelligence: any;
};
export default _default;
export { NeuralOrchestrator, TaskComplexity, StorageStrategy };
export type { NeuralTask, NeuralResult, NeuralData };
//# sourceMappingURL=main.d.ts.map