/**
 * Memory Optimization Strategy Types
 *
 * Type definitions for cache eviction, optimization engines, lifecycle management,
 * and performance tuning strategies.
 */
export interface CacheEvictionConfig {
    enabled: boolean;
    algorithm: 'lru|lfu|fifo|ttl|random|adaptive';
    maxSize: number;
    maxMemory: number;
    ttl: number;
    cleanupInterval: number;
    evictionThreshold: number;
    batchSize: number;
    preservePriority: boolean;
}
export interface CacheEntry {
    key: string;
    value: unknown;
    size: number;
    accessCount: number;
    frequency: number;
    lastAccessed: number;
    createdAt: number;
    expiresAt?: number;
    priority: number;
    metadata: Record<string, unknown>;
}
export type EvictionReason = 'size_limit' | 'memory_limit' | 'ttl_expired' | 'lru_eviction' | 'lfu_eviction' | 'manual_eviction' | 'priority_eviction';
export interface OptimizationConfig {
    enabled: boolean;
    mode: 'conservative|balanced|aggressive';
    targets: {
        memoryUsage: number;
        responseTime: number;
        throughput: number;
        cacheHitRate: number;
    };
    strategies: {
        compression: boolean;
        deduplication: boolean;
        prefetching: boolean;
        background_cleanup: boolean;
        adaptive_sizing: boolean;
    };
    monitoring: {
        interval: number;
        enabled: boolean;
        alertThresholds: {
            memoryUsage: number;
            responseTime: number;
            errorRate: number;
        };
    };
}
export interface OptimizationMetrics {
    memoryUsage: {
        current: number;
        peak: number;
        average: number;
        limit: number;
    };
    performance: {
        averageResponseTime: number;
        p95ResponseTime: number;
        throughput: number;
        cacheHitRate: number;
        errorRate: number;
    };
    operations: {
        reads: number;
        writes: number;
        evictions: number;
        compressions: number;
        decompressions: number;
    };
    health: {
        score: number;
        status: 'optimal|good|warning|critical';
        issues: string[];
        recommendations: string[];
    };
}
export interface LifecycleConfig {
    enabled: boolean;
    stages: {
        hot: {
            duration: number;
            maxSize: number;
            accessThreshold: number;
        };
        warm: {
            duration: number;
            maxSize: number;
            accessThreshold: number;
        };
        cold: {
            duration: number;
            maxSize: number;
            accessThreshold: number;
        };
        archive: {
            enabled: boolean;
            duration: number;
            compressionLevel: number;
        };
    };
    migration: {
        interval: number;
        batchSize: number;
        autoPromote: boolean;
        autoDemote: boolean;
    };
    cleanup: {
        interval: number;
        expiredDataThreshold: number;
        unusedDataThreshold: number;
    };
}
export type LifecycleStage = 'hot|warm|cold|archive|expired';
export interface LifecycleEntry {
    key: string;
    stage: LifecycleStage;
    createdAt: number;
    lastAccessed: number;
    accessCount: number;
    accessFrequency: number;
    size: number;
    migrationHistory: {
        from: LifecycleStage;
        to: LifecycleStage;
        timestamp: number;
        reason: string;
    }[];
    metadata: {
        priority: number;
        tags: string[];
        source: string;
        [key: string]: unknown;
    };
}
export interface PerformanceConfig {
    enabled: boolean;
    tuning: {
        autoTune: boolean;
        interval: number;
        adaptationRate: number;
        stabilityThreshold: number;
    };
    targets: {
        responseTime: number;
        throughput: number;
        memoryEfficiency: number;
        cacheEfficiency: number;
    };
    actions: {
        adjustCacheSize: boolean;
        modifyEvictionPolicy: boolean;
        tunePrefetching: boolean;
        optimizeCompression: boolean;
        balanceLoad: boolean;
    };
    constraints: {
        maxMemoryIncrease: number;
        maxCacheSizeIncrease: number;
        maxTuningFrequency: number;
    };
}
export type TuningAction = 'increase_cache_size' | 'decrease_cache_size' | 'change_eviction_policy' | 'enable_compression' | 'disable_compression' | 'adjust_prefetching' | 'rebalance_load' | 'optimize_ttl' | 'increase_cleanup_frequency' | 'decrease_cleanup_frequency';
export interface TuningRecommendation {
    action: TuningAction;
    priority: 'low' | 'medium' | 'high' | 'critical';
    impact: {
        performance: number;
        memory: number;
        complexity: number;
    };
    description: string;
    parameters: Record<string, unknown>;
    estimatedImprovement: {
        responseTime: number;
        throughput: number;
        memoryUsage: number;
    };
}
export interface StrategyMetrics {
    cacheEviction: {
        totalEvictions: number;
        evictionsByReason: Record<EvictionReason, number>;
        averageEvictionTime: number;
        memoryReclaimed: number;
    };
    optimization: {
        optimizationCycles: number;
        improvementsApplied: number;
        performanceGain: number;
        memoryReduction: number;
    };
    lifecycle: {
        promotions: number;
        demotions: number;
        migrations: number;
        cleanupOperations: number;
    };
    performance: {
        tuningActions: number;
        performanceImprovements: number;
        regressions: number;
        stabilityScore: number;
    };
}
//# sourceMappingURL=types.d.ts.map