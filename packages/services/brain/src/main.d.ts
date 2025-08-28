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
import { ContextError, type Result, TypedEventBase} from '@claude-zen/foundation';
import type { BrainConfig} from './brain-coordinator';
import type { NeuralData, NeuralResult, NeuralTask} from './neural-orchestrator';
import { NeuralOrchestrator, StorageStrategy, TaskComplexity} from './neural-orchestrator';
/**
 * Brain coordinator configuration
 */
export declare class BrainError extends ContextError {
    constructor(message:string, context?:Record<string, unknown>, code?:string);
}
export type { BrainConfig} from './brain-coordinator';
/**
 * Foundation brain coordinator with comprehensive enterprise features
 */
export declare class FoundationBrainCoordinator extends TypedEventBase {
    private brainConfig;
    private initialized;
    private logger;
    private errorAggregator;
    constructor(config?:BrainConfig);
    /**
     * Initialize brain coordinator with foundation utilities - LAZY LOADING
     */
    initialize():Promise<Result<void, BrainError>>;
    /**
     * Process neural task through intelligent orchestration
     */
    processNeuralTask(task:NeuralTask): Promise<NeuralResult>;
    /**
     * Predict task complexity without processing
     */
    predictTaskComplexity(task:Omit<NeuralTask, 'id'>):TaskComplexity;
    /**
     * Get neural orchestration metrics
     */
    getOrchestrationMetrics():any;
    /**
     * Convenience method for simple neural predictions
     */
    predict(input:number[], type:"prediction" | "classification" | undefined, :any): Promise<number[]>;
    const result:NeuralResult;
}
/**
 * Neural bridge for neural network operations
 */
export declare class NeuralBridge {
    private initialized;
    initialize():Promise<void>;
    predict(input:number[]): Promise<number[]>;
    train(data:Array<{
        input:number[];
        output:number[];
}>):Promise<void>;
    predictBehavior(context:Record<string, unknown>):Promise<{
        prediction:string;
        probability:number;
}>;
    learnFromExecution(data:{
        agentId:string;
        taskType:string;
        taskComplexity:number;
        duration:number;
        success:boolean;
        efficiency:number;
        resourceUsage:number;
        errorCount:number;
        timestamp:number;
        context:Record<string, unknown>;
}):Promise<void>;
    enableContinuousLearning(config:{
        learningRate?:number;
        adaptationThreshold?:number;
        evaluationInterval?:number;
        maxMemorySize?:number;
}):Promise<void>;
}
export declare function createNeuralNetwork(config?:Record<string, unknown>):Promise<{
    id:string;
    config:Record<string, unknown>;
}>;
export declare function predictWithNetwork(network:{
    id:string;
}, input:number[]): Promise<number[]>;
export { AgentPerformancePredictor} from './agent-performance-predictor';
export { AutonomousOptimizationEngine} from './autonomous-optimization-engine';
export { TaskComplexityEstimator} from './task-complexity-estimator';
export declare const BrainCoordinator:typeof FoundationBrainCoordinator;
declare const _default:{
    BrainCoordinator:typeof FoundationBrainCoordinator;
    NeuralBridge:typeof NeuralBridge;
    BehavioralIntelligence:any;
    createNeuralNetwork:typeof createNeuralNetwork;
    trainNeuralNetwork:any;
    predictWithNetwork:typeof predictWithNetwork;
    detectGPUCapabilities:any;
    initializeGPUAcceleration:any;
    demoBehavioralIntelligence:any;
};
export default _default;
export { NeuralOrchestrator, TaskComplexity, StorageStrategy};
export type { NeuralTask, NeuralResult, NeuralData};
//# sourceMappingURL=main.d.ts.map