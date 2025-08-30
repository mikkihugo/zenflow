/**
 * @fileoverview Simple Rust Binding for Neural-ML
 *
 * Direct access to Rust neural capabilities without TypeScript abstractions.
 * Focuses on efficient Rust crate integration for Brain package.
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */
import type { Logger } from '@claude-zen/foundation';
export interface RustMLConfig {
    backend?: 'cpu|gpu|auto';
    threads?: number;
    memory_limit?: number;
    enableTelemetry?: boolean;
    optimizationLevel?: string;
    parallelExecution?: boolean;
    enableProfiling?: boolean;
    parallelEvaluation?: boolean;
}
export interface RustOptimizationTask {
    algorithm: string;
    parameters: Record<string, any>;
    data: Float32Array;
    target?: Float32Array;
}
export interface RustOptimizationResult {
    success: boolean;
    result: Record<string, any>;
    performance: {
        duration_ms: number;
        memory_used: number;
        iterations: number;
    };
}
/**
 * Simple Rust Neural ML Engine - Direct Rust Interface
 *
 * Thin wrapper over sophisticated Rust ML capabilities including:
 * - Bayesian optimization with Gaussian processes
 * - Multi-objective optimization (NSGA-II)
 * - Online learning with concept drift detection
 * - Pattern recognition and clustering
 * - Statistical analysis and time series forecasting
 * - GPU acceleration (CUDA, Metal, OpenCL)
 *
 * All the fancy ML is implemented in Rust for maximum performance.
 */
export declare class RustNeuralML {
    private config;
    private logger;
    private rustPath;
    private cargoProjectPath;
    constructor(config: RustMLConfig, logger: Logger);
    /**
     * Initialize Rust backend
     */
    initialize(): Promise<void>;
    /**
     * Run optimization using Rust backend
     */
    optimize(task: RustOptimizationTask): Promise<RustOptimizationResult>;
    /**
     * Get available Rust ML algorithms (implemented with battle-tested crates)
     */
    getAvailableAlgorithms(): string[];
    /**
     * Check if GPU acceleration is available
     */
    hasGpuSupport(): Promise<boolean>;
    /**
     * Get Rust backend performance stats
     */
    getPerformanceStats(): Promise<Record<string, any>>;
    private detectRustBinary;
    private buildRustIfNeeded;
    private executeRustOptimization;
    private executeRustCommand;
    private executeCommand;
}
/**
 * Factory function for creating Rust Neural ML instance
 */
export declare function createRustNeuralML(config: RustMLConfig, logger: Logger): RustNeuralML;
/**
 * Simple utility to check if Rust components are available
 */
export declare function checkRustAvailability(): Promise<boolean>;
export default RustNeuralML;
//# sourceMappingURL=rust-binding.d.ts.map