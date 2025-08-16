/**
 * Neural network tokens for dependency injection.
 * Defines tokens for neural network and AI services.
 */
/**
 * @file Neural-tokens implementation.
 */
export interface NeuralNetworkTrainer {
    createNetwork(config: unknown): Promise<string>;
    trainNetwork(networkId: string, data: unknown): Promise<unknown>;
    evaluateNetwork(networkId: string, testData: unknown): Promise<unknown>;
    saveModel(networkId: string, path: string): Promise<void>;
    loadModel(path: string): Promise<string>;
}
export interface DataLoader {
    loadTrainingData(source: string): Promise<unknown>;
    loadTestData(source: string): Promise<unknown>;
    preprocessData(data: unknown, options: unknown): Promise<unknown>;
    augmentData(data: unknown, options: unknown): Promise<unknown>;
}
export interface OptimizationEngine {
    optimize(model: unknown, data: unknown, options: unknown): Promise<unknown>;
    tuneHyperparameters(model: unknown, data: unknown): Promise<unknown>;
    validateOptimization(model: unknown, data: unknown): Promise<unknown>;
}
export interface ModelStorage {
    saveModel(model: unknown, metadata: unknown): Promise<string>;
    loadModel(modelId: string): Promise<unknown>;
    deleteModel(modelId: string): Promise<void>;
    listModels(): Promise<any[]>;
}
export interface MetricsCollector {
    recordMetric(name: string, value: number, metadata?: unknown): Promise<void>;
    getMetrics(query: unknown): Promise<any[]>;
    clearMetrics(filter?: unknown): Promise<void>;
    generateReport(timeRange: unknown): Promise<unknown>;
}
export declare const NEURAL_TOKENS: {
    readonly NetworkTrainer: import("..").DIToken<NeuralNetworkTrainer>;
    readonly DataLoader: import("..").DIToken<DataLoader>;
    readonly OptimizationEngine: import("..").DIToken<OptimizationEngine>;
    readonly ModelStorage: import("..").DIToken<ModelStorage>;
    readonly MetricsCollector: import("..").DIToken<MetricsCollector>;
};
//# sourceMappingURL=neural-tokens.d.ts.map