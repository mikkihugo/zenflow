/**
 * @fileoverview Neural-ML Rust Bridge
 *
 * TypeScript bridge to the high-performance Rust neural-ml implementation.
 * Provides machine-adaptive optimization with automatic hardware detection
 * for Apple Silicon, NVIDIA CUDA, Intel AVX, ARM NEON, and CPU fallback.
 *
 * Features:
 * - Machine-adaptive backend selection (Metal, CUDA, AVX-512, NEON)
 * - Zero-copy memory access between TypeScript and Rust
 * - Foundation error handling patterns (Result types)
 * - Integration with existing neural coordination
 * - Professional Google TypeScript naming conventions
 *
 * @example Basic Usage
 * '''typescript'
 * const bridge = container.get(NeuralMLBridge);
 * await bridge.initialize();
 *
 * const optimizerId = await bridge.createAdaptiveOptimizer('high-perf', {
 *   target: 'auto', *   precision:'f32') *});
 *
 * const result = await bridge.matrixMultiply(optimizerId, matrixA, matrixB, 512, 512, 512);
 * '
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */
import type { Logger } from '@claude-zen/foundation';
type Result<T, E = Error> = {
  isOk(): boolean;
  isErr(): boolean;
  value?: T;
  error?: E;
  mapErr(fn: (e: E) => any): any;
};
declare class ContextError extends Error {
  context?: any | undefined;
  constructor(message: string, context?: any | undefined);
}
/**
 * Hardware backend detected by neural-ml
 */
export interface OptimizationBackend {
  /** Backend type */
  readonly type:
    | 'apple-silicon'
    | 'nvidia-cuda'
    | 'intel-amd'
    | 'arm-neon'
    | 'cpu-optimized';
  /** Available acceleration features */
  readonly features: {
    readonly metalAvailable?: boolean;
    readonly accelerateAvailable?: boolean;
    readonly neonAvailable?: boolean;
    readonly cudaVersion?: string;
    readonly computeCapability?: string;
    readonly memoryGb?: number;
    readonly avx512?: boolean;
    readonly avx2?: boolean;
    readonly openclAvailable?: boolean;
    readonly neonFp16?: boolean;
    readonly gpuAvailable?: boolean;
    readonly threads?: number;
    readonly simdLevel?: string;
  };
  /** Performance characteristics */
  readonly performance: {
    readonly estimatedThroughput: number;
    readonly memoryBandwidth: number;
    readonly computeUnits: number;
  };
}
/**
 * Configuration for neural-ml optimization
 */
export interface NeuralMLConfig {
  /** Target hardware (auto-detect by default) */
  readonly target?: 'auto' | 'apple-silicon' | 'cuda' | 'cpu';
  /** Precision mode */
  readonly precision?: 'f32' | 'f16' | 'mixed';
  /** Enable performance monitoring */
  readonly enableProfiling?: boolean;
  /** Memory optimization level */
  readonly memoryOptimization?: 'none' | 'basic' | 'aggressive';
  /** Maximum memory usage (bytes) */
  readonly maxMemoryUsage?: number;
  /** Performance threshold for backend switching */
  readonly performanceThreshold?: number;
  /** Enable adaptive learning */
  readonly adaptiveLearning?: boolean;
  /** Enable comprehensive telemetry and monitoring */
  readonly enableTelemetry?: boolean;
  /** Circuit breaker configuration for GPU operations */
  readonly circuitBreakerOptions?: any;
  /** Operation timeout in milliseconds */
  readonly operationTimeoutMs?: number;
  /** Retry configuration for failed operations */
  readonly retryAttempts?: number;
}
/**
 * Optimizer configuration
 */
export interface OptimizerConfig {
  /** Optimizer name/ID */
  readonly name: string;
  /** Target backend preference */
  readonly target?: 'auto' | 'gpu' | 'cpu' | 'simd';
  /** Precision preference */
  readonly precision?: 'f32' | 'f16';
  /** Enable caching of operations */
  readonly enableCaching?: boolean;
  /** Adaptive threshold settings */
  readonly adaptiveThresholds?: {
    readonly smallOperation: number;
    readonly mediumOperation: number;
    readonly largeOperation: number;
  };
}
/**
 * Matrix multiplication result
 */
export interface MatrixMultiplyResult {
  /** Result matrix as Float32Array */
  readonly result: Float32Array;
  /** Processing time in microseconds */
  readonly processingTime: number;
  /** Backend used for computation */
  readonly backendUsed: string;
  /** Performance metrics */
  readonly metrics: {
    readonly throughput: number;
    readonly efficiency: number;
    readonly memoryUsage: number;
  };
}
/**
 * Vector operation result
 */
export interface VectorOperationResult {
  /** Result vector as Float32Array */
  readonly result: Float32Array;
  /** Processing time in microseconds */
  readonly processingTime: number;
  /** SIMD level used */
  readonly simdLevel: string;
}
/**
 * Neural activation types supported by neural-ml
 */
export type ActivationType = 'relu|sigmoid|tanh|gelu';
/**
 * Neural activation result
 */
export interface NeuralActivationResult {
  /** Activated values */
  readonly result: Float32Array;
  /** Processing time in microseconds */
  readonly processingTime: number;
  /** Activation function used */
  readonly activationType: ActivationType;
}
/**
 * Performance statistics from adaptive optimizer
 */
export interface OptimizerPerformanceStats {
  /** Total operations performed */
  readonly operationsCount: number;
  /** Successful operations */
  readonly successCount: number;
  /** Average throughput (ops/sec) */
  readonly avgThroughput: number;
  /** Backend usage distribution */
  readonly backendUsage: Record<string, number>;
  /** Memory efficiency */
  readonly memoryEfficiency: number;
}
/**
 * Optimizer instance for neural-ml operations
 */
export interface NeuralMLOptimizerInstance {
  /** Unique optimizer identifier */
  readonly id: string;
  /** Optimizer configuration */
  readonly config: OptimizerConfig;
  /** Current backend information */
  readonly backend: OptimizationBackend;
  /** Performance statistics */
  readonly stats: OptimizerPerformanceStats;
  /** Instance metadata */
  readonly metadata: {
    readonly created: string;
    readonly updated: string;
    readonly operationsCount: number;
    readonly totalProcessingTime: number;
  };
}
/**
 * High-Performance Neural Machine Learning Engine
 *
 * Provides high-performance machine-adaptive optimization using Rust
 * backend with automatic hardware detection and acceleration. Optimized for:
 * - Maximum performance with zero-copy memory access
 * - Automatic hardware detection and optimization
 * - Production workloads requiring extreme performance
 * - Integration with existing foundation coordination system
 *
 * @example Creating and using an adaptive optimizer
 * '''typescript'
 * const engine = container.get(NeuralMLEngine);
 * await engine.initialize();
 *
 * const result = await engine.createAdaptiveOptimizer('gpu-optimizer', {
 *   target: 'auto', *   precision: 'f32', *   enableCaching:true
 *});
 *
 * if (result.isOk()) {
 *   const matrixA = new Float32Array([1, 2, 3, 4]);  // 2x2 matrix
 *   const matrixB = new Float32Array([5, 6, 7, 8]);  // 2x2 matrix
 *
 *   const multiplyResult = await engine.matrixMultiply(
 *     result.value, matrixA, matrixB, 2, 2, 2
 *   );
 *}
 * '
 */
export declare class NeuralMLEngine {
  private foundationLogger;
  private optimizers;
  private config;
  private initialized;
  private dbAccess;
  private detectedBackend;
  private mlMonitor;
  private perfTracker;
  private systemMonitor;
  private gpuCircuitBreaker;
  private cpuCircuitBreaker;
  constructor(foundationLogger: Logger, config?: NeuralMLConfig);
  /**
   * Initialize the neural-ml engine and detect optimal hardware backend
   */
  initialize(): Promise<Result<OptimizationBackend, ContextError>>;
  /**
   * Create a new adaptive optimizer
   *
   * @param id - Unique optimizer identifier
   * @param config - Optimizer configuration
   * @returns Result containing the optimizer ID or error
   */
  createAdaptiveOptimizer(
    id: string,
    config: Omit<OptimizerConfig, 'name'>
  ): Promise<Result<string, ContextError>>;
  /**
   * Perform matrix multiplication with adaptive optimization and comprehensive monitoring
   *
   * @param optimizerId - ID of the optimizer to use
   * @param a - Matrix A as Float32Array
   * @param b - Matrix B as Float32Array
   * @param m - Number of rows in A
   * @param n - Number of columns in B
   * @param k - Number of columns in A / rows in B
   * @returns Result containing matrix multiplication result or error
   */
  matrixMultiply(
    optimizerId: string,
    a: Float32Array,
    b: Float32Array,
    m: number,
    n: number,
    k: number
  ): Promise<Result<MatrixMultiplyResult, ContextError>>;
  /**
   * Perform vector addition with SIMD optimization and comprehensive monitoring
   *
   * @param optimizerId - ID of the optimizer to use
   * @param a - Vector A as Float32Array
   * @param b - Vector B as Float32Array
   * @returns Result containing vector addition result or error
   */
  vectorAdd(
    optimizerId: string,
    a: Float32Array,
    b: Float32Array
  ): Promise<Result<VectorOperationResult, ContextError>>;
  /**
   * Perform neural activation functions
   *
   * @param optimizerId - ID of the optimizer to use
   * @param input - Input values as Float32Array
   * @param activationType - Type of activation function
   * @returns Result containing activation result or error
   */
  neuralActivation(
    optimizerId: string,
    input: Float32Array,
    activationType: ActivationType
  ): Promise<Result<NeuralActivationResult, ContextError>>;
  /**
   * Get optimizer performance statistics
   *
   * @param optimizerId - ID of the optimizer
   * @returns Result containing performance stats or error
   */
  getOptimizerStats(
    optimizerId: string
  ): Result<OptimizerPerformanceStats, ContextError>;
  /**
   * Get optimization recommendations
   *
   * @param optimizerId - ID of the optimizer
   * @returns Array of optimization recommendations
   */
  getOptimizationRecommendations(
    optimizerId: string
  ): Promise<Result<string[], ContextError>>;
  /**
   * List all optimizers
   *
   * @returns Array of optimizer instances
   */
  listOptimizers(): NeuralMLOptimizerInstance[];
  /**
   * Remove an optimizer
   *
   * @param optimizerId - ID of the optimizer to remove
   * @returns Success status
   */
  removeOptimizer(optimizerId: string): Promise<Result<boolean, ContextError>>;
  /**
   * Get comprehensive neural-ml engine statistics with Foundation telemetry
   *
   * @returns Detailed statistics about the engine, optimizers, and system performance
   */
  getStats(): {
    totalOptimizers: number;
    activeOptimizers: number;
    detectedBackend: OptimizationBackend | null;
    totalOperations: number;
    avgThroughput: number;
    memoryUsage: number;
    systemHealth: {
      circuitBreakerStatus: {
        gpu: string;
        cpu: string;
      };
      telemetryEnabled: boolean;
      monitoringActive: boolean;
    };
    performance: {
      totalProcessingTime: number;
      avgOperationTime: number;
      successRate: number;
      backendDistribution: Record<string, number>;
    };
  };
  /**
   * Shutdown the neural-ml engine with comprehensive cleanup
   */
  shutdown(): Promise<Result<void, ContextError>>;
  /**
   * Get comprehensive system health status
   */
  getSystemHealth(): {
    status: 'healthy' | 'degraded' | 'critical';
    details: {
      initialization: boolean;
      backend: OptimizationBackend | null;
      circuitBreakers: {
        gpu: {
          state: string;
          failures: number;
        };
        cpu: {
          state: string;
          failures: number;
        };
      };
      monitoring: {
        telemetryActive: boolean;
        systemMonitorRunning: boolean;
        dbConnected: boolean;
      };
      performance: {
        avgThroughput: number;
        successRate: number;
        memoryUsage: number;
      };
    };
    recommendations: string[];
  };
  /**
   * Load the neural-ml Rust module (placeholder for actual implementation)
   */
  private loadNeuralMLModule;
  /**
   * Detect optimization backend using Rust implementation
   */
  private detectOptimizationBackend;
  /**
   * Update optimizer performance statistics with comprehensive telemetry
   */
  private updateOptimizerStats;
  /**
   * Initialize database schema for neural-ml optimizers
   */
  private initializeDatabaseSchema;
  /**
   * Estimate memory usage of all optimizers
   */
  private estimateMemoryUsage;
}
export declare function createAdaptiveOptimizer(
  id: string,
  config: Omit<OptimizerConfig, 'name'>,
  engineConfig?: NeuralMLConfig
): Promise<Result<string, ContextError>>;
export declare function matrixMultiplyAdaptive(
  engine: NeuralMLEngine,
  optimizerId: string,
  a: Float32Array,
  b: Float32Array,
  m: number,
  n: number,
  k: number
): Promise<Result<MatrixMultiplyResult, ContextError>>;
export declare function vectorAddAdaptive(
  engine: NeuralMLEngine,
  optimizerId: string,
  a: Float32Array,
  b: Float32Array
): Promise<Result<VectorOperationResult, ContextError>>;
export {};
//# sourceMappingURL=main.d.ts.map
