/**
 * Memory Optimization for 32GB Machines
 *
 * Intelligent memory management and allocation strategies for
 * maximizing parallel stream execution on 32GB systems.
 */
export interface MemoryAllocationStrategy {
    portfolioStreamMB: number;
    programStreamMB: number;
    swarmStreamMB: number;
    systemReserveMB: number;
    cacheBufferMB: number;
    totalCapacityGB: number;
}
export interface ParallelStreamConfig {
    portfolio: number;
    program: number;
    swarm: number;
    totalStreams: number;
    memoryPerStream: {
        portfolio: number;
        program: number;
        swarm: number;
    };
}
/**
 * Base configuration for 8GB machines (conservative starting point)
 */
export declare const memory8GBConfig: MemoryAllocationStrategy;
/**
 * Optimized configuration for 32GB machines (maximum performance)
 */
export declare const memory32GBConfig: MemoryAllocationStrategy;
/**
 * Default configuration (starts conservative, adapts automatically)
 */
export declare const defaultMemoryConfig: MemoryAllocationStrategy;
/**
 * Auto-detect available memory and calculate optimal configuration
 */
export declare function detectAvailableMemory(): number;
/**
 * Calculate optimal parallel stream configuration with adaptive scaling
 */
export declare function calculateOptimalStreams(availableMemoryGB?: number): ParallelStreamConfig;
/**
 * Performance monitoring for adaptive scaling
 */
export interface PerformanceMetrics {
    memoryUtilization: number;
    cpuUtilization: number;
    activeStreams: number;
    throughput: number;
    avgResponseTime: number;
    errorRate: number;
    timestamp: number;
}
/**
 * Adaptive Memory Optimizer with Real-Time Performance Scaling
 */
export declare class AdaptiveMemoryOptimizer {
    private config;
    private activeStreams;
    private performanceHistory;
    private autoScaleEnabled;
    private lastOptimization;
    private optimizationInterval;
    constructor(config?: MemoryAllocationStrategy);
    /**
     * Check if we can allocate a new stream of the given type
     */
    canAllocateStream(type: 'portfolio' | 'program' | 'swarm'): boolean;
    /**
     * Allocate a new stream and track memory usage
     */
    allocateStream(type: 'portfolio' | 'program' | 'swarm', streamId: string): boolean;
    /**
     * Deallocate a stream and free memory
     */
    deallocateStream(type: 'portfolio' | 'program' | 'swarm', streamId: string): void;
    /**
     * Get current memory usage statistics
     */
    getMemoryStats(): {
        allocated: {
            portfolio: number;
            program: number;
            swarm: number;
        };
        available: {
            portfolio: number;
            program: number;
            swarm: number;
        };
        utilization: number;
    };
    private getMaxStreamsForType;
    /**
     * Record performance metrics for adaptive optimization
     */
    recordPerformance(metrics: Partial<PerformanceMetrics>): void;
    /**
     * ULTRA-CONSERVATIVE automatic optimization - NEVER EVER cause OOM
     */
    private performAutoOptimization;
    /**
     * Adjust system capacity based on performance
     */
    private adjustCapacity;
    /**
     * Get current performance trends
     */
    getPerformanceTrends(): {
        memoryTrend: 'increasing' | 'decreasing' | 'stable';
        cpuTrend: 'increasing' | 'decreasing' | 'stable';
        throughputTrend: 'increasing' | 'decreasing' | 'stable';
        recommendation: string;
    };
    /**
     * Optimize memory allocation with performance awareness
     */
    optimizeAllocation(): {
        recommendations: string[];
        canOptimize: boolean;
        potentialGains: number;
        currentPerformance: unknown;
    };
    /**
     * Enable/disable auto-scaling
     */
    setAutoScale(enabled: boolean): void;
    /**
     * Get real-time system performance summary
     */
    getPerformanceSummary(): string;
}
/**
 * Create adaptive memory optimizer instance (auto-detects system capacity)
 */
export declare function createAdaptiveOptimizer(): AdaptiveMemoryOptimizer;
/**
 * Create memory optimizer instance for specific configuration
 */
export declare function createMemoryOptimizer(config?: MemoryAllocationStrategy): AdaptiveMemoryOptimizer;
/**
 * Validate memory configuration for system requirements
 */
export declare function validateMemoryConfig(config: ParallelStreamConfig): {
    valid: boolean;
    warnings: string[];
    totalMemoryMB: number;
};
declare const _default: {
    memory8GBConfig: MemoryAllocationStrategy;
    memory32GBConfig: MemoryAllocationStrategy;
    defaultMemoryConfig: MemoryAllocationStrategy;
    calculateOptimalStreams: typeof calculateOptimalStreams;
    detectAvailableMemory: typeof detectAvailableMemory;
    AdaptiveMemoryOptimizer: typeof AdaptiveMemoryOptimizer;
    createAdaptiveOptimizer: typeof createAdaptiveOptimizer;
    createMemoryOptimizer: typeof createMemoryOptimizer;
    validateMemoryConfig: typeof validateMemoryConfig;
};
export default _default;
//# sourceMappingURL=memory-optimization.d.ts.map