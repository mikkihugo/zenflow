/**
 * @fileoverview Neural Orchestrator - Brain as Intelligent Neural Coordinator
 *
 * The brain acts as an intelligent orchestrator that decides:
 * - Which neural operations to handle internally vs delegate to neural-ml
 * - Where to store neural data based on characteristics and access patterns
 * - How to optimize resource allocation across neural systems
 * - When to lazy-load heavy ML models based on task complexity
 */
/**
 * Neural task complexity levels
 */
export declare enum TaskComplexity {
    SIMPLE = "simple",// brain.js internal processing'
    MODERATE = "moderate",// Enhanced brain.js with some ML'
    COMPLEX = "complex",// Requires neural-ml lightweight models'
    HEAVY = "heavy"
}
/**
 * Storage strategy types
 */
export declare enum StorageStrategy {
    MEMORY = "memory",// Fast access in brain package memory'
    DATABASE = "database",// Persistent via foundation SQLite'
    VECTOR = "vector",// High-dimensional via foundation LanceDB'
    GRAPH = "graph",// Relationship via foundation Kuzu'
    HYBRID = "hybrid"
}
/**
 * Neural task definition
 */
export interface NeuralTask {
    id: string;
    type: 'prediction|classification|clustering|forecasting|optimization|pattern_recognition;;
    data: {
        input: number[] | number[][];
        context?: Record<string, unknown>;
        metadata?: {
            dimensions?: number;
            timeSeriesLength?: number;
            featureCount?: number;
            expectedOutputSize?: number;
        };
    };
    requirements?: {
        accuracy?: number;
        latency?: number;
        memory?: number;
        gpu?: boolean;
    };
}
/**
 * Neural result with orchestration metadata
 */
export interface NeuralResult {
    taskId: string;
    result: number[] | number[][] | Record<string, unknown>;
    metadata: {
        complexity: TaskComplexity;
        processor: 'brain-js' | 'neural-ml-light' | 'neural-ml-heavy;;
        duration: number;
        confidence?: number;
        storageStrategy: StorageStrategy;
        memoryUsed?: number;
    };
}
/**
 * Neural data with storage characteristics
 */
export interface NeuralData {
    id: string;
    type: 'weights|training|patterns|predictions|models;;
    data: unknown;
    characteristics: {
        size: number;
        dimensions?: number;
        accessFrequency: 'rare|occasional|frequent|realtime;;
        persistenceLevel: 'temporary' | 'session' | 'permanent';
        relationships?: string[];
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
    /**
     * Main orchestration method - analyzes and routes neural tasks
     */
    processNeuralTask(task: NeuralTask): Promise<NeuralResult>;
    /**
     * Process simple tasks with internal brain.js
     */
    private processSimpleTask;
    /**
     * Process complex tasks by lazy-loading neural-ml
     */
    private processComplexTask;
}
//# sourceMappingURL=neural-orchestrator.d.ts.map