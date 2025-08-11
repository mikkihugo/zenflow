/**
 * Performance Benchmarks Suite.
 * Comprehensive benchmarking for all optimization components.
 */
/**
 * @file Performance-benchmarks implementation.
 */
import type { DataOptimizer, NeuralOptimizer, PerformanceMetrics, SwarmOptimizer, WasmOptimizer } from '../interfaces/optimization-interfaces.ts';
export interface BenchmarkResult {
    domain: string;
    test: string;
    before: PerformanceMetrics;
    after: PerformanceMetrics;
    improvement: number;
    targetMet: boolean;
    executionTime: number;
    success: boolean;
    error?: string;
}
export interface BenchmarkSuite {
    name: string;
    description: string;
    tests: BenchmarkTest[];
    setup?: () => Promise<void>;
    teardown?: () => Promise<void>;
}
export interface BenchmarkTest {
    name: string;
    description: string;
    target: any;
    expectedImprovement: number;
    run: (optimizer: any) => Promise<BenchmarkResult>;
}
export interface SystemBenchmarkResults {
    overall: {
        totalTests: number;
        passed: number;
        failed: number;
        averageImprovement: number;
        targetsMet: number;
    };
    domains: {
        neural: BenchmarkResult[];
        swarm: BenchmarkResult[];
        data: BenchmarkResult[];
        wasm: BenchmarkResult[];
    };
    executionTime: number;
    timestamp: Date;
}
export declare class PerformanceBenchmarkSuite {
    private neuralOptimizer?;
    private swarmOptimizer?;
    private dataOptimizer?;
    private wasmOptimizer?;
    constructor(optimizers?: {
        neural?: NeuralOptimizer;
        swarm?: SwarmOptimizer;
        data?: DataOptimizer;
        wasm?: WasmOptimizer;
    });
    /**
     * Run comprehensive performance benchmarks.
     */
    runBenchmarks(): Promise<SystemBenchmarkResults>;
    /**
     * Run neural network performance benchmarks.
     */
    private runNeuralBenchmarks;
    /**
     * Run swarm coordination benchmarks.
     */
    private runSwarmBenchmarks;
    /**
     * Run data optimization benchmarks.
     */
    private runDataBenchmarks;
    /**
     * Run WASM optimization benchmarks.
     */
    private runWasmBenchmarks;
    /**
     * Run a suite of benchmarks.
     *
     * @param domain
     * @param benchmarks
     * @param optimizer
     */
    private runBenchmarkSuite;
    /**
     * Calculate overall benchmark results.
     *
     * @param results
     */
    private calculateOverallResults;
    /**
     * Calculate improvement between before and after metrics.
     *
     * @param before
     * @param after
     */
    private calculateImprovement;
    /**
     * Mock data creation methods.
     */
    private createMockNeuralNetwork;
    private createMockNetworkTrainer;
    private createMockSwarmTopology;
    private createMockCoordinationLayer;
    private createMockDatabaseQueries;
    private createMockConnections;
    private createMockCacheLayer;
    private createMockWasmModules;
    private createMockWasmFiles;
    private createMockComputeKernels;
    private createEmptyMetrics;
    /**
     * Mock measurement methods.
     *
     * @param _network
     * @param mode
     */
    private measureNeuralPerformance;
    private measureBatchPerformance;
    private measureMemoryUsage;
    private measureSwarmPerformance;
    private measureCachePerformance;
    private measureScalingPerformance;
    private measureQueryPerformance;
    private measureConnectionPerformance;
    private measureCacheHitRatio;
    private measureWasmLoadingPerformance;
    private measureWasmExecutionPerformance;
    private measureSIMDPerformance;
}
//# sourceMappingURL=performance-benchmarks.d.ts.map