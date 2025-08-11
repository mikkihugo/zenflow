/**
 * @file Coordination system: performance-benchmarks.
 */
interface Recommendation {
    category: string;
    priority: string;
    message: string;
    action: string;
}
declare class PerformanceBenchmarks {
    results: Map<string, any>;
    baselineResults: Map<string, any>;
    ruvSwarm: any;
    wasmLoader: any;
    claudeFlow: any;
    constructor();
    /**
     * Initialize benchmarking suite.
     */
    initialize(): Promise<void>;
    /**
     * Run comprehensive performance benchmarks.
     */
    runFullBenchmarkSuite(): Promise<any>;
    /**
     * Benchmark SIMD operations performance.
     */
    benchmarkSIMDOperations(): Promise<any>;
    /**
     * Benchmark WASM loading performance.
     */
    benchmarkWASMLoading(): Promise<any>;
    /**
     * Benchmark memory management performance.
     */
    benchmarkMemoryManagement(): Promise<any>;
    /**
     * Benchmark neural network performance.
     */
    benchmarkNeuralNetworks(): Promise<any>;
    /**
     * Benchmark Claude Code Flow coordination.
     */
    benchmarkClaudeFlowCoordination(): Promise<any>;
    /**
     * Benchmark parallel execution patterns.
     */
    benchmarkParallelExecution(): Promise<any>;
    /**
     * Test cross-browser compatibility.
     */
    benchmarkBrowserCompatibility(): Promise<any>;
    /**
     * Get environment information.
     */
    getEnvironmentInfo(): {
        userAgent: string;
        platform: string;
        language: string;
        hardwareConcurrency: string | number;
        memory: any;
        connection: any;
        timestamp: number;
        timezone: string;
    };
    /**
     * Calculate overall performance score.
     *
     * @param benchmarks
     */
    calculateOverallScore(benchmarks: any): number;
    /**
     * Simulate neural network inference.
     *
     * @param input
     * @param layers
     */
    simulateNeuralInference(input: number[], layers: number[]): number[];
    /**
     * Simulate activation function.
     *
     * @param vector
     * @param activation
     */
    simulateActivation(vector: number[], activation: string): number[];
    /**
     * Simulate async task for parallel testing.
     *
     * @param duration
     * @param taskId
     */
    simulateAsyncTask(duration: number, taskId: string): Promise<{
        taskId: string;
        duration: number;
        completed: boolean;
    }>;
    /**
     * Generate comprehensive performance report.
     *
     * @param results
     */
    generatePerformanceReport(results: any): {
        summary: {
            overallScore: any;
            grade: string;
            timestamp: any;
            environment: any;
        };
        detailed: any;
        recommendations: Recommendation[];
        comparison: {
            available: boolean;
            message: string;
        };
        exportData: {
            csv: string;
            json: string;
        };
    };
    /**
     * Get performance grade.
     *
     * @param score
     */
    getPerformanceGrade(score: number): "A+" | "A" | "B+" | "B" | "C" | "F";
    /**
     * Generate performance recommendations.
     *
     * @param benchmarks
     */
    generateRecommendations(benchmarks: any): Recommendation[];
    /**
     * Compare with baseline performance.
     *
     * @param _results
     */
    compareWithBaseline(_results: any): {
        available: boolean;
        message: string;
    };
    /**
     * Generate CSV data for export.
     *
     * @param results
     */
    generateCSVData(results: any): string;
}
export { PerformanceBenchmarks };
export default PerformanceBenchmarks;
//# sourceMappingURL=performance-benchmarks.d.ts.map