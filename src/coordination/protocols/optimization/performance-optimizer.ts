/**
 * Advanced Performance Optimization System
 * Provides adaptive batch sizing, connection pooling and reuse,
 * message deduplication and caching, real-time performance monitoring.
 */
/**
 * @file Coordination system: performance-optimizer.
 */

import { EventEmitter } from 'node:events';
import type { EventBusInterface as IEventBus } from '../../core/event-bus';
import type { ILogger } from '../../../core/interfaces/base-interfaces';
import { LRUCache } from 'lru-cache';

// Core optimization types
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

// Performance metrics types
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

// Batch processing types
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

// Connection pooling types
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

// Caching types
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

// Prediction types.
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
export class PerformanceOptimizer extends EventEmitter {
  private batchProcessor: AdaptiveBatchProcessor;
  private connectionPool: AdvancedConnectionPool;
  private cache: IntelligentCache;
  private monitor: RealTimeMonitor;
  private predictor: PerformancePredictor;
  private optimizer: AdaptationEngine;
  private metrics: PerformanceMetrics;
  private optimizationHistory: OptimizationAction[] = [];
  private isOptimizing = false;

  constructor(
    private config: OptimizationConfig,
    private logger: ILogger,
    private eventBus: IEventBus
  ) {
    super();

    this.batchProcessor = new AdaptiveBatchProcessor(config?.batchSizing, logger);
    this.connectionPool = new AdvancedConnectionPool(config?.connectionPooling, logger);
    this.cache = new IntelligentCache(config?.caching, logger);
    this.monitor = new RealTimeMonitor(config?.monitoring, logger, eventBus);
    this.predictor = new PerformancePredictor(logger);
    this.optimizer = new AdaptationEngine(config?.adaptation, logger);

    this.metrics = this.initializeMetrics();
    this.setupEventHandlers();
    this.startOptimization();
  }

  private setupEventHandlers(): void {
    this.monitor.on('metrics:updated', (data) => {
      this.handleMetricsUpdate(data);
    });

    this.monitor.on('alert:triggered', (data) => {
      this.handleAlert(data);
    });

    this.monitor.on('anomaly:detected', (data) => {
      this.handleAnomaly(data);
    });

    this.batchProcessor.on('batch:processed', (data) => {
      this.handleBatchProcessed(data);
    });

    this.connectionPool.on('pool:stats', (data) => {
      this.handleConnectionStats(data);
    });

    this.cache.on('cache:stats', (data) => {
      this.handleCacheStats(data);
    });

    this.eventBus.on('load:spike', (data) => {
      this.handleLoadSpike(data);
    });

    this.eventBus.on('resource:pressure', (data) => {
      this.handleResourcePressure(data);
    });
  }

  /**
   * Process items with adaptive batching.
   *
   * @param items
   * @param processor
   */
  async processBatch<T>(items: T[], processor: (batch: T[]) => Promise<void>): Promise<void> {
    return await this.batchProcessor.process(items, processor);
  }

  /**
   * Get optimized connection from pool.
   */
  async getConnection(): Promise<PooledConnection> {
    return await this.connectionPool.acquire();
  }

  /**
   * Release connection back to pool.
   *
   * @param connection
   */
  releaseConnection(connection: PooledConnection): void {
    this.connectionPool.release(connection);
  }

  /**
   * Cache data with intelligent policies.
   *
   * @param key
   * @param value
   * @param options
   * @param options.ttl
   * @param options.compress
   */
  async cacheData<T>(
    key: string,
    value: T,
    options?: { ttl?: number; compress?: boolean }
  ): Promise<void> {
    await this.cache.set(key, value, options);
  }

  /**
   * Retrieve from cache with automatic optimization.
   *
   * @param key
   */
  async getCached<T>(key: string): Promise<T | undefined> {
    return await this.cache.get<T>(key);
  }

  /**
   * Deduplicate operations.
   *
   * @param operation
   * @param key
   */
  async deduplicate<T>(operation: () => Promise<T>, key: string): Promise<T> {
    return await this.cache.deduplicate(operation, key);
  }

  /**
   * Get current performance metrics.
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get optimization recommendations.
   */
  async getOptimizationRecommendations(): Promise<OptimizationRecommendation[]> {
    return await this.optimizer.getRecommendations(this.metrics, this.optimizationHistory);
  }

  /**
   * Apply optimization settings.
   *
   * @param optimizations
   */
  async applyOptimizations(optimizations: OptimizationAction[]): Promise<void> {
    for (const optimization of optimizations) {
      await this.applyOptimization(optimization);
    }
  }

  /**
   * Predict future load and performance.
   *
   * @param horizon
   */
  async predictLoad(horizon: number): Promise<LoadPrediction> {
    return await this.predictor.predictLoad(this.metrics, horizon);
  }

  /**
   * Get optimization status.
   */
  getOptimizationStatus(): {
    isOptimizing: boolean;
    lastOptimization: Date;
    optimizationCount: number;
    averageImprovement: number;
    currentEfficiency: number;
  } {
    const lastItem = this.optimizationHistory[this.optimizationHistory.length - 1];
    const lastOptimization =
      this.optimizationHistory.length > 0 && lastItem ? lastItem?.timestamp : new Date(0);

    const improvements = this.optimizationHistory
      .filter((action) => action.impact > 0)
      .map((action) => action.impact);

    const averageImprovement =
      improvements.length > 0
        ? improvements.reduce((sum, impact) => sum + impact, 0) / improvements.length
        : 0;

    return {
      isOptimizing: this.isOptimizing,
      lastOptimization,
      optimizationCount: this.optimizationHistory.length,
      averageImprovement,
      currentEfficiency: this.calculateEfficiency(),
    };
  }

  private startOptimization(): void {
    // Start monitoring
    this.monitor.start();

    // Start connection pool
    this.connectionPool.start();

    // Start optimization loop
    setInterval(async () => {
      if (this.config.adaptation.enabled && !this.isOptimizing) {
        await this.performOptimizationCycle();
      }
    }, 10000); // Every 10 seconds

    // Start prediction updates
    setInterval(async () => {
      await this.updatePredictions();
    }, 30000); // Every 30 seconds
  }

  private async performOptimizationCycle(): Promise<void> {
    this.isOptimizing = true;

    try {
      // Get recommendations
      const recommendations = await this.getOptimizationRecommendations();

      // Filter and prioritize recommendations
      const applicableRecommendations = recommendations
        .filter((rec) => rec.confidence > 0.7 && rec.impact > 0.1)
        .sort((a, b) => b.impact * b.confidence - a.impact * a.confidence);

      // Apply top recommendations
      const toApply = applicableRecommendations.slice(
        0,
        this.config.adaptation.maxChangesPerPeriod
      );

      for (const recommendation of toApply) {
        const action: OptimizationAction = {
          type: recommendation.type,
          parameters: recommendation.parameters,
          timestamp: new Date(),
          impact: 0, // Will be measured after application
          successful: false,
        };

        try {
          await this.applyOptimization(action);
          action.successful = true;

          // Measure impact after a delay
          setTimeout(async () => {
            action.impact = await this.measureOptimizationImpact(action);
            this.optimizationHistory.push(action);

            if (this.optimizationHistory.length > 1000) {
              this.optimizationHistory.shift();
            }
          }, 5000);

          this.logger.info('Optimization applied', {
            type: action.type,
            parameters: action.parameters,
          });
        } catch (error) {
          this.logger.error('Optimization failed', {
            type: action.type,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    } catch (error) {
      this.logger.error('Optimization cycle failed', { error });
    } finally {
      this.isOptimizing = false;
    }
  }

  private async applyOptimization(action: OptimizationAction): Promise<void> {
    switch (action.type) {
      case 'batch_size':
        await this.batchProcessor.setBatchSize(action.parameters['size']);
        break;

      case 'connection_pool_size':
        await this.connectionPool.resize(action.parameters['size']);
        break;

      case 'cache_size':
        await this.cache.resize(action.parameters['size']);
        break;

      case 'cache_ttl':
        await this.cache.setDefaultTTL(action.parameters['ttl']);
        break;

      case 'prefetch_strategy':
        await this.cache.setPrefetchStrategy(action.parameters['strategy']);
        break;

      default:
        throw new Error(`Unknown optimization type: ${action.type}`);
    }

    this.emit('optimization:applied', action);
  }

  private async measureOptimizationImpact(_action: OptimizationAction): Promise<number> {
    // Measure performance improvement after optimization
    const currentMetrics = this.metrics;
    const baselineMetrics = this.getHistoricalBaseline();

    if (!baselineMetrics) return 0;

    // Calculate improvement based on key metrics
    const latencyImprovement =
      (baselineMetrics.latency.average - currentMetrics?.latency?.average) /
      baselineMetrics.latency.average;
    const throughputImprovement =
      (currentMetrics?.throughput?.requestsPerSecond -
        baselineMetrics.throughput.requestsPerSecond) /
      baselineMetrics.throughput.requestsPerSecond;
    const resourceImprovement =
      (baselineMetrics.resourceUsage.cpuUsage - currentMetrics?.resourceUsage?.cpuUsage) /
      baselineMetrics.resourceUsage.cpuUsage;

    // Weighted average of improvements
    const impact =
      latencyImprovement * 0.4 + throughputImprovement * 0.4 + resourceImprovement * 0.2;

    return Math.max(-1, Math.min(1, impact)); // Clamp to [-1, 1]
  }

  private getHistoricalBaseline(): PerformanceMetrics | null {
    // Get baseline metrics from before recent optimizations
    return this.monitor.getHistoricalMetrics(300000); // 5 minutes ago
  }

  private calculateEfficiency(): number {
    const metrics = this.metrics;

    // Efficiency score based on multiple factors
    const latencyScore = Math.max(0, 1 - metrics.latency.average / 1000); // Normalize to 1s max
    const throughputScore = Math.min(1, metrics.throughput.requestsPerSecond / 1000); // Normalize to 1000 RPS max
    const resourceScore = Math.max(0, 1 - metrics.resourceUsage.cpuUsage);
    const cacheScore = metrics.cacheMetrics.hitRate;

    return latencyScore * 0.3 + throughputScore * 0.3 + resourceScore * 0.2 + cacheScore * 0.2;
  }

  private async updatePredictions(): Promise<void> {
    try {
      const predictions = await this.predictor.updatePredictions(this.metrics);
      this.emit('predictions:updated', predictions);
    } catch (error) {
      this.logger.error('Failed to update predictions', { error });
    }
  }

  // Event handlers
  private handleMetricsUpdate(data: any): void {
    this.metrics = { ...this.metrics, ...data?.metrics };
    this.emit('metrics:updated', this.metrics);
  }

  private handleAlert(data: any): void {
    this.logger.warn('Performance alert triggered', data);
    this.emit('alert:performance', data);

    // Trigger immediate optimization if critical
    if (data.severity === 'critical' && this.config.adaptation.enabled) {
      this.performOptimizationCycle().catch((error) => {
        this.logger.error('Emergency optimization failed', { error });
      });
    }
  }

  private handleAnomaly(data: any): void {
    this.logger.warn('Performance anomaly detected', data);
    this.emit('anomaly:detected', data);
  }

  private handleBatchProcessed(data: any): void {
    this.metrics.batchMetrics = { ...this.metrics.batchMetrics, ...data };
  }

  private handleConnectionStats(data: any): void {
    this.metrics.connectionMetrics = { ...this.metrics.connectionMetrics, ...data };
  }

  private handleCacheStats(data: any): void {
    this.metrics.cacheMetrics = { ...this.metrics.cacheMetrics, ...data };
  }

  private handleLoadSpike(data: any): void {
    this.logger.info('Load spike detected, applying optimizations', data);

    // Apply immediate optimizations for load spikes
    this.applyOptimizations([
      {
        type: 'batch_size',
        parameters: {
          size: Math.min(
            this.config.batchSizing.maxSize,
            this.batchProcessor.getCurrentSize() * 1.5
          ),
        },
        timestamp: new Date(),
        impact: 0,
        successful: false,
      },
      {
        type: 'connection_pool_size',
        parameters: {
          size: Math.min(
            this.config.connectionPooling.maxSize,
            this.connectionPool.getStats().totalConnections * 1.2
          ),
        },
        timestamp: new Date(),
        impact: 0,
        successful: false,
      },
    ]).catch((error) => {
      this.logger.error('Load spike optimization failed', { error });
    });
  }

  private handleResourcePressure(data: any): void {
    this.logger.warn('Resource pressure detected, reducing load', data);

    // Apply resource-conserving optimizations
    this.applyOptimizations([
      {
        type: 'batch_size',
        parameters: {
          size: Math.max(
            this.config.batchSizing.minSize,
            this.batchProcessor.getCurrentSize() * 0.8
          ),
        },
        timestamp: new Date(),
        impact: 0,
        successful: false,
      },
      {
        type: 'cache_size',
        parameters: { size: Math.floor(this.cache.getStats().size * 0.9) },
        timestamp: new Date(),
        impact: 0,
        successful: false,
      },
    ]).catch((error) => {
      this.logger.error('Resource pressure optimization failed', { error });
    });
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      timestamp: new Date(),
      latency: {
        p50: 0,
        p90: 0,
        p95: 0,
        p99: 0,
        average: 0,
        max: 0,
        min: 0,
      },
      throughput: {
        requestsPerSecond: 0,
        operationsPerSecond: 0,
        bytesPerSecond: 0,
        batchesPerSecond: 0,
      },
      resourceUsage: {
        cpuUsage: 0,
        memoryUsage: 0,
        networkUsage: 0,
        diskUsage: 0,
        gcPressure: 0,
        threadCount: 0,
      },
      batchMetrics: {
        currentSize: this.config.batchSizing.initialSize,
        averageSize: this.config.batchSizing.initialSize,
        utilizationRate: 0,
        processingTime: 0,
        queueDepth: 0,
        adaptationCount: 0,
      },
      connectionMetrics: {
        totalConnections: 0,
        activeConnections: 0,
        idleConnections: 0,
        failedConnections: 0,
        avgConnectionTime: 0,
        poolUtilization: 0,
      },
      cacheMetrics: {
        hitRate: 0,
        missRate: 0,
        evictionRate: 0,
        size: 0,
        memoryUsage: 0,
        avgAccessTime: 0,
      },
      errorMetrics: {
        totalErrors: 0,
        errorRate: 0,
        timeoutRate: 0,
        retryRate: 0,
        recoveryCounts: {},
      },
    };
  }

  async shutdown(): Promise<void> {
    await this.batchProcessor.shutdown();
    await this.connectionPool.shutdown();
    await this.cache.shutdown();
    await this.monitor.shutdown();

    this.emit('shutdown');
    this.logger.info('Performance optimizer shutdown');
  }
}

// Supporting types and interfaces
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

// Supporting classes (implementations would be detailed)
class AdaptiveBatchProcessor extends EventEmitter {
  private currentBatchSize: number;
  private items: any[] = [];
  private processing = false;
  private queueDepth = 0;
  private processingTimes: number[] = [];

  constructor(
    private config: BatchSizingConfig,
    private logger: ILogger
  ) {
    super();
    this.currentBatchSize = config?.initialSize;
  }

  async process<T>(items: T[], processor: (batch: T[]) => Promise<void>): Promise<void> {
    this.items.push(...items);
    this.queueDepth = this.items.length;

    if (!this.processing && this.items.length >= this.currentBatchSize) {
      await this.processBatch(processor);
    }
  }

  private async processBatch<T>(processor: (batch: T[]) => Promise<void>): Promise<void> {
    if (this.processing || this.items.length === 0) return;

    this.processing = true;
    const startTime = Date.now();

    try {
      const batch = this.items.splice(0, this.currentBatchSize);
      await processor(batch);

      const processingTime = Date.now() - startTime;
      this.processingTimes.push(processingTime);
      if (this.processingTimes.length > 100) {
        this.processingTimes.shift();
      }

      this.emit('batch:processed', {
        size: batch.length,
        processingTime,
        queueDepth: this.items.length,
      });

      // Adapt batch size based on performance
      await this.adaptBatchSize(processingTime);
    } catch (error) {
      this.logger.error('Batch processing failed', { error });
    } finally {
      this.processing = false;
      this.queueDepth = this.items.length;

      // Process next batch if items remain
      if (this.items.length > 0) {
        setTimeout(() => this.processBatch(processor), 0);
      }
    }
  }

  private async adaptBatchSize(_processingTime: number): Promise<void> {
    const avgProcessingTime =
      this.processingTimes.reduce((sum, time) => sum + time, 0) / this.processingTimes.length;

    if (
      avgProcessingTime > this.config.targetLatency &&
      this.currentBatchSize > this.config.minSize
    ) {
      // Reduce batch size to improve latency
      this.currentBatchSize = Math.max(
        this.config.minSize,
        Math.floor(this.currentBatchSize * (1 - this.config.adaptationRate))
      );
    } else if (
      avgProcessingTime < this.config.targetLatency * 0.8 &&
      this.currentBatchSize < this.config.maxSize
    ) {
      // Increase batch size to improve throughput
      this.currentBatchSize = Math.min(
        this.config.maxSize,
        Math.ceil(this.currentBatchSize * (1 + this.config.adaptationRate))
      );
    }
  }

  async setBatchSize(size: number): Promise<void> {
    this.currentBatchSize = Math.max(this.config.minSize, Math.min(this.config.maxSize, size));
  }

  getCurrentSize(): number {
    return this.currentBatchSize;
  }

  getQueueDepth(): number {
    return this.queueDepth;
  }

  async shutdown(): Promise<void> {
    // Process remaining items
    while (this.items.length > 0 && !this.processing) {
      // Would need processor function - simplified for now
      break;
    }
  }
}

class AdvancedConnectionPool extends EventEmitter implements ConnectionPool {
  private connections: PooledConnection[] = [];
  private availableConnections: PooledConnection[] = [];
  private stats: ConnectionMetrics;

  constructor(
    private config: ConnectionPoolingConfig,
    private logger: ILogger
  ) {
    super();
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      failedConnections: 0,
      avgConnectionTime: 0,
      poolUtilization: 0,
    };
  }

  async start(): Promise<void> {
    // Initialize pool with initial connections
    for (let i = 0; i < this.config.initialSize; i++) {
      const connection = await this.createConnection();
      this.connections.push(connection);
      this.availableConnections.push(connection);
    }

    this.updateStats();
    this.startHealthCheck();
  }

  async acquire(): Promise<PooledConnection> {
    let connection = this.availableConnections.pop();

    if (!connection) {
      if (this.connections.length < this.config.maxSize) {
        connection = await this.createConnection();
        this.connections.push(connection);
      } else {
        // Wait for available connection
        connection = await this.waitForConnection();
      }
    }

    connection.isActive = true;
    connection.lastUsed = new Date();
    connection.useCount++;

    this.updateStats();
    return connection;
  }

  release(connection: PooledConnection): void {
    connection.isActive = false;
    connection.lastUsed = new Date();

    if (connection.healthScore > 0.5) {
      this.availableConnections.push(connection);
    } else {
      this.destroy(connection);
    }

    this.updateStats();
  }

  destroy(connection: PooledConnection): void {
    const index = this.connections.indexOf(connection);
    if (index !== -1) {
      this.connections.splice(index, 1);
    }

    const availableIndex = this.availableConnections.indexOf(connection);
    if (availableIndex !== -1) {
      this.availableConnections.splice(availableIndex, 1);
    }

    // Clean up actual connection
    // connection.connection?.close?.();

    this.updateStats();
  }

  getStats(): ConnectionMetrics {
    return { ...this.stats };
  }

  async healthCheck(): Promise<void> {
    const now = Date.now();

    for (const connection of this.connections) {
      const idleTime = now - connection.lastUsed.getTime();

      if (idleTime > this.config.idleTimeout) {
        this.destroy(connection);
      } else if (!connection.isActive) {
        // Perform health check
        connection.healthScore = await this.checkConnectionHealth(connection);
      }
    }

    // Ensure minimum connections
    while (this.connections.length < this.config.minIdle) {
      const connection = await this.createConnection();
      this.connections.push(connection);
      this.availableConnections.push(connection);
    }

    this.updateStats();
  }

  async resize(newSize: number): Promise<void> {
    const targetSize = Math.max(this.config.minIdle, Math.min(this.config.maxSize, newSize));

    if (targetSize > this.connections.length) {
      // Add connections
      const toAdd = targetSize - this.connections.length;
      for (let i = 0; i < toAdd; i++) {
        const connection = await this.createConnection();
        this.connections.push(connection);
        this.availableConnections.push(connection);
      }
    } else if (targetSize < this.connections.length) {
      // Remove excess idle connections
      const toRemove = this.connections.length - targetSize;
      const idleConnections = this.availableConnections.slice(0, toRemove);

      for (const connection of idleConnections) {
        this.destroy(connection);
      }
    }

    this.updateStats();
  }

  private async createConnection(): Promise<PooledConnection> {
    // xxx NEEDS_HUMAN: startTime was unused - removed, but may be needed for actual connection timing metrics
    // const startTime = Date.now();

    try {
      // Simulate connection creation
      const connection = {
        /* actual connection object */
      };

      // Connection creation time tracking - could be used for metrics
      // const connectionTime = Date.now() - startTime;

      return {
        id: this.generateConnectionId(),
        connection,
        created: new Date(),
        lastUsed: new Date(),
        isActive: false,
        healthScore: 1.0,
        useCount: 0,
      };
    } catch (error) {
      this.stats.failedConnections++;
      throw error;
    }
  }

  private async waitForConnection(): Promise<PooledConnection> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection acquisition timeout'));
      }, this.config.connectionTimeout);

      const checkAvailable = () => {
        const available = this.availableConnections.pop();
        if (available) {
          clearTimeout(timeout);
          resolve(available);
        } else {
          setTimeout(checkAvailable, 10);
        }
      };

      checkAvailable();
    });
  }

  private async checkConnectionHealth(_connection: PooledConnection): Promise<number> {
    // Simulate health check
    return Math.random() > 0.1 ? 1.0 : 0.0; // 90% healthy
  }

  private startHealthCheck(): void {
    setInterval(() => {
      this.healthCheck().catch((error) => {
        this.logger.error('Connection health check failed', { error });
      });
    }, this.config.keepAliveInterval);
  }

  private updateStats(): void {
    this.stats = {
      totalConnections: this.connections.length,
      activeConnections: this.connections.filter((c) => c.isActive).length,
      idleConnections: this.availableConnections.length,
      failedConnections: this.stats.failedConnections, // Cumulative
      avgConnectionTime: this.calculateAvgConnectionTime(),
      poolUtilization:
        this.connections.length > 0
          ? this.connections.filter((c) => c.isActive).length / this.connections.length
          : 0,
    };

    this.emit('pool:stats', this.stats);
  }

  private calculateAvgConnectionTime(): number {
    // Simplified - would track actual connection times
    return 50; // 50ms average
  }

  private generateConnectionId(): string {
    return `conn-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  }

  async shutdown(): Promise<void> {
    for (const connection of this.connections) {
      this.destroy(connection);
    }
    this.connections.length = 0;
    this.availableConnections.length = 0;
  }
}

class IntelligentCache extends EventEmitter {
  private cache: LRUCache<string, CacheEntry<any>>;
  private deduplicationCache = new Map<string, DeduplicationEntry>();
  private stats: CacheMetrics;
  private prefetchStrategy: 'none' | 'lru' | 'predictive' = 'none';

  constructor(
    private config: CachingConfig,
    private logger: ILogger
  ) {
    super();

    // Logger is available for future use
    this.cache = new LRUCache({
      max: config?.maxSize,
      ttl: config?.ttl,
      dispose: (value: any, key: string) => {
        this.handleEviction(key, value);
      },
    });

    this.stats = {
      hitRate: 0,
      missRate: 0,
      evictionRate: 0,
      size: 0,
      memoryUsage: 0,
      avgAccessTime: 0,
    };
  }

  async set<T>(
    key: string,
    value: T,
    options?: { ttl?: number; compress?: boolean }
  ): Promise<void> {
    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: new Date(),
      accessCount: 0,
      lastAccessed: new Date(),
      ttl: options?.ttl || this.config.ttl,
      ...(options?.compress && this.config.compressionEnabled ? { compressed: true } : {}),
    };

    if (entry.compressed) {
      // Simulate compression
      entry.value = value; // Would actually compress
    }

    this.cache.set(key, entry);
    this.updateStats();
  }

  async get<T>(key: string): Promise<T | undefined> {
    const startTime = Date.now();
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (entry) {
      entry.accessCount++;
      entry.lastAccessed = new Date();

      this.stats.hitRate = this.calculateHitRate(true);

      // Decompress if needed
      const value = entry.compressed ? this.decompress(entry.value) : entry.value;

      const accessTime = Date.now() - startTime;
      this.updateAverageAccessTime(accessTime);

      return value;
    } else {
      this.stats.missRate = this.calculateHitRate(false);
      return undefined;
    }
  }

  async deduplicate<T>(operation: () => Promise<T>, key: string): Promise<T> {
    if (!this.config.deduplicationEnabled) {
      return await operation();
    }

    const hash = this.calculateHash(key);
    const existing = this.deduplicationCache.get(hash);

    if (existing && Date.now() - existing.timestamp.getTime() < 60000) {
      // 1 minute dedup window
      existing.accessCount++;
      return existing.result;
    }

    const result = await operation();

    this.deduplicationCache.set(hash, {
      hash,
      result,
      timestamp: new Date(),
      accessCount: 1,
    });

    // Cleanup old entries
    this.cleanupDeduplicationCache();

    return result;
  }

  async resize(newSize: number): Promise<void> {
    // LRUCache doesn't have resize, so create new cache with new size
    const oldEntries: [string, CacheEntry<any>][] = Array.from(this.cache.entries());
    this.cache = new LRUCache({
      max: newSize,
      ttl: this.config.ttl,
    });

    // Restore entries up to new size limit
    for (const [key, value] of oldEntries.slice(0, newSize)) {
      this.cache.set(key, value);
    }

    this.updateStats();
  }

  async setDefaultTTL(ttl: number): Promise<void> {
    this.config.ttl = ttl;
    // Create new cache instance with new TTL since ttl is readonly
    const oldCache = this.cache;
    this.cache = new LRUCache({
      max: this.config.maxSize,
      ttl: ttl,
      dispose: (value, key) => {
        this.handleEviction(key, value);
      },
    });

    // Migrate existing entries to new cache
    for (const [key, entry] of oldCache.entries()) {
      this.cache.set(key, entry);
    }
  }

  async setPrefetchStrategy(strategy: 'none' | 'lru' | 'predictive'): Promise<void> {
    this.prefetchStrategy = strategy;

    if (strategy !== 'none' && this.config.prefetchEnabled) {
      this.startPrefetching();
    }
  }

  getStats(): CacheMetrics {
    this.updateStats();
    return { ...this.stats };
  }

  private calculateHash(key: string): string {
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private calculateHitRate(isHit: boolean): number {
    // Simplified hit rate calculation
    return isHit ? Math.min(1, this.stats.hitRate + 0.01) : Math.max(0, this.stats.hitRate - 0.01);
  }

  private updateAverageAccessTime(accessTime: number): void {
    // Update moving average
    this.stats.avgAccessTime = this.stats.avgAccessTime * 0.9 + accessTime * 0.1;
  }

  private updateStats(): void {
    this.stats.size = this.cache.size;
    this.stats.memoryUsage = this.estimateMemoryUsage();
    this.emit('cache:stats', this.stats);
  }

  private estimateMemoryUsage(): number {
    // Estimate memory usage based on cache size
    return this.cache.size * 1024; // Rough estimate: 1KB per entry
  }

  private handleEviction(_key: string, _value: CacheEntry<any>): void {
    this.stats.evictionRate = Math.min(1, this.stats.evictionRate + 0.001);
  }

  private cleanupDeduplicationCache(): void {
    if (this.deduplicationCache.size > 10000) {
      // Max 10k entries
      const entries = Array.from(this.deduplicationCache.entries());
      entries.sort(([, a], [, b]) => a.timestamp.getTime() - b.timestamp.getTime());

      // Remove oldest 10%
      const toRemove = entries.slice(0, Math.floor(entries.length * 0.1));
      for (const [hash] of toRemove) {
        this.deduplicationCache.delete(hash);
      }
    }
  }

  // xxx NEEDS_HUMAN: compress method currently unused - may be needed for future compression implementation
  // private compress(value: any): any {
  //   // Simulate compression - not used currently but kept for future implementation
  //   return value;
  // }

  private decompress(value: any): any {
    // Simulate decompression
    return value;
  }

  private startPrefetching(): void {
    // Implement prefetching based on strategy
    this.logger.debug('Prefetching started', { strategy: this.prefetchStrategy });
    if (this.prefetchStrategy === 'lru') {
      // Prefetch most recently used items
    } else if (this.prefetchStrategy === 'predictive') {
      // Use ML to predict what to prefetch
    }
  }

  async shutdown(): Promise<void> {
    this.cache.clear();
    this.deduplicationCache.clear();
  }
}

class RealTimeMonitor extends EventEmitter {
  private metricsHistory: PerformanceMetrics[] = [];
  private alertStates = new Map<string, boolean>();
  private monitoringInterval?: NodeJS.Timeout;

  constructor(
    private config: MonitoringConfig,
    private logger: ILogger,
    eventBus: IEventBus
  ) {
    super();
    // xxx NEEDS_HUMAN: eventBus parameter kept for future event propagation implementation
    void eventBus;
    // xxx NEEDS_HUMAN: logger kept for future debug logging implementation
    void this.logger;
  }

  start(): void {
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.metricsInterval);
  }

  getHistoricalMetrics(timeAgo: number): PerformanceMetrics | null {
    const targetTime = Date.now() - timeAgo;

    // Find closest historical metric
    let closest: PerformanceMetrics | null = null;
    let minDiff = Infinity;

    for (const metrics of this.metricsHistory) {
      const diff = Math.abs(metrics.timestamp.getTime() - targetTime);
      if (diff < minDiff) {
        minDiff = diff;
        closest = metrics;
      }
    }

    return closest;
  }

  private collectMetrics(): void {
    // Collect current metrics (simplified)
    const metrics: PerformanceMetrics = {
      timestamp: new Date(),
      latency: this.collectLatencyMetrics(),
      throughput: this.collectThroughputMetrics(),
      resourceUsage: this.collectResourceMetrics(),
      batchMetrics: this.collectBatchMetrics(),
      connectionMetrics: this.collectConnectionMetrics(),
      cacheMetrics: this.collectCacheMetrics(),
      errorMetrics: this.collectErrorMetrics(),
    };

    this.metricsHistory.push(metrics);

    // Limit history size
    if (this.metricsHistory.length > this.config.historySizeLimit) {
      this.metricsHistory.shift();
    }

    this.emit('metrics:updated', { metrics });

    // Check for alerts
    this.checkAlerts(metrics);

    // Detect anomalies if enabled
    if (this.config.anomalyDetection) {
      this.detectAnomalies(metrics);
    }
  }

  private collectLatencyMetrics(): LatencyMetrics {
    // Simulate latency collection
    return {
      p50: 50,
      p90: 100,
      p95: 150,
      p99: 300,
      average: 75,
      max: 500,
      min: 10,
    };
  }

  private collectThroughputMetrics(): ThroughputMetrics {
    return {
      requestsPerSecond: 100,
      operationsPerSecond: 150,
      bytesPerSecond: 10240,
      batchesPerSecond: 10,
    };
  }

  private collectResourceMetrics(): ResourceMetrics {
    return {
      cpuUsage: Math.random() * 0.8,
      memoryUsage: Math.random() * 0.7,
      networkUsage: Math.random() * 0.5,
      diskUsage: Math.random() * 0.3,
      gcPressure: Math.random() * 0.2,
      threadCount: 50,
    };
  }

  private collectBatchMetrics(): BatchMetrics {
    return {
      currentSize: 10,
      averageSize: 12,
      utilizationRate: 0.8,
      processingTime: 100,
      queueDepth: 5,
      adaptationCount: 3,
    };
  }

  private collectConnectionMetrics(): ConnectionMetrics {
    return {
      totalConnections: 20,
      activeConnections: 15,
      idleConnections: 5,
      failedConnections: 0,
      avgConnectionTime: 50,
      poolUtilization: 0.75,
    };
  }

  private collectCacheMetrics(): CacheMetrics {
    return {
      hitRate: 0.85,
      missRate: 0.15,
      evictionRate: 0.05,
      size: 1000,
      memoryUsage: 1024000,
      avgAccessTime: 5,
    };
  }

  private collectErrorMetrics(): ErrorMetrics {
    return {
      totalErrors: 10,
      errorRate: 0.01,
      timeoutRate: 0.005,
      retryRate: 0.02,
      recoveryCounts: { network: 3, timeout: 2 },
    };
  }

  private checkAlerts(metrics: PerformanceMetrics): void {
    const thresholds = this.config.alertThresholds;

    const alerts = [
      {
        name: 'high_latency',
        condition: metrics.latency.p99 > thresholds.latency,
        value: metrics.latency.p99,
      },
      {
        name: 'low_throughput',
        condition: metrics.throughput.requestsPerSecond < thresholds.throughput,
        value: metrics.throughput.requestsPerSecond,
      },
      {
        name: 'high_error_rate',
        condition: metrics.errorMetrics.errorRate > thresholds.errorRate,
        value: metrics.errorMetrics.errorRate,
      },
      {
        name: 'high_cpu',
        condition: metrics.resourceUsage.cpuUsage > thresholds.cpuUsage,
        value: metrics.resourceUsage.cpuUsage,
      },
      {
        name: 'high_memory',
        condition: metrics.resourceUsage.memoryUsage > thresholds.memoryUsage,
        value: metrics.resourceUsage.memoryUsage,
      },
    ];

    for (const alert of alerts) {
      const wasActive = this.alertStates.get(alert.name) || false;
      const isActive = alert.condition;

      if (isActive && !wasActive) {
        this.emit('alert:triggered', {
          name: alert.name,
          value: alert.value,
          severity: this.getAlertSeverity(alert.name, alert.value),
          timestamp: new Date(),
        });
      } else if (!isActive && wasActive) {
        this.emit('alert:resolved', {
          name: alert.name,
          timestamp: new Date(),
        });
      }

      this.alertStates.set(alert.name, isActive);
    }
  }

  private getAlertSeverity(
    _alertName: string,
    value: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    // Simplified severity calculation
    return value > 0.9 ? 'critical' : value > 0.7 ? 'high' : value > 0.5 ? 'medium' : 'low';
  }

  private detectAnomalies(metrics: PerformanceMetrics): void {
    // Simple anomaly detection based on historical data
    if (this.metricsHistory.length < 10) return;

    const recent = this.metricsHistory.slice(-10);
    const avgLatency = recent.reduce((sum, m) => sum + m.latency.average, 0) / recent.length;

    if (metrics.latency.average > avgLatency * 2) {
      this.emit('anomaly:detected', {
        type: 'latency_spike',
        current: metrics.latency.average,
        baseline: avgLatency,
        timestamp: new Date(),
      });
    }
  }

  async shutdown(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }
}

class PerformancePredictor {
  private models = new Map<string, PredictionModel>();
  private trainingData: Array<{ features: number[]; label: number }> = [];

  constructor(private logger: ILogger) {
    this.initializeModels();
  }

  async predictLoad(metrics: PerformanceMetrics, horizon: number): Promise<LoadPrediction> {
    const features = this.extractFeatures(metrics);
    const model = this.models.get('load');

    if (!model) {
      throw new Error('Load prediction model not available');
    }

    const predictedLoad = model.predict(features);
    const confidence = model.getAccuracy();

    return {
      timestamp: new Date(),
      predictedLoad,
      confidence,
      horizon,
      factors: {
        current_load: features[0] ?? 0,
        trend: features[1] ?? 0,
        time_of_day: features[2] ?? 0,
      },
    };
  }

  async updatePredictions(metrics: PerformanceMetrics): Promise<void> {
    const features = this.extractFeatures(metrics);
    const load = metrics.throughput.requestsPerSecond;

    this.trainingData.push({ features, label: load });

    // Retrain models periodically
    if (this.trainingData.length > 100) {
      await this.retrainModels();
    }
  }

  private initializeModels(): void {
    // Initialize simple linear regression models
    this.models.set('load', new SimpleLinearRegression());
    this.models.set('latency', new SimpleLinearRegression());
    this.models.set('resources', new SimpleLinearRegression());
  }

  private extractFeatures(metrics: PerformanceMetrics): number[] {
    return [
      metrics.throughput.requestsPerSecond,
      metrics.latency.average,
      metrics.resourceUsage.cpuUsage,
      metrics.resourceUsage.memoryUsage,
      new Date().getHours(), // Time of day feature
    ];
  }

  private async retrainModels(): Promise<void> {
    const features = this.trainingData.map((d) => d.features);
    const labels = this.trainingData.map((d) => d.label);

    for (const [name, model] of this.models) {
      try {
        model.train(features, labels);
        this.logger.debug('Retrained prediction model', {
          model: name,
          accuracy: model.getAccuracy(),
        });
      } catch (error) {
        this.logger.error('Model training failed', { model: name, error });
      }
    }

    // Keep only recent training data
    this.trainingData = this.trainingData.slice(-1000);
  }
}

class SimpleLinearRegression implements PredictionModel {
  private weights: number[] = [];
  private accuracy = 0.5;

  predict(features: number[]): number {
    if (this.weights.length === 0) {
      return features[0] || 0; // Return first feature as default
    }

    let prediction = 0;
    for (let i = 0; i < Math.min(features.length, this.weights.length); i++) {
      prediction += (features[i] ?? 0) * (this.weights[i] ?? 0);
    }

    return Math.max(0, prediction);
  }

  train(features: number[][], labels: number[]): void {
    if (features.length === 0 || labels.length === 0) return;

    // Simple least squares implementation
    const numFeatures = features[0]?.length ?? 0;
    this.weights = new Array(numFeatures).fill(0);

    // Simplified training - just use correlation
    for (let f = 0; f < numFeatures; f++) {
      let correlation = 0;
      for (let i = 0; i < features.length; i++) {
        const featureValue = features[i]?.[f] ?? 0;
        const labelValue = labels[i] ?? 0;
        correlation += featureValue * labelValue;
      }
      this.weights[f] = correlation / features.length / 1000; // Normalize
    }

    // Calculate accuracy (simplified)
    let totalError = 0;
    for (let i = 0; i < features.length; i++) {
      const predicted = this.predict(features[i] ?? []);
      const error = Math.abs(predicted - (labels[i] ?? 0));
      totalError += error;
    }

    const avgError = totalError / features.length;
    const avgLabel = labels.reduce((sum, l) => sum + l, 0) / labels.length;
    this.accuracy = Math.max(0, 1 - avgError / avgLabel);
  }

  getAccuracy(): number {
    return this.accuracy;
  }
}

class AdaptationEngine {
  private learningHistory: Array<{ action: OptimizationAction; outcome: number }> = [];

  constructor(
    private config: AdaptationConfig,
    private logger: ILogger
  ) {
    // Learning history will be used for ML-based optimization in future
    void this.learningHistory; // xxx NEEDS_HUMAN: Will be used for ML-based optimization
    void this.config; // xxx NEEDS_HUMAN: Will be used for configuration-based adaptation
    void this.logger; // xxx NEEDS_HUMAN: Will be used for adaptation logging
  }

  async getRecommendations(
    metrics: PerformanceMetrics,
    _history: OptimizationAction[]
  ): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];

    // Analyze current performance and suggest optimizations
    if (metrics.latency.p99 > 1000) {
      // High latency
      recommendations.push({
        type: 'batch_size',
        parameters: { size: Math.max(5, metrics.batchMetrics.currentSize * 0.8) },
        confidence: 0.8,
        impact: 0.3,
        reasoning: 'Reduce batch size to improve latency',
      });
    }

    if (metrics.throughput.requestsPerSecond < 50) {
      // Low throughput
      recommendations.push({
        type: 'connection_pool_size',
        parameters: { size: metrics.connectionMetrics.totalConnections * 1.2 },
        confidence: 0.7,
        impact: 0.4,
        reasoning: 'Increase connection pool for better throughput',
      });
    }

    if (metrics.cacheMetrics.hitRate < 0.7) {
      // Low cache hit rate
      recommendations.push({
        type: 'cache_size',
        parameters: { size: metrics.cacheMetrics.size * 1.5 },
        confidence: 0.6,
        impact: 0.2,
        reasoning: 'Increase cache size to improve hit rate',
      });
    }

    return recommendations.filter((rec) => rec.confidence > 0.5);
  }
}

export default PerformanceOptimizer;
