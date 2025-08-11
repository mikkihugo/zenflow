/**
 * @file Neural network: neural-core.
 */
export declare const PATTERN_MEMORY_CONFIG: {
    readonly convergent: {
        readonly baseMemory: 260;
        readonly poolSharing: 0.8;
        readonly lazyLoading: true;
    };
    readonly divergent: {
        readonly baseMemory: 275;
        readonly poolSharing: 0.6;
        readonly lazyLoading: true;
    };
    readonly lateral: {
        readonly baseMemory: 270;
        readonly poolSharing: 0.7;
        readonly lazyLoading: true;
    };
    readonly systems: {
        readonly baseMemory: 285;
        readonly poolSharing: 0.5;
        readonly lazyLoading: false;
    };
    readonly critical: {
        readonly baseMemory: 265;
        readonly poolSharing: 0.7;
        readonly lazyLoading: true;
    };
    readonly abstract: {
        readonly baseMemory: 280;
        readonly poolSharing: 0.6;
        readonly lazyLoading: false;
    };
    readonly attention: {
        readonly baseMemory: 290;
        readonly poolSharing: 0.4;
        readonly lazyLoading: false;
    };
    readonly lstm: {
        readonly baseMemory: 275;
        readonly poolSharing: 0.5;
        readonly lazyLoading: false;
    };
    readonly transformer: {
        readonly baseMemory: 295;
        readonly poolSharing: 0.3;
        readonly lazyLoading: false;
    };
    readonly cnn: {
        readonly baseMemory: 285;
        readonly poolSharing: 0.5;
        readonly lazyLoading: false;
    };
    readonly gru: {
        readonly baseMemory: 270;
        readonly poolSharing: 0.6;
        readonly lazyLoading: true;
    };
    readonly autoencoder: {
        readonly baseMemory: 265;
        readonly poolSharing: 0.7;
        readonly lazyLoading: true;
    };
};
export type PatternType = keyof typeof PATTERN_MEMORY_CONFIG;
export interface NeuralConfig {
    enableNeuralNetworks?: boolean;
    loadingStrategy?: 'progressive' | 'eager' | 'lazy';
}
export interface ModelMetadata {
    lastAccuracy?: string;
    lastTrained?: string;
    iterations?: number;
    learningRate?: number;
    hasSavedWeights?: boolean;
}
export interface TrainingResults {
    model: string;
    iterations: number;
    learningRate: number;
    finalAccuracy: string;
    finalLoss: string;
    timestamp: string;
    duration: number;
}
export interface PersistenceInfo {
    totalSessions: number;
    savedModels: number;
    modelDetails: Record<string, ModelMetadata>;
    totalTrainingTime: string;
    averageAccuracy: string;
    bestModel: {
        name: string;
        accuracy: string;
    };
    sessionContinuity?: {
        loadedModels: number;
        sessionStart: string;
        memorySize: string;
    } | null;
}
export interface PatternData {
    [category: string]: string[];
}
export interface WeightsExport {
    metadata: {
        version: string;
        exported: string;
        model: string;
        format: string;
    };
    models: Record<string, {
        layers: number;
        parameters: number;
        weights: number[];
        biases: number[];
        performance: {
            accuracy: string;
            loss: string;
        };
    }>;
}
/**
 * Neural CLI System.
 * Provides comprehensive neural network management capabilities.
 *
 * @example
 */
export declare class NeuralCLI {
    private ruvSwarm;
    /**
     * Initialize the neural system.
     *
     * @param config
     * @param _config
     */
    initialize(_config?: NeuralConfig): Promise<any>;
    /**
     * Get neural system status.
     *
     * @param _args
     */
    status(_args?: string[]): Promise<void>;
    /**
     * Train neural models.
     *
     * @param args
     */
    train(args?: string[]): Promise<void>;
    /**
     * Analyze neural patterns.
     *
     * @param args
     */
    patterns(args?: string[]): Promise<void>;
    /**
     * Export neural weights.
     *
     * @param args
     */
    export(args?: string[]): Promise<void>;
    /**
     * Calculate convergence rate from training results.
     *
     * @param trainingResults
     */
    calculateConvergenceRate(trainingResults: Array<{
        loss: number;
        accuracy: number;
    }>): string;
    /**
     * Calculate variance of values.
     *
     * @param values
     */
    private calculateVariance;
    /**
     * Calculate trend (positive = improving).
     *
     * @param values.
     * @param values
     */
    private calculateTrend;
    /**
     * Load persistence information from filesystem.
     */
    private loadPersistenceInfo;
    /**
     * Get memory usage for specific pattern type.
     *
     * @param patternType
     */
    private getPatternMemoryUsage;
    /**
     * Get pattern definitions for analysis.
     */
    private getPatternDefinitions;
    /**
     * Display all patterns.
     *
     * @param patterns
     */
    private displayAllPatterns;
    /**
     * Display specific pattern.
     *
     * @param patternType
     * @param patterns
     */
    private displaySpecificPattern;
    /**
     * Parse command line argument.
     *
     * @param args
     * @param flag
     */
    private getArg;
}
export declare const neuralCLI: NeuralCLI;
export default NeuralCLI;
//# sourceMappingURL=neural-core.d.ts.map