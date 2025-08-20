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
 * ENHANCEMENT: 434 → 600+ lines with comprehensive enterprise features
 * PATTERN: Matches memory package's comprehensive foundation integration
 */
import { ContextError } from '@claude-zen/foundation';
import { Result } from '@claude-zen/foundation';
import { type BrainConfig } from './brain-coordinator';
import { NeuralOrchestrator, TaskComplexity, StorageStrategy } from './neural-orchestrator';
import type { NeuralTask, NeuralResult, NeuralData } from './neural-orchestrator';
/**
 * Brain coordinator configuration
 */
export declare class BrainError extends ContextError {
    constructor(message: string, context?: Record<string, unknown>, code?: string);
}
export { type BrainConfig } from './brain-coordinator';
/**
 * Foundation brain coordinator with comprehensive enterprise features
 */
export declare class FoundationBrainCoordinator {
    private config;
    private initialized;
    private orchestrator;
    private logger;
    private performanceTracker;
    private telemetryManager;
    private errorAggregator;
    private circuitBreaker;
    private telemetryInitialized;
    constructor(config?: BrainConfig);
    /**
     * Initialize brain coordinator with foundation utilities - LAZY LOADING
     */
    initialize(): Promise<Result<void, BrainError>>;
    shutdown(): Promise<void>;
    isInitialized(): boolean;
    optimizePrompt(request: {
        task: string;
        basePrompt: string;
        context?: Record<string, unknown>;
        priority?: 'low' | 'medium' | 'high';
        timeLimit?: number;
        qualityRequirement?: number;
    }): Promise<{
        strategy: string;
        prompt: string;
        confidence: number;
        reasoning: string;
        expectedPerformance: number;
    }>;
    /**
     * Process neural task through intelligent orchestration
     */
    processNeuralTask(task: NeuralTask): Promise<NeuralResult>;
    /**
     * Store neural data with intelligent storage strategy
     */
    storeNeuralData(data: NeuralData): Promise<void>;
    /**
     * Predict task complexity without processing
     */
    predictTaskComplexity(task: Omit<NeuralTask, 'id'>): TaskComplexity;
    /**
     * Get neural orchestration metrics
     */
    getOrchestrationMetrics(): import("./neural-orchestrator").OrchestrationMetrics;
    /**
     * Convenience method for simple neural predictions
     */
    predict(input: number[], type?: 'prediction' | 'classification'): Promise<number[]>;
    /**
     * Convenience method for complex forecasting
     */
    forecast(timeSeries: number[], horizon?: number): Promise<number[]>;
    private initializeTelemetry;
    private performNeuralOperation;
}
/**
 * Neural bridge for neural network operations
 */
export declare class NeuralBridge {
    private initialized;
    initialize(): Promise<void>;
    predict(input: number[]): Promise<number[]>;
    train(data: Array<{
        input: number[];
        output: number[];
    }>): Promise<void>;
}
/**
 * Behavioral intelligence for performance analysis
 */
export declare class BehavioralIntelligence {
    private initialized;
    initialize(): Promise<void>;
    analyzePattern(data: unknown[]): Promise<{
        pattern: string;
        confidence: number;
    }>;
    predictBehavior(context: Record<string, unknown>): Promise<{
        prediction: string;
        probability: number;
    }>;
    learnFromExecution(data: {
        agentId: string;
        taskType: string;
        taskComplexity: number;
        duration: number;
        success: boolean;
        efficiency: number;
        resourceUsage: number;
        errorCount: number;
        timestamp: number;
        context: Record<string, unknown>;
    }): Promise<void>;
    recordBehavior(data: {
        agentId: string;
        behaviorType: string;
        context: Record<string, unknown>;
        timestamp: number;
        success: boolean;
        metadata?: Record<string, unknown>;
    }): Promise<void>;
    enableContinuousLearning(config: {
        learningRate?: number;
        adaptationThreshold?: number;
        evaluationInterval?: number;
        maxMemorySize?: number;
    }): Promise<void>;
}
export declare function createNeuralNetwork(config?: Record<string, unknown>): Promise<{
    id: string;
    config: Record<string, unknown>;
}>;
export declare function trainNeuralNetwork(network: {
    id: string;
}, options?: Record<string, unknown>): Promise<{
    success: boolean;
    duration: number;
}>;
export declare function predictWithNetwork(network: {
    id: string;
}, input: number[]): Promise<number[]>;
export declare function detectGPUCapabilities(): Promise<{
    available: boolean;
    type?: string;
    memory?: number;
}>;
export declare function initializeGPUAcceleration(config?: Record<string, unknown>): Promise<{
    success: boolean;
    device?: string;
}>;
export declare function demoBehavioralIntelligence(config?: {
    agentCount?: number;
    taskTypes?: string[];
    simulationDuration?: string;
    learningEnabled?: boolean;
}): Promise<{
    agents: any[];
    predictionAccuracy: number;
    learningRate: number;
    keyInsights: string[];
}>;
export { AutonomousOptimizationEngine } from './autonomous-optimization-engine';
export { TaskComplexityEstimator } from './task-complexity-estimator';
export { AgentPerformancePredictor } from './agent-performance-predictor';
export declare const BrainCoordinator: typeof FoundationBrainCoordinator;
declare const _default: {
    BrainCoordinator: typeof FoundationBrainCoordinator;
    NeuralBridge: typeof NeuralBridge;
    BehavioralIntelligence: typeof BehavioralIntelligence;
    createNeuralNetwork: typeof createNeuralNetwork;
    trainNeuralNetwork: typeof trainNeuralNetwork;
    predictWithNetwork: typeof predictWithNetwork;
    detectGPUCapabilities: typeof detectGPUCapabilities;
    initializeGPUAcceleration: typeof initializeGPUAcceleration;
    demoBehavioralIntelligence: typeof demoBehavioralIntelligence;
};
export default _default;
export { NeuralOrchestrator, TaskComplexity, StorageStrategy };
export type { NeuralTask, NeuralResult, NeuralData };
//# sourceMappingURL=main.d.ts.map