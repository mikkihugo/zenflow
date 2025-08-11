/**
 * Neural Network Performance Optimizer.
 * Optimizes neural network training, inference, and memory usage.
 */
/**
 * @file Neural network: neural-optimizer.
 */
import type { NeuralOptimizer } from '../interfaces/optimization-interfaces.ts';
export interface NeuralOptimizationConfig {
    enableGPUAcceleration: boolean;
    preferredBatchSize: number;
    memoryThreshold: number;
    trainingOptimizations: string[];
    inferenceOptimizations: string[];
}
export interface TrainingOptimizationResult {
    originalTime: number;
    optimizedTime: number;
    speedImprovement: number;
    memoryReduction: number;
    accuracyMaintained: boolean;
}
export interface InferenceOptimizationResult {
    latencyReduction: number;
    throughputIncrease: number;
    batchProcessingEnabled: boolean;
    wasmAcceleration: boolean;
}
export interface OptimizationResult {
    success: boolean;
    improvement: number;
    beforeMetrics: any;
    afterMetrics: any;
    executionTime: number;
    error?: string;
}
export interface NeuralNetwork {
    id: string;
    layers: number[];
    memory?: number;
}
export interface NetworkTrainer {
    batchSize: number;
    network: NeuralNetwork;
}
export interface BatchConfig {
    batchSize: number;
    parallelism: number;
    memoryLimit: number;
    processingMode: 'sequential' | 'parallel' | 'adaptive';
}
export interface ComputeUnit {
    type: 'GPU' | 'CPU' | 'TPU';
    memory: number;
    cores?: number;
    name?: string;
}
export interface AccelerationResult {
    accelerationType: 'GPU' | 'WASM' | 'SIMD';
    speedImprovement: number;
    resourceUtilization: number;
    fallbackStrategy: string;
}
export interface MemoryOptimization {
    memoryReduction: number;
    compressionRatio: number;
    garbageCollectionImprovement: number;
    poolingStrategy: string;
}
export declare class NeuralNetworkOptimizer implements NeuralOptimizer {
    private config;
    private optimizationCache;
    private accelerationSupport;
    constructor(config?: Partial<NeuralOptimizationConfig>);
    /**
     * Optimize neural network training speed.
     *
     * @param network
     */
    optimizeTrainingSpeed(network: NeuralNetwork): Promise<OptimizationResult>;
    /**
     * Implement optimized batch processing.
     *
     * @param trainer
     */
    implementBatchProcessing(trainer: NetworkTrainer): Promise<BatchConfig>;
    /**
     * Enable GPU acceleration where possible.
     *
     * @param computeUnits
     */
    enableGPUAcceleration(computeUnits: ComputeUnit[]): Promise<AccelerationResult>;
    /**
     * Optimize memory usage for neural networks.
     *
     * @param networks
     */
    optimizeMemoryUsage(networks: NeuralNetwork[]): Promise<MemoryOptimization>;
    /**
     * Initialize acceleration support detection.
     */
    private initializeAccelerationSupport;
    /**
     * Optimize network architecture for performance.
     *
     * @param network
     */
    private optimizeNetworkArchitecture;
    /**
     * Enable mixed precision training.
     *
     * @param network
     */
    private enableMixedPrecisionTraining;
    /**
     * Optimize data loading pipeline.
     *
     * @param _network
     */
    private optimizeDataPipeline;
    /**
     * Enable gradient accumulation for large effective batch sizes.
     *
     * @param network
     */
    private enableGradientAccumulation;
    /**
     * Optimize learning rate schedule.
     *
     * @param network
     */
    private optimizeLearningRateSchedule;
    /**
     * Enable WASM acceleration as fallback.
     */
    private enableWASMAcceleration;
    /**
     * Calculate optimal batch size based on network complexity and memory.
     *
     * @param complexity
     * @param availableMemory
     * @param currentBatchSize
     */
    private calculateOptimalBatchSize;
    /**
     * Calculate optimal parallelism level.
     *
     * @param batchSize
     */
    private calculateOptimalParallelism;
    /**
     * Determine optimal processing mode.
     *
     * @param batchSize
     * @param parallelism
     */
    private determineProcessingMode;
    /**
     * Measure network performance.
     *
     * @param _network
     * @param mode
     */
    private measureNetworkPerformance;
    /**
     * Calculate training improvement.
     *
     * @param before
     * @param after
     */
    private calculateTrainingImprovement;
    /**
     * Helper methods (mock implementations).
     *
     * @param network.
     * @param network
     */
    private calculateNetworkComplexity;
    private getAvailableMemory;
    private getCurrentMemoryUsage;
    private supportsMixedPrecision;
    private detectWebGLSupport;
    private detectWASMSIMDSupport;
    private detectMixedPrecisionSupport;
    private selectOptimalGPU;
    private applyBatchConfiguration;
    private initializeGPUAcceleration;
    private benchmarkGPUPerformance;
    private measureGPUUtilization;
    private initializeWASMAcceleration;
    private enableWASMSIMD;
    private implementWeightSharing;
    private enableGradientCheckpointing;
    private optimizeTensorStorage;
    private compressNetworkWeights;
    private enableMemoryPooling;
    private measureGCImprovement;
    private identifyInefficientLayers;
    private optimizeLayer;
    private addSkipConnections;
    private optimizeActivationFunctions;
    private layerSupportsMixedPrecision;
    private convertLayerToFP16;
    private enableAutomaticLossScaling;
    private enableDataPrefetching;
    private enableParallelDataLoading;
    private optimizeDataTransformations;
    private enableDataCaching;
    private calculateOptimalAccumulationSteps;
    private setGradientAccumulationSteps;
    private implementCosineAnnealingSchedule;
    private enableLearningRateWarmup;
}
//# sourceMappingURL=neural-optimizer.d.ts.map