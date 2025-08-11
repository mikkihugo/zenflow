/**
 * Advanced Performance Optimization System
 * Provides adaptive batch sizing, connection pooling and reuse,
 * message deduplication and caching, real-time performance monitoring.
 */
/**
 * @file Coordination system: performance-optimizer.
 */
import { EventEmitter } from 'node:events';
import type { ILogger } from '../../../core/interfaces/base-interfaces.ts';
import type { EventBusInterface as IEventBus } from '../../core/event-bus.ts';
export interface OptimizationConfig {
    batchSizing: BatchSizingConfig;
    connectionPooling: ConnectionPoolingConfig;
    caching: CachingConfig;
    monitoring: MonitoringConfig;
    adaptation: AdaptationConfig;
}
export interface BatchSizingConfig {
    initialSize: number;
    minSize: number;
    maxSize: number;
    adaptationRate: number;
    targetLatency: number;
    targetThroughput: number;
    windowSize: number;
}
export interface ConnectionPoolingConfig {
    initialSize: number;
    maxSize: number;
    minIdle: number;
    maxIdle: number;
    connectionTimeout: number;
    idleTimeout: number;
    keepAliveInterval: number;
    retryAttempts: number;
}
export interface CachingConfig {
    maxSize: number;
    ttl: number;
    refreshThreshold: number;
    compressionEnabled: boolean;
    deduplicationEnabled: boolean;
    prefetchEnabled: boolean;
}
export interface MonitoringConfig {
    metricsInterval: number;
    alertThresholds: AlertThresholds;
    historySizeLimit: number;
    anomalyDetection: boolean;
    predictionEnabled: boolean;
}
export interface AdaptationConfig {
    enabled: boolean;
    sensitivity: number;
    cooldownPeriod: number;
    maxChangesPerPeriod: number;
    learningRate: number;
    explorationRate: number;
}
export interface AlertThresholds {
    latency: number;
    throughput: number;
    errorRate: number;
    cpuUsage: number;
    memoryUsage: number;
    queueDepth: number;
    connectionUtilization: number;
}
export interface PerformanceMetrics {
    timestamp: Date;
    latency: LatencyMetrics;
    throughput: ThroughputMetrics;
    resourceUsage: ResourceMetrics;
    batchMetrics: BatchMetrics;
    connectionMetrics: ConnectionMetrics;
    cacheMetrics: CacheMetrics;
    errorMetrics: ErrorMetrics;
}
export interface LatencyMetrics {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
    average: number;
    max: number;
    min: number;
}
export interface ThroughputMetrics {
    requestsPerSecond: number;
    operationsPerSecond: number;
    bytesPerSecond: number;
    batchesPerSecond: number;
}
export interface ResourceMetrics {
    cpuUsage: number;
    memoryUsage: number;
    networkUsage: number;
    diskUsage: number;
    gcPressure: number;
    threadCount: number;
}
export interface BatchMetrics {
    currentSize: number;
    averageSize: number;
    utilizationRate: number;
    processingTime: number;
    queueDepth: number;
    adaptationCount: number;
}
export interface ConnectionMetrics {
    totalConnections: number;
    activeConnections: number;
    idleConnections: number;
    failedConnections: number;
    avgConnectionTime: number;
    poolUtilization: number;
}
export interface CacheMetrics {
    hitRate: number;
    missRate: number;
    evictionRate: number;
    size: number;
    memoryUsage: number;
    avgAccessTime: number;
}
export interface ErrorMetrics {
    totalErrors: number;
    errorRate: number;
    timeoutRate: number;
    retryRate: number;
    recoveryCounts: Record<string, number>;
}
export interface BatchProcessor<T> {
    addItem(item: T): Promise<void>;
    processBatch(): Promise<void>;
    getCurrentSize(): number;
    getQueueDepth(): number;
}
export interface BatchItem<T> {
    id: string;
    data: T;
    timestamp: Date;
    priority: number;
    retries: number;
    maxRetries: number;
}
export interface PooledConnection {
    id: string;
    connection: any;
    created: Date;
    lastUsed: Date;
    isActive: boolean;
    healthScore: number;
    useCount: number;
}
export interface ConnectionPool {
    acquire(): Promise<PooledConnection>;
    release(connection: PooledConnection): void;
    destroy(connection: PooledConnection): void;
    getStats(): ConnectionMetrics;
    healthCheck(): Promise<void>;
}
export interface CacheEntry<T> {
    key: string;
    value: T;
    timestamp: Date;
    accessCount: number;
    lastAccessed: Date;
    ttl: number;
    compressed?: boolean;
}
export interface DeduplicationEntry {
    hash: string;
    result: any;
    timestamp: Date;
    accessCount: number;
}
export interface PredictionModel {
    predict(features: number[]): number;
    train(features: number[][], labels: number[]): void;
    getAccuracy(): number;
}
export interface LoadPrediction {
    timestamp: Date;
    predictedLoad: number;
    confidence: number;
    horizon: number;
    factors: Record<string, number>;
}
/**
 * Advanced Performance Optimizer with ML-based adaptation.
 *
 * @example
 */
export declare class PerformanceOptimizer extends EventEmitter {
    private config;
    private logger;
    private eventBus;
    private batchProcessor;
    private connectionPool;
    private cache;
    private monitor;
    private predictor;
    private optimizer;
    private metrics;
    private optimizationHistory;
    private isOptimizing;
    constructor(config: OptimizationConfig, logger: ILogger, eventBus: IEventBus);
    private setupEventHandlers;
    /**
     * Process items with adaptive batching.
     *
     * @param items
     * @param processor
     */
    processBatch<T>(items: T[], processor: (batch: T[]) => Promise<void>): Promise<void>;
    /**
     * Get optimized connection from pool.
     */
    getConnection(): Promise<PooledConnection>;
    /**
     * Release connection back to pool.
     *
     * @param connection
     */
    releaseConnection(connection: PooledConnection): void;
    /**
     * Cache data with intelligent policies.
     *
     * @param key
     * @param value
     * @param options
     * @param options.ttl
     * @param options.compress
     */
    cacheData<T>(key: string, value: T, options?: {
        ttl?: number;
        compress?: boolean;
    }): Promise<void>;
    /**
     * Retrieve from cache with automatic optimization.
     *
     * @param key
     */
    getCached<T>(key: string): Promise<T | undefined>;
    /**
     * Deduplicate operations.
     *
     * @param operation
     * @param key
     */
    deduplicate<T>(operation: () => Promise<T>, key: string): Promise<T>;
    /**
     * Get current performance metrics.
     */
    getMetrics(): PerformanceMetrics;
    /**
     * Get optimization recommendations.
     */
    getOptimizationRecommendations(): Promise<OptimizationRecommendation[]>;
    /**
     * Apply optimization settings.
     *
     * @param optimizations
     */
    applyOptimizations(optimizations: OptimizationAction[]): Promise<void>;
    /**
     * Predict future load and performance.
     *
     * @param horizon
     */
    predictLoad(horizon: number): Promise<LoadPrediction>;
    /**
     * Get optimization status.
     */
    getOptimizationStatus(): {
        isOptimizing: boolean;
        lastOptimization: Date;
        optimizationCount: number;
        averageImprovement: number;
        currentEfficiency: number;
    };
    private startOptimization;
    private performOptimizationCycle;
    private applyOptimization;
    private measureOptimizationImpact;
    private getHistoricalBaseline;
    private calculateEfficiency;
    private updatePredictions;
    private handleMetricsUpdate;
    private handleAlert;
    private handleAnomaly;
    private handleBatchProcessed;
    private handleConnectionStats;
    private handleCacheStats;
    private handleLoadSpike;
    private handleResourcePressure;
    private initializeMetrics;
    shutdown(): Promise<void>;
}
interface OptimizationAction {
    type: 'batch_size' | 'connection_pool_size' | 'cache_size' | 'cache_ttl' | 'prefetch_strategy';
    parameters: Record<string, any>;
    timestamp: Date;
    impact: number;
    successful: boolean;
}
interface OptimizationRecommendation {
    type: OptimizationAction['type'];
    parameters: Record<string, any>;
    confidence: number;
    impact: number;
    reasoning: string;
}
export default PerformanceOptimizer;
//# sourceMappingURL=performance-optimizer.d.ts.map