/**
 * Neural network tokens for dependency injection.
 * Defines tokens for neural network and AI services.
 */
/**
 * @file Neural-tokens implementation.
 */
export interface INeuralNetworkTrainer {
    createNetwork(config: any): Promise<string>;
    trainNetwork(networkId: string, data: any): Promise<any>;
    evaluateNetwork(networkId: string, testData: any): Promise<any>;
    saveModel(networkId: string, path: string): Promise<void>;
    loadModel(path: string): Promise<string>;
}
export interface IDataLoader {
    loadTrainingData(source: string): Promise<any>;
    loadTestData(source: string): Promise<any>;
    preprocessData(data: any, options: any): Promise<any>;
    augmentData(data: any, options: any): Promise<any>;
}
export interface IOptimizationEngine {
    optimize(model: any, data: any, options: any): Promise<any>;
    tuneHyperparameters(model: any, data: any): Promise<any>;
    validateOptimization(model: any, data: any): Promise<any>;
}
export interface IModelStorage {
    saveModel(model: any, metadata: any): Promise<string>;
    loadModel(modelId: string): Promise<any>;
    deleteModel(modelId: string): Promise<void>;
    listModels(): Promise<any[]>;
}
export interface IMetricsCollector {
    recordMetric(name: string, value: number, metadata?: any): Promise<void>;
    getMetrics(query: any): Promise<any[]>;
    clearMetrics(filter?: any): Promise<void>;
    generateReport(timeRange: any): Promise<any>;
}
export declare const NEURAL_TOKENS: {
    readonly NetworkTrainer: import("../index.ts").DIToken<INeuralNetworkTrainer>;
    readonly DataLoader: import("../index.ts").DIToken<IDataLoader>;
    readonly OptimizationEngine: import("../index.ts").DIToken<IOptimizationEngine>;
    readonly ModelStorage: import("../index.ts").DIToken<IModelStorage>;
    readonly MetricsCollector: import("../index.ts").DIToken<IMetricsCollector>;
};
//# sourceMappingURL=neural-tokens.d.ts.map