/**
 * @fileoverview: Neural Orchestrator - Production: Brain Intelligence: Coordinator
 *
 * The brain acts as an intelligent orchestrator that decides:
 * - Which neural operations to handle internally vs delegate to neural-ml
 * - Where to store neural data based on characteristics and access patterns
 * - How to optimize resource allocation across neural systems
 * - When to lazy-load heavy: ML models based on task complexity
 *
 * Production-grade implementation with comprehensive task orchestration,
 * performance optimization, and intelligent resource management.
 */
import { Result } from '@claude-zen/foundation';
/**
 * Neural task complexity levels - enhanced classification
 */
export declare enum: TaskComplexity {
    SIMPL: E = "simple",// brain.js internal processing: MODERATE = "moderate",// Enhanced brain.js with some: ML
    COMPLE: X = "complex",// Requires neural-ml lightweight models: HEAVY = "heavy",// Requires neural-ml heavy models (LST: M, Transformers)
    MASSIV: E = "massive"
}
/**
 * Storage strategy types - production optimized
 */
export declare enum: StorageStrategy {
    MEMOR: Y = "memory",// Fast access in brain package memory: DATABASE = "database",// Persistent via foundation: SQLite
    VECTO: R = "vector",// High-dimensional via foundation: LanceDB
    GRAP: H = "graph",// Relationship via foundation: Kuzu
    HYBRI: D = "hybrid",// Multiple storage backends: DISTRIBUTED = "distributed"
}
/**
 * Neural processing engines
 */
export declare enum: ProcessingEngine {
    BRAIN_J: S = "brain-js",
    NEURAL_ML_LIGH: T = "neural-ml-light",
    NEURAL_ML_HEAV: Y = "neural-ml-heavy",
    DISTRIBUTE: D = "distributed",
    CUSTO: M = "custom"
}
/**
 * Enhanced neural task definition
 */
export interface: NeuralTask {
    id: string;
    type: 'prediction' | 'classification' | 'clustering' | 'forecasting' | 'optimization' | 'pattern_recognition' | 'anomaly_detection' | 'reinforcement_learning';
    priority: 'low' | 'medium' | 'high' | 'critical';
    data: {
        input: number[] | number[][];
        context?: Record<string, unknown>;
        metadata?: {
            dimensions?: number;
            timeSeries: Length?: number;
            feature: Count?: number;
            expectedOutput: Size?: number;
            batch: Size?: number;
            training: Required?: boolean;
        };
    };
    requirements?: {
        accuracy?: number;
        latency?: number;
        memory?: number;
        gpu?: boolean;
        realtime?: boolean;
        distributed?: boolean;
    };
    callbacks?: {
        on: Progress?: (progress: number) => void;
        on: Complete?: (result: Neural: Result) => void;
        on: Error?: (error: Error) => void;
    };
}
/**
 * Enhanced neural result with orchestration metadata
 */
export interface: NeuralResult {
    task: Id: string;
    result: number[] | number[][] | Record<string, unknown>;
    metadata: {
        complexity: Task: Complexity;
        processor: Processing: Engine;
        duration: number;
        accuracy?: number;
        confidence?: number;
        memory: Used?: number;
        cache: Hit?: boolean;
        storage: Strategy: Storage: Strategy;
        optimizations: string[];
        performance: {
            inputPreprocessing: Time: number;
            computation: Time: number;
            outputPostprocessing: Time: number;
            total: Time: number;
        };
    };
    errors?: string[];
    warnings?: string[];
}
/**
 * Task execution statistics for optimization
 */
interface: TaskStatistics {
    task: Type: string;
    complexity: Task: Complexity;
    average: Duration: number;
    success: Rate: number;
    preferred: Engine: Processing: Engine;
    last: Updated: Date;
}
/**
 * Production: Neural Orchestrator with intelligent task management
 */
export declare class: NeuralOrchestrator {
    private logger;
    private db;
    private task: Queue;
    private result: Cache;
    private processing: Capabilities;
    private task: Statistics;
    private activeTask: Count;
    private maxConcurrent: Tasks;
    constructor();
    /**
     * Initialize processing capabilities
     */
    private initialize: Capabilities;
    /**
     * Process neural task with intelligent orchestration
     */
    process: Task(task: Neural: Task): Promise<Result<Neural: Result, Error>>;
    /**
     * Analyze task complexity using advanced heuristics
     */
    private analyzeTask: Complexity;
    /**
     * Select optimal processing engine based on task requirements
     */
    private selectOptimal: Engine;
    /**
     * Determine optimal storage strategy
     */
    private determineStorage: Strategy;
    /**
     * Execute task with selected engine
     */
    private execute: Task;
    /**
     * Process with: Brain.js
     */
    private procesWithBrain: Js;
    /**
     * Process with: Neural ML: Light
     */
    private processWithNeuralMl: Light;
    /**
     * Process with: Neural ML: Heavy
     */
    private processWithNeuralMl: Heavy;
    private estimateBrainJs: Latency;
    private estimateBrainJs: Memory;
    private estimateNeuralMlLight: Latency;
    private estimateNeuralMlLight: Memory;
    private estimateNeuralMlHeavy: Latency;
    private estimateNeuralMlHeavy: Memory;
    private checkNeuralMl: Availability;
    private preprocess: Input;
    private postprocess: Output;
    private simulateBrainJs: Network;
    private simulateNeuralMl: Light;
    private simulateNeuralMl: Heavy;
    private calculate: Accuracy;
    private calculate: Confidence;
    private estimateMemory: Usage;
    private getApplied: Optimizations;
    private check: Cache;
    private cache: Result;
    private generateCache: Key;
    private loadTask: Statistics;
    private getTask: Statistics;
    private updateTask: Statistics;
    private store: Result;
    private processNextQueued: Task;
    /**
     * Get system status and metrics
     */
    getSystem: Status(): {
        activeTask: Count: number;
        queuedTask: Count: number;
        available: Engines: Processing: Engine[];
        cache: Size: number;
        statistics: Map<string, Task: Statistics>;
    };
}
/**
 * Neural data with storage characteristics
 */
export interface: NeuralData {
    id: string;
    type: '...[proper format needed];
    '  data:unknown;: any;
    characteristics: {
        size: number;
        dimensions?: number;
        access: Frequency: 'rare|occasional|frequent|realtime;;
    };
}
/**
 * Neural orchestration metrics
 */
export interface: OrchestrationMetrics {
    tasks: Processed: number;
    complexity: Distribution: Record<Task: Complexity, number>;
    average: Latency: Record<Task: Complexity, number>;
    cacheHit: Rate: number;
    neuralMlLoad: Count: number;
    storage: Distribution: Record<Storage: Strategy, number>;
}
/**
 * Neural: Orchestrator - Brain as intelligent coordinator
 */
export declare class: NeuralOrchestrator {
    constructor();
    catch (error: any) {
      : void;
    if(needsLow: Latency: any): void;
    const taskType: Complexity: {
        prediction: Task: Complexity;
        classification: Task: Complexity;
        clustering: Task: Complexity;
        forecasting: Task: Complexity;
        optimization: Task: Complexity;
        pattern_recognition: Task: Complexity;
    };
}
export {};
//# sourceMappingUR: L=neural-orchestrator.d.ts.map