/**
 * @fileoverview Neural Orchestrator - Production Brain Intelligence Coordinator
 *
 * The brain acts as an intelligent orchestrator that decides:
 * - Which neural operations to handle internally vs delegate to neural-ml
 * - Where to store neural data based on characteristics and access patterns
 * - How to optimize resource allocation across neural systems
 * - When to lazy-load heavy ML models based on task complexity
 *
 * Production-grade implementation with comprehensive task orchestration,
 * performance optimization, and intelligent resource management.
 */
import { Result } from '@claude-zen/foundation';
/**
 * Neural task complexity levels - enhanced classification
 */
export declare enum TaskComplexity {
    SIMPLE = "simple",// brain.js internal processing
    MODERATE = "moderate",// Enhanced brain.js with some ML
    COMPLEX = "complex",// Requires neural-ml lightweight models
    HEAVY = "heavy",// Requires neural-ml heavy models (LSTM, Transformers)
    MASSIVE = "massive"
}
/**
 * Storage strategy types - production optimized
 */
export declare enum StorageStrategy {
    MEMORY = "memory",// Fast access in brain package memory
    DATABASE = "database",// Persistent via foundation SQLite
    VECTOR = "vector",// High-dimensional via foundation LanceDB
    GRAPH = "graph",// Relationship via foundation Kuzu
    HYBRID = "hybrid",// Multiple storage backends
    DISTRIBUTED = "distributed"
}
/**
 * Neural processing engines
 */
export declare enum ProcessingEngine {
    BRAIN_JS = "brain-js",
    NEURAL_ML_LIGHT = "neural-ml-light",
    NEURAL_ML_HEAVY = "neural-ml-heavy",
    DISTRIBUTED = "distributed",
    CUSTOM = "custom"
}
/**
 * Enhanced neural task definition
 */
export interface NeuralTask {
    id: string;
    type: 'prediction' | 'classification' | 'clustering' | 'forecasting' | 'optimization' | 'pattern_recognition' | 'anomaly_detection' | 'reinforcement_learning';
    priority: 'low' | 'medium' | 'high' | 'critical';
    data: {
        input: number[] | number[][];
        context?: Record<string, unknown>;
        metadata?: {
            dimensions?: number;
            timeSeriesLength?: number;
            featureCount?: number;
            expectedOutputSize?: number;
            batchSize?: number;
            trainingRequired?: boolean;
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
        onProgress?: (progress: number) => void;
        onComplete?: (result: NeuralResult) => void;
        onError?: (error: Error) => void;
    };
}
/**
 * Enhanced neural result with orchestration metadata
 */
export interface NeuralResult {
    taskId: string;
    result: number[] | number[][] | Record<string, unknown>;
    metadata: {
        complexity: TaskComplexity;
        processor: ProcessingEngine;
        duration: number;
        accuracy?: number;
        confidence?: number;
        memoryUsed?: number;
        cacheHit?: boolean;
        storageStrategy: StorageStrategy;
        optimizations: string[];
        performance: {
            inputPreprocessingTime: number;
            computationTime: number;
            outputPostprocessingTime: number;
            totalTime: number;
        };
    };
    errors?: string[];
    warnings?: string[];
}
/**
 * Task execution statistics for optimization
 */
interface TaskStatistics {
    taskType: string;
    complexity: TaskComplexity;
    averageDuration: number;
    successRate: number;
    preferredEngine: ProcessingEngine;
    lastUpdated: Date;
}
/**
 * Production Neural Orchestrator with intelligent task management
 */
export declare class NeuralOrchestrator {
    private logger;
    private db;
    private taskQueue;
    private resultCache;
    private processingCapabilities;
    private taskStatistics;
    private activeTaskCount;
    private maxConcurrentTasks;
    constructor();
    /**
     * Initialize processing capabilities
     */
    private initializeCapabilities;
    /**
     * Process neural task with intelligent orchestration
     */
    processTask(task: NeuralTask): Promise<Result<NeuralResult, Error>>;
    /**
     * Analyze task complexity using advanced heuristics
     */
    private analyzeTaskComplexity;
    /**
     * Select optimal processing engine based on task requirements
     */
    private selectOptimalEngine;
    /**
     * Determine optimal storage strategy
     */
    private determineStorageStrategy;
    /**
     * Execute task with selected engine
     */
    private executeTask;
    /**
     * Process with Brain.js
     */
    private procesWithBrainJs;
    /**
     * Process with Neural ML Light
     */
    private processWithNeuralMlLight;
    /**
     * Process with Neural ML Heavy
     */
    private processWithNeuralMlHeavy;
    private estimateBrainJsLatency;
    private estimateBrainJsMemory;
    private estimateNeuralMlLightLatency;
    private estimateNeuralMlLightMemory;
    private estimateNeuralMlHeavyLatency;
    private estimateNeuralMlHeavyMemory;
    private checkNeuralMlAvailability;
    private preprocessInput;
    private postprocessOutput;
    private simulateBrainJsNetwork;
    private simulateNeuralMlLight;
    private simulateNeuralMlHeavy;
    private calculateAccuracy;
    private calculateConfidence;
    private estimateMemoryUsage;
    private getAppliedOptimizations;
    private checkCache;
    private cacheResult;
    private generateCacheKey;
    private loadTaskStatistics;
    private getTaskStatistics;
    private updateTaskStatistics;
    private storeResult;
    private processNextQueuedTask;
    /**
     * Get system status and metrics
     */
    getSystemStatus(): {
        activeTaskCount: number;
        queuedTaskCount: number;
        availableEngines: ProcessingEngine[];
        cacheSize: number;
        statistics: Map<string, TaskStatistics>;
    };
}
/**
 * Neural data with storage characteristics
 */
export interface NeuralData {
    id: string;
    type: '...[proper format needed];
    '  data:unknown;: any;
    characteristics: {
        size: number;
        dimensions?: number;
        accessFrequency: 'rare|occasional|frequent|realtime;;
    };
}
/**
 * Neural orchestration metrics
 */
export interface OrchestrationMetrics {
    tasksProcessed: number;
    complexityDistribution: Record<TaskComplexity, number>;
    averageLatency: Record<TaskComplexity, number>;
    cacheHitRate: number;
    neuralMlLoadCount: number;
    storageDistribution: Record<StorageStrategy, number>;
}
/**
 * Neural Orchestrator - Brain as intelligent coordinator
 */
export declare class NeuralOrchestrator {
    constructor();
    catch(error: any): void;
    if(needsLowLatency: any): void;
    const taskTypeComplexity: {
        prediction: TaskComplexity;
        classification: TaskComplexity;
        clustering: TaskComplexity;
        forecasting: TaskComplexity;
        optimization: TaskComplexity;
        pattern_recognition: TaskComplexity;
    };
}
export {};
//# sourceMappingURL=neural-orchestrator.d.ts.map