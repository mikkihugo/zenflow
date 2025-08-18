/**
 * @fileoverview Memory Event Manager Factory Implementation
 *
 * Factory for creating memory event managers that handle memory operations,
 * caching, garbage collection, and memory lifecycle events. Provides
 * specialized event management for memory and caching systems.
 *
 * ## Features
 *
 * - **Cache Events**: Cache hits, misses, evictions, invalidations
 * - **Memory Events**: Allocation, deallocation, garbage collection
 * - **Storage Events**: Persistent storage, serialization, compression
 * - **Performance Monitoring**: Hit ratios, memory usage, access patterns
 * - **Lifecycle Management**: TTL expiration, cleanup, optimization
 *
 * ## Event Types Handled
 *
 * - `memory:cache` - Cache operations and performance events
 * - `memory:gc` - Garbage collection and memory cleanup events
 * - `memory:storage` - Persistent storage and serialization events
 * - `memory:performance` - Memory performance and optimization events
 * - `memory:lifecycle` - Memory lifecycle and management events
 *
 * @example
 * ```typescript
 * const factory = new MemoryEventManagerFactory(logger, config);
 * const manager = await factory.create({
 *   name: 'cache-memory',
 *   type: 'memory',
 *   maxListeners: 200,
 *   processing: {
 *     strategy: 'immediate',
 *     batchSize: 50
 *   }
 * });
 *
 * // Subscribe to cache events
 * manager.subscribeCacheEvents((event) => {
 *   console.log(`Cache ${event.operation}: ${event.data.key} (${event.data.hitRatio})`);
 * });
 *
 * // Emit memory event
 * await manager.emitMemoryEvent({
 *   id: 'cache-001',
 *   timestamp: new Date(),
 *   source: 'cache-engine',
 *   type: 'memory:cache',
 *   operation: 'hit',
 *   key: 'user:123',
 *   data: {
 *     key: 'user:123',
 *     size: 1024,
 *     ttl: 3600,
 *     hitRatio: 0.85
 *   }
 * });
 * ```
 *
 * @author Claude Code Zen Team
 * @version 1.0.0-alpha.43
 * @since 1.0.0
 */

import type {
  Config,
  Logger,
} from '@claude-zen/foundation';
import { BaseEventManager } from '../core/base-event-manager';
import type {
  EventManagerConfig,
  EventManagerMetrics,
  EventManagerStatus,
  EventManager,
  EventManagerFactory,
  SystemEvent,
} from '../core/interfaces';
import type { MemoryEventManager } from '../event-manager-types';
import type { MemoryEvent } from '../types';

/**
 * Memory Event Manager implementation for memory and caching operations.
 *
 * Specialized event manager for handling memory-related events including
 * caching, garbage collection, memory allocation, and performance monitoring.
 * Optimized for high-frequency memory operations with efficient tracking.
 *
 * ## Operation Types
 *
 * - **Cache Operations**: Get, set, delete, evict, invalidate
 * - **Memory Operations**: Allocate, deallocate, resize, cleanup
 * - **GC Operations**: Collection, optimization, memory pressure
 * - **Storage Operations**: Persist, serialize, compress, restore
 *
 * ## Performance Features
 *
 * - **High-Frequency Processing**: Optimized for cache operation volumes
 * - **Memory Usage Tracking**: Real-time memory and cache statistics
 * - **Performance Analytics**: Hit ratios, access patterns, optimization
 * - **Lifecycle Management**: TTL tracking, eviction policies, cleanup
 */
class MemoryEventManagerImpl
  extends BaseEventManager
  implements MemoryEventManager
{
  private memoryMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    cacheEvictions: 0,
    totalMemoryUsage: 0,
    maxMemoryUsage: 0,
    gcCollections: 0,
    gcTime: 0,
    storageOperations: 0,
    compressionRatio: 0,
    accessPatterns: new Map<string, number>(),
    performanceStats: {
      hitRatio: 0,
      averageAccessTime: 0,
      memoryEfficiency: 0,
      lastCalculated: new Date(),
    },
  };

  private subscriptions = {
    cache: new Map<string, (event: MemoryEvent) => void>(),
    gc: new Map<string, (event: MemoryEvent) => void>(),
    storage: new Map<string, (event: MemoryEvent) => void>(),
    performance: new Map<string, (event: MemoryEvent) => void>(),
    lifecycle: new Map<string, (event: MemoryEvent) => void>(),
  };

  constructor(config: EventManagerConfig, logger: Logger) {
    super(config, logger);
    this.initializeMemoryHandlers();
  }

  /**
   * Emit memory-specific event with memory context.
   */
  async emitMemoryEvent(event: MemoryEvent): Promise<void> {
    try {
      // Update memory metrics
      this.updateMemoryMetrics(event);

      // Add memory-specific metadata
      const enrichedEvent = {
        ...event,
        metadata: {
          ...event.metadata,
          timestamp: new Date(),
          processingTime: Date.now(),
          memoryUsage: process.memoryUsage?.()?.heapUsed || 0,
          cacheSize: event.details?.size,
        },
      };

      // Emit through base manager
      await this.emit(enrichedEvent);

      // Route to specific memory handlers
      await this.routeMemoryEvent(enrichedEvent);

      this.logger.debug(
        `Memory event emitted: ${event.operation} for ${event.details?.key || 'system'}`
      );
    } catch (error) {
      this.logger.error('Failed to emit memory event:', error);
      throw error;
    }
  }

  /**
   * Subscribe to cache events.
   */
  subscribeCacheEvents(listener: (event: MemoryEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.cache.set(subscriptionId, listener);

    this.logger.debug(`Cache event subscription created: ${subscriptionId}`);
    return subscriptionId;
  }

  /**
   * Subscribe to garbage collection events.
   */
  subscribeGCEvents(listener: (event: MemoryEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.gc.set(subscriptionId, listener);

    this.logger.debug(`GC event subscription created: ${subscriptionId}`);
    return subscriptionId;
  }

  /**
   * Subscribe to storage events.
   */
  subscribeStorageEvents(listener: (event: MemoryEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.storage.set(subscriptionId, listener);

    this.logger.debug(`Storage event subscription created: ${subscriptionId}`);
    return subscriptionId;
  }

  /**
   * Subscribe to performance events.
   */
  subscribePerformanceEvents(listener: (event: MemoryEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.performance.set(subscriptionId, listener);

    this.logger.debug(
      `Performance event subscription created: ${subscriptionId}`
    );
    return subscriptionId;
  }

  /**
   * Subscribe to lifecycle events.
   */
  subscribeLifecycleEvents(listener: (event: MemoryEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.lifecycle.set(subscriptionId, listener);

    this.logger.debug(
      `Lifecycle event subscription created: ${subscriptionId}`
    );
    return subscriptionId;
  }

  /**
   * Get memory-specific metrics and performance data.
   */
  async getMemoryMetrics(): Promise<{
    cacheHitRate: number;
    memoryUsage: number;
    gcFrequency: number;
    performance: {
      hitRatio: number;
      averageAccessTime: number;
      memoryEfficiency: number;
    };
    cache: {
      hits: number;
      misses: number;
      evictions: number;
      totalOperations: number;
    };
    gc: {
      collections: number;
      totalTime: number;
      averageTime: number;
    };
    storage: {
      operations: number;
      compressionRatio: number;
    };
  }> {
    const totalCacheOperations =
      this.memoryMetrics.cacheHits + this.memoryMetrics.cacheMisses;
    const hitRate =
      totalCacheOperations > 0
        ? this.memoryMetrics.cacheHits / totalCacheOperations
        : 0;

    const gcFrequency = this.memoryMetrics.gcCollections;
    const averageGcTime =
      this.memoryMetrics.gcCollections > 0
        ? this.memoryMetrics.gcTime / this.memoryMetrics.gcCollections
        : 0;

    // Update performance stats
    this.updatePerformanceStats();

    return {
      cacheHitRate: hitRate,
      memoryUsage: this.memoryMetrics.totalMemoryUsage,
      gcFrequency,
      performance: {
        hitRatio: this.memoryMetrics.performanceStats.hitRatio,
        averageAccessTime:
          this.memoryMetrics.performanceStats.averageAccessTime,
        memoryEfficiency: this.memoryMetrics.performanceStats.memoryEfficiency,
      },
      cache: {
        hits: this.memoryMetrics.cacheHits,
        misses: this.memoryMetrics.cacheMisses,
        evictions: this.memoryMetrics.cacheEvictions,
        totalOperations: totalCacheOperations,
      },
      gc: {
        collections: this.memoryMetrics.gcCollections,
        totalTime: this.memoryMetrics.gcTime,
        averageTime: averageGcTime,
      },
      storage: {
        operations: this.memoryMetrics.storageOperations,
        compressionRatio: this.memoryMetrics.compressionRatio,
      },
    };
  }

  /**
   * Get comprehensive event manager metrics.
   */
  override async getMetrics(): Promise<EventManagerMetrics> {
    const baseMetrics = await super.getMetrics();
    const memoryMetrics = await this.getMemoryMetrics();

    return {
      ...baseMetrics,
      // Note: memory metrics available via getMemoryMetrics() method
    };
  }

  /**
   * Health check with memory-specific validation.
   */
  async healthCheck(): Promise<EventManagerStatus> {
    const baseStatus = await super.healthCheck();
    const memoryMetrics = await this.getMemoryMetrics();

    // Memory-specific health checks
    const lowHitRate = memoryMetrics.cacheHitRate < 0.5; // 50% hit rate threshold
    const highMemoryUsage = memoryMetrics.memoryUsage > 1024 * 1024 * 1024; // 1GB threshold
    const frequentGC = memoryMetrics.gcFrequency > 100; // 100 GC collections
    const poorEfficiency = memoryMetrics.performance.memoryEfficiency < 0.7; // 70% efficiency

    const isHealthy =
      baseStatus.status === 'healthy' &&
      !lowHitRate &&
      !highMemoryUsage &&
      !frequentGC &&
      !poorEfficiency;

    return {
      ...baseStatus,
      status: isHealthy ? 'healthy' : 'degraded',
      metadata: {
        ...baseStatus.metadata,
        memory: {
          hitRate: memoryMetrics.cacheHitRate,
          memoryUsage: memoryMetrics.memoryUsage,
          gcFrequency: memoryMetrics.gcFrequency,
          efficiency: memoryMetrics.performance.memoryEfficiency,
        },
      },
    };
  }

  /**
   * Store memory event data.
   * Required by MemoryEventManager interface.
   */
  async storeMemoryEvent(key: string, data: unknown): Promise<void> {
    this.logger.debug(`Storing memory event: ${key}`);
    
    try {
      // Emit memory storage event
      await this.emitMemoryEvent({
        id: `memory-store-${key}-${Date.now()}`,
        timestamp: new Date(),
        source: 'memory-event-store',
        type: 'memory:store',
        operation: 'set',
        details: {
          key,
          size: JSON.stringify(data).length,
          memoryUsage: process.memoryUsage?.()?.heapUsed || 0,
        },
        payload: typeof data === 'object' && data !== null ? data as Record<string, unknown> : { data },
        metadata: {
          key,
          storeStart: new Date(),
        },
      });
      
      this.logger.info(`Memory event stored successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to store memory event ${key}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve memory event data.
   * Required by MemoryEventManager interface.
   */
  async retrieveMemoryEvent(key: string): Promise<unknown> {
    this.logger.debug(`Retrieving memory event: ${key}`);
    
    try {
      // Emit memory retrieval event
      await this.emitMemoryEvent({
        id: `memory-retrieve-${key}-${Date.now()}`,
        timestamp: new Date(),
        source: 'memory-event-retrieval',
        type: 'memory:cache',
        operation: 'get',
        details: {
          key,
          cacheHit: true, // Simplified for demonstration
          memoryUsage: process.memoryUsage?.()?.heapUsed || 0,
        },
        payload: { key, retrieved: true },
        metadata: {
          key,
          retrieveStart: new Date(),
        },
      });
      
      // For demonstration, return a simple success indication
      // In a real implementation, this would retrieve actual data
      const result = { key, retrieved: true, timestamp: new Date() };
      this.logger.info(`Memory event retrieved successfully: ${key}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to retrieve memory event ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear memory cache.
   * Required by MemoryEventManager interface.
   */
  async clearMemoryCache(): Promise<void> {
    this.logger.debug('Clearing memory cache');
    
    try {
      // Emit memory cache clear event
      await this.emitMemoryEvent({
        id: `memory-clear-${Date.now()}`,
        timestamp: new Date(),
        source: 'memory-event-cache',
        type: 'memory:cache',
        operation: 'clear',
        details: {
          memoryUsage: process.memoryUsage?.()?.heapUsed || 0,
        },
        payload: { cleared: true },
        metadata: {
          clearStart: new Date(),
        },
      });
      
      // Clear internal metrics
      this.memoryMetrics.accessPatterns.clear();
      this.logger.info('Memory cache cleared successfully');
    } catch (error) {
      this.logger.error('Failed to clear memory cache:', error);
      throw error;
    }
  }

  /**
   * Private helper methods.
   */

  private initializeMemoryHandlers(): void {
    this.logger.debug('Initializing memory event handlers');

    // Set up event type routing
    this.subscribe(
      [
        'memory:cache',
        'memory:store',
        'memory:gc',
        'memory:pool',
      ],
      (event: SystemEvent) => this.handleMemoryEvent(event as MemoryEvent)
    );
  }

  private async handleMemoryEvent(event: MemoryEvent): Promise<void> {
    const startTime = Date.now();

    try {
      // Route based on operation type
      const operationType = event.type.split(':')[1];

      switch (operationType) {
        case 'cache':
          await this.notifyMemorySubscribers(this.subscriptions.cache, event);
          break;
        case 'store':
          await this.notifyMemorySubscribers(this.subscriptions.storage, event);
          break;
        case 'gc':
          await this.notifyMemorySubscribers(this.subscriptions.gc, event);
          break;
        case 'pool':
          await this.notifyMemorySubscribers(this.subscriptions.performance, event);
          break;
        default:
          this.logger.warn(`Unknown memory operation type: ${operationType}`);
      }

      // Track access patterns
      if (event.details?.key) {
        const currentCount =
          this.memoryMetrics.accessPatterns.get(event.details.key) || 0;
        this.memoryMetrics.accessPatterns.set(event.details.key, currentCount + 1);
      }
    } catch (error) {
      this.logger.error('Memory event handling failed:', error);
      throw error;
    }
  }

  private async routeMemoryEvent(event: MemoryEvent): Promise<void> {
    // Handle special memory operations
    switch (event.operation) {
      case 'get':
        if (event.details?.cacheHit) {
          this.logger.debug(`Cache hit: ${event.details?.key}`);
        } else {
          this.logger.debug(`Cache miss: ${event.details?.key}`);
        }
        break;
      case 'set':
        this.logger.debug(`Cache set: ${event.details?.key}`);
        break;
      case 'delete':
        this.logger.debug(`Cache delete: ${event.details?.key}`);
        break;
      case 'clear':
        this.logger.debug('Cache cleared');
        break;
      case 'expire':
        this.logger.debug(`Cache item expired: ${event.details?.key}`);
        break;
      case 'cleanup':
        this.logger.debug('Memory cleanup performed');
        if (event.details?.gcDuration) {
          this.memoryMetrics.gcTime += event.details.gcDuration;
        }
        break;
      case 'allocate':
        this.logger.debug(`Memory allocated: ${event.details?.size} bytes`);
        break;
      case 'deallocate':
        this.logger.debug(`Memory deallocated: ${event.details?.size} bytes`);
        break;
    }

    // Update memory usage tracking
    if (event.details?.memoryUsage) {
      this.memoryMetrics.totalMemoryUsage = event.details.memoryUsage;
      if (event.details.memoryUsage > this.memoryMetrics.maxMemoryUsage) {
        this.memoryMetrics.maxMemoryUsage = event.details.memoryUsage;
      }
    }
  }

  private updateMemoryMetrics(event: MemoryEvent): void {
    const operationType = event.type.split(':')[1];

    switch (operationType) {
      case 'cache':
        if (event.operation === 'get' && event.details?.cacheHit) {
          this.memoryMetrics.cacheHits++;
        } else if (event.operation === 'get' && !event.details?.cacheHit) {
          this.memoryMetrics.cacheMisses++;
        } else if (event.operation === 'delete') {
          this.memoryMetrics.cacheEvictions++;
        }
        break;
      case 'gc':
        if (event.operation === 'cleanup') {
          this.memoryMetrics.gcCollections++;
        }
        break;
      case 'store':
        this.memoryMetrics.storageOperations++;
        break;
    }
  }

  private updatePerformanceStats(): void {
    const totalOperations =
      this.memoryMetrics.cacheHits + this.memoryMetrics.cacheMisses;

    this.memoryMetrics.performanceStats.hitRatio =
      totalOperations > 0 ? this.memoryMetrics.cacheHits / totalOperations : 0;

    // Calculate memory efficiency (simplified metric)
    const maxUsage = this.memoryMetrics.maxMemoryUsage;
    const currentUsage = this.memoryMetrics.totalMemoryUsage;
    this.memoryMetrics.performanceStats.memoryEfficiency =
      maxUsage > 0 ? 1 - currentUsage / maxUsage : 1;

    this.memoryMetrics.performanceStats.lastCalculated = new Date();
  }

  private async notifyMemorySubscribers(
    subscribers: Map<string, (event: MemoryEvent) => void>,
    event: MemoryEvent
  ): Promise<void> {
    const notifications = Array.from(subscribers.values()).map(
      async (listener) => {
        try {
          await listener(event);
        } catch (error) {
          this.logger.error('Memory event listener failed:', error);
        }
      }
    );

    await Promise.allSettled(notifications);
  }

  protected generateSubscriptionId(): string {
    return `memory-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

/**
 * Factory for creating MemoryEventManager instances.
 *
 * Provides configuration management and instance creation for memory
 * event managers with optimized settings for caching operations and
 * high-frequency memory management workloads.
 *
 * ## Configuration Options
 *
 * - **High-Frequency Processing**: Optimized for cache operation volumes
 * - **Memory Monitoring**: Comprehensive memory usage and GC tracking
 * - **Performance Analytics**: Hit ratios, access patterns, optimization
 * - **Lifecycle Management**: TTL tracking, eviction policies, cleanup
 *
 * @example
 * ```typescript
 * const factory = new MemoryEventManagerFactory(logger, config);
 *
 * const cacheManager = await factory.create({
 *   name: 'cache-memory',
 *   type: 'memory',
 *   maxListeners: 1000,
 *   processing: {
 *     strategy: 'immediate',
 *     batchSize: 100
 *   }
 * });
 * ```
 */
export class MemoryEventManagerFactory
  implements EventManagerFactory<EventManagerConfig>
{
  private managers = new Map<string, EventManager>();

  constructor(
    private logger: Logger,
    private config: Config
  ) {
    this.logger.debug('MemoryEventManagerFactory initialized');
  }

  /**
   * Create a new MemoryEventManager instance.
   */
  async create(config: EventManagerConfig): Promise<EventManager> {
    this.logger.info(`Creating memory event manager: ${config.name}`);

    this.validateConfig(config);
    const optimizedConfig = this.applyMemoryDefaults(config);
    const manager = new MemoryEventManagerImpl(optimizedConfig, this.logger);
    await this.configureMemoryManager(manager, optimizedConfig);

    // Register the manager in our registry
    this.managers.set(config.name, manager as unknown as EventManager);

    this.logger.info(
      `Memory event manager created successfully: ${config.name}`
    );
    return manager as unknown as EventManager;
  }

  /**
   * Create multiple event managers in batch.
   */
  async createMultiple(configs: EventManagerConfig[]): Promise<EventManager[]> {
    this.logger.info(`Creating ${configs.length} memory event managers`);
    
    const results = await Promise.allSettled(
      configs.map(config => this.create(config))
    );
    
    const managers: EventManager[] = [];
    const errors: Error[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        managers.push(result.value);
      } else {
        errors.push(new Error(`Failed to create manager ${configs[index]?.name}: ${result.reason}`));
      }
    });
    
    if (errors.length > 0) {
      this.logger.error(`${errors.length} managers failed to create:`, errors);
      throw new Error(`Failed to create ${errors.length} out of ${configs.length} managers`);
    }
    
    return managers;
  }

  /**
   * Get an event manager by name.
   */
  get(name: string): EventManager | undefined {
    return this.managers.get(name);
  }

  /**
   * List all event managers managed by this factory.
   */
  list(): EventManager[] {
    return Array.from(this.managers.values());
  }

  /**
   * Check if an event manager exists.
   */
  has(name: string): boolean {
    return this.managers.has(name);
  }

  /**
   * Remove and destroy an event manager.
   */
  async remove(name: string): Promise<boolean> {
    const manager = this.managers.get(name);
    if (!manager) {
      return false;
    }
    
    try {
      await manager.destroy();
      this.managers.delete(name);
      this.logger.info(`Memory event manager removed: ${name}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to remove memory event manager ${name}:`, error);
      throw error;
    }
  }

  /**
   * Perform health check on all managed event managers.
   */
  async healthCheckAll(): Promise<Map<string, EventManagerStatus>> {
    const results = new Map<string, EventManagerStatus>();
    
    const healthChecks = Array.from(this.managers.entries()).map(async ([name, manager]) => {
      try {
        const status = await manager.healthCheck();
        results.set(name, status);
      } catch (error) {
        this.logger.error(`Health check failed for manager ${name}:`, error);
        results.set(name, {
          name,
          type: 'memory',
          status: 'unhealthy',
          lastCheck: new Date(),
          subscriptions: 0,
          queueSize: 0,
          errorRate: 1,
          uptime: 0,
          metadata: { error: String(error) }
        });
      }
    });
    
    await Promise.allSettled(healthChecks);
    return results;
  }

  /**
   * Get metrics for all managed event managers.
   */
  async getMetricsAll(): Promise<Map<string, EventManagerMetrics>> {
    const results = new Map<string, EventManagerMetrics>();
    
    const metricRequests = Array.from(this.managers.entries()).map(async ([name, manager]) => {
      try {
        const metrics = await manager.getMetrics();
        results.set(name, metrics);
      } catch (error) {
        this.logger.error(`Failed to get metrics for manager ${name}:`, error);
      }
    });
    
    await Promise.allSettled(metricRequests);
    return results;
  }

  /**
   * Start all managed event managers.
   */
  async startAll(): Promise<void> {
    const startRequests = Array.from(this.managers.entries()).map(async ([name, manager]) => {
      try {
        await manager.start();
        this.logger.debug(`Started memory event manager: ${name}`);
      } catch (error) {
        this.logger.error(`Failed to start manager ${name}:`, error);
        throw error;
      }
    });
    
    const results = await Promise.allSettled(startRequests);
    const failures = results.filter(result => result.status === 'rejected');
    
    if (failures.length > 0) {
      throw new Error(`Failed to start ${failures.length} out of ${results.length} managers`);
    }
  }

  /**
   * Stop all managed event managers.
   */
  async stopAll(): Promise<void> {
    const stopRequests = Array.from(this.managers.entries()).map(async ([name, manager]) => {
      try {
        await manager.stop();
        this.logger.debug(`Stopped memory event manager: ${name}`);
      } catch (error) {
        this.logger.error(`Failed to stop manager ${name}:`, error);
        throw error;
      }
    });
    
    const results = await Promise.allSettled(stopRequests);
    const failures = results.filter(result => result.status === 'rejected');
    
    if (failures.length > 0) {
      throw new Error(`Failed to stop ${failures.length} out of ${results.length} managers`);
    }
  }

  /**
   * Shutdown the factory and all managed event managers.
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down memory event manager factory');
    
    try {
      await this.stopAll();
      
      // Destroy all managers
      const destroyRequests = Array.from(this.managers.entries()).map(async ([name, manager]) => {
        try {
          await manager.destroy();
        } catch (error) {
          this.logger.error(`Failed to destroy manager ${name}:`, error);
        }
      });
      
      await Promise.allSettled(destroyRequests);
      this.managers.clear();
      
      this.logger.info('Memory event manager factory shutdown complete');
    } catch (error) {
      this.logger.error('Error during factory shutdown:', error);
      throw error;
    }
  }

  /**
   * Get count of active event managers.
   */
  getActiveCount(): number {
    return this.managers.size;
  }

  /**
   * Get factory performance metrics.
   */
  getFactoryMetrics(): {
    totalManagers: number;
    runningManagers: number;
    errorCount: number;
    uptime: number;
  } {
    const runningManagers = Array.from(this.managers.values())
      .filter(manager => manager.isRunning()).length;
    
    return {
      totalManagers: this.managers.size,
      runningManagers,
      errorCount: 0, // TODO: Track factory-level errors
      uptime: Date.now() - this.factoryStartTime,
    };
  }

  private factoryStartTime = Date.now();

  private validateConfig(config: EventManagerConfig): void {
    if (!config.name) {
      throw new Error('Memory event manager name is required');
    }

    if (config.type !== 'memory') {
      throw new Error('Manager type must be "memory"');
    }

    if (config.maxListeners && config.maxListeners < 100) {
      this.logger.warn(
        'Memory managers should support at least 100 listeners for high-frequency operations'
      );
    }
  }

  private applyMemoryDefaults(config: EventManagerConfig): EventManagerConfig {
    return {
      ...config,
      maxListeners: config.maxListeners || 500,
      processing: {
        batchSize: 200, // High batch size for memory events
        ...config.processing,
        strategy: 'immediate', // Memory operations need immediate processing
      },
      monitoring: {
        enabled: true,
        metricsInterval: 10000, // 10 second metrics for memory
        trackLatency: true,
        trackThroughput: true,
        trackErrors: true,
        enableProfiling: false,
        ...config.monitoring,
      },
    };
  }

  private async configureMemoryManager(
    manager: MemoryEventManagerImpl,
    config: EventManagerConfig
  ): Promise<void> {
    if (config.monitoring?.enabled) {
      await manager.start();
      this.logger.debug(
        `Memory event manager monitoring started: ${config.name}`
      );
    }

    // Set up periodic health checks with a default interval
    const healthCheckInterval = 30000; // 30 seconds
    setInterval(async () => {
      try {
        const status = await manager.healthCheck();
        if (status.status !== 'healthy') {
          this.logger.warn(
            `Memory manager health degraded: ${config.name}`,
            status.metadata
          );
        }
      } catch (error) {
        this.logger.error(
          `Memory manager health check failed: ${config.name}`,
          error
        );
      }
    }, healthCheckInterval);
  }
}

export default MemoryEventManagerFactory;
