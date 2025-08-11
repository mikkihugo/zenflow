/**
 * @file Neural network: neural.
 */
declare const PATTERN_MEMORY_CONFIG: {
    convergent: {
        baseMemory: number;
        poolSharing: number;
        lazyLoading: boolean;
    };
    divergent: {
        baseMemory: number;
        poolSharing: number;
        lazyLoading: boolean;
    };
    lateral: {
        baseMemory: number;
        poolSharing: number;
        lazyLoading: boolean;
    };
    systems: {
        baseMemory: number;
        poolSharing: number;
        lazyLoading: boolean;
    };
    critical: {
        baseMemory: number;
        poolSharing: number;
        lazyLoading: boolean;
    };
    abstract: {
        baseMemory: number;
        poolSharing: number;
        lazyLoading: boolean;
    };
    attention: {
        baseMemory: number;
        poolSharing: number;
        lazyLoading: boolean;
    };
    lstm: {
        baseMemory: number;
        poolSharing: number;
        lazyLoading: boolean;
    };
    transformer: {
        baseMemory: number;
        poolSharing: number;
        lazyLoading: boolean;
    };
    cnn: {
        baseMemory: number;
        poolSharing: number;
        lazyLoading: boolean;
    };
    gru: {
        baseMemory: number;
        poolSharing: number;
        lazyLoading: boolean;
    };
    autoencoder: {
        baseMemory: number;
        poolSharing: number;
        lazyLoading: boolean;
    };
};
declare class NeuralCLI {
    private ruvSwarm;
    constructor();
    initialize(): Promise<any>;
    status(_args: string[]): Promise<void>;
    train(args: string[]): Promise<void>;
    patterns(args: string[]): Promise<void>;
    export(args: string[]): Promise<void>;
    calculateConvergenceRate(trainingResults: Array<{
        loss: number;
        accuracy: number;
    }>): "improving" | "insufficient_data" | "converged" | "converging" | "needs_adjustment";
    calculateVariance(values: number[]): number;
    calculateTrend(values: number[]): number;
    loadPersistenceInfo(): Promise<{
        totalSessions: number;
        savedModels: number;
        modelDetails: {};
        totalTrainingTime: string;
        averageAccuracy: string;
        bestModel: {
            name: string;
            accuracy: number;
        };
        sessionContinuity: {
            loadedModels: number;
            sessionStart: string;
            memorySize: string;
        } | null;
    } | {
        totalSessions: number;
        savedModels: number;
        modelDetails: {};
        totalTrainingTime: string;
        averageAccuracy: string;
        bestModel: {
            name: string;
            accuracy: string;
        };
        sessionContinuity: null;
    }>;
    getPatternMemoryUsage(patternType: string): Promise<number>;
    getArg(args: string[], flag: string): string | null | undefined;
}
declare const neuralCLI: NeuralCLI;
export { neuralCLI, NeuralCLI, PATTERN_MEMORY_CONFIG };
//# sourceMappingURL=neural.d.ts.map