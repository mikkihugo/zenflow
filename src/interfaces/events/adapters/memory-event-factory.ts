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

import type { IConfig, ILogger } from '../../../core/interfaces/base-interfaces.ts';
import type { 
  EventManagerConfig, 
  EventManagerStatus,
  EventManagerMetrics,
  IEventManagerFactory,
  IEventManager
} from '../core/interfaces.ts';
import { BaseEventManager } from '../core/base-event-manager.ts';
import type { MemoryEvent } from '../types.ts';
import type { IMemoryEventManager } from '../factories.ts';

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
class MemoryEventManager extends BaseEventManager implements IMemoryEventManager {
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
      lastCalculated: new Date()
    }
  };

  private subscriptions = {
    cache: new Map<string, (event: MemoryEvent) => void>(),
    gc: new Map<string, (event: MemoryEvent) => void>(),
    storage: new Map<string, (event: MemoryEvent) => void>(),
    performance: new Map<string, (event: MemoryEvent) => void>(),
    lifecycle: new Map<string, (event: MemoryEvent) => void>()
  };

  constructor(config: EventManagerConfig, logger: ILogger) {
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
          cacheSize: event.data?.cacheSize
        }
      };

      // Emit through base manager
      await this.emit(enrichedEvent);

      // Route to specific memory handlers
      await this.routeMemoryEvent(enrichedEvent);

      this.logger.debug(`Memory event emitted: ${event.operation} for ${event.key || 'system'}`);
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
    
    this.logger.debug(`Performance event subscription created: ${subscriptionId}`);
    return subscriptionId;
  }

  /**
   * Subscribe to lifecycle events.
   */
  subscribeLifecycleEvents(listener: (event: MemoryEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.lifecycle.set(subscriptionId, listener);
    
    this.logger.debug(`Lifecycle event subscription created: ${subscriptionId}`);
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
    const totalCacheOperations = this.memoryMetrics.cacheHits + this.memoryMetrics.cacheMisses;
    const hitRate = totalCacheOperations > 0 
      ? this.memoryMetrics.cacheHits / totalCacheOperations 
      : 0;

    const gcFrequency = this.memoryMetrics.gcCollections;
    const averageGcTime = this.memoryMetrics.gcCollections > 0
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
        averageAccessTime: this.memoryMetrics.performanceStats.averageAccessTime,
        memoryEfficiency: this.memoryMetrics.performanceStats.memoryEfficiency
      },
      cache: {
        hits: this.memoryMetrics.cacheHits,
        misses: this.memoryMetrics.cacheMisses,
        evictions: this.memoryMetrics.cacheEvictions,
        totalOperations: totalCacheOperations
      },
      gc: {
        collections: this.memoryMetrics.gcCollections,
        totalTime: this.memoryMetrics.gcTime,
        averageTime: averageGcTime
      },
      storage: {
        operations: this.memoryMetrics.storageOperations,
        compressionRatio: this.memoryMetrics.compressionRatio
      }
    };
  }

  /**
   * Get comprehensive event manager metrics.
   */
  async getMetrics(): Promise<EventManagerMetrics> {
    const baseMetrics = await super.getMetrics();
    const memoryMetrics = await this.getMemoryMetrics();

    return {
      ...baseMetrics,
      customMetrics: {
        memory: memoryMetrics
      }
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

    const isHealthy = baseStatus.status === 'healthy' && 
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
          efficiency: memoryMetrics.performance.memoryEfficiency
        }
      }
    };
  }

  /**
   * Private helper methods.
   */

  private initializeMemoryHandlers(): void {
    this.logger.debug('Initializing memory event handlers');
    
    // Set up event type routing
    this.subscribe(['memory:cache', 'memory:gc', 'memory:storage', 
                   'memory:performance', 'memory:lifecycle'], 
                  this.handleMemoryEvent.bind(this));
  }

  private async handleMemoryEvent(event: MemoryEvent): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Route based on operation type
      const operationType = event.type.split(':')[1];
      
      switch (operationType) {
        case 'cache':
          await this.notifySubscribers(this.subscriptions.cache, event);
          break;
        case 'gc':
          await this.notifySubscribers(this.subscriptions.gc, event);
          break;
        case 'storage':
          await this.notifySubscribers(this.subscriptions.storage, event);
          break;
        case 'performance':
          await this.notifySubscribers(this.subscriptions.performance, event);
          break;
        case 'lifecycle':
          await this.notifySubscribers(this.subscriptions.lifecycle, event);
          break;
        default:
          this.logger.warn(`Unknown memory operation type: ${operationType}`);
      }

      // Track access patterns
      if (event.key) {
        const currentCount = this.memoryMetrics.accessPatterns.get(event.key) || 0;
        this.memoryMetrics.accessPatterns.set(event.key, currentCount + 1);
      }

    } catch (error) {
      this.logger.error('Memory event handling failed:', error);
      throw error;
    }
  }

  private async routeMemoryEvent(event: MemoryEvent): Promise<void> {
    // Handle special memory operations
    switch (event.operation) {
      case 'hit':
        this.logger.debug(`Cache hit: ${event.key}`);
        break;
      case 'miss':
        this.logger.debug(`Cache miss: ${event.key}`);
        break;
      case 'evict':
        this.logger.debug(`Cache eviction: ${event.key}`);
        break;
      case 'gc-start':
        this.logger.debug('Garbage collection started');
        break;
      case 'gc-end':
        if (event.data?.duration) {
          this.memoryMetrics.gcTime += event.data.duration;
        }
        this.logger.debug(`Garbage collection completed in ${event.data?.duration}ms`);
        break;
      case 'serialize':
        this.logger.debug(`Data serialized: ${event.key} (${event.data?.size} bytes)`);
        break;
      case 'compress':
        if (event.data?.compressionRatio) {
          this.memoryMetrics.compressionRatio = event.data.compressionRatio;
        }
        this.logger.debug(`Data compressed: ${event.key} (ratio: ${event.data?.compressionRatio})`);
        break;
      case 'expire':
        this.logger.debug(`Cache item expired: ${event.key}`);
        break;
      case 'cleanup':
        this.logger.debug('Memory cleanup performed');
        break;
      case 'pressure':
        this.logger.warn(`Memory pressure detected: ${event.data?.level}`);
        break;
    }

    // Update memory usage tracking
    if (event.data?.memoryUsage) {
      this.memoryMetrics.totalMemoryUsage = event.data.memoryUsage;
      if (event.data.memoryUsage > this.memoryMetrics.maxMemoryUsage) {
        this.memoryMetrics.maxMemoryUsage = event.data.memoryUsage;
      }
    }
  }

  private updateMemoryMetrics(event: MemoryEvent): void {
    const operationType = event.type.split(':')[1];
    
    switch (operationType) {
      case 'cache':
        if (event.operation === 'hit') {
          this.memoryMetrics.cacheHits++;
        } else if (event.operation === 'miss') {
          this.memoryMetrics.cacheMisses++;
        } else if (event.operation === 'evict') {
          this.memoryMetrics.cacheEvictions++;
        }
        break;
      case 'gc':
        if (event.operation === 'gc-end') {
          this.memoryMetrics.gcCollections++;
        }
        break;
      case 'storage':
        this.memoryMetrics.storageOperations++;
        break;
    }
  }

  private updatePerformanceStats(): void {
    const totalOperations = this.memoryMetrics.cacheHits + this.memoryMetrics.cacheMisses;
    
    this.memoryMetrics.performanceStats.hitRatio = totalOperations > 0 
      ? this.memoryMetrics.cacheHits / totalOperations 
      : 0;

    // Calculate memory efficiency (simplified metric)
    const maxUsage = this.memoryMetrics.maxMemoryUsage;
    const currentUsage = this.memoryMetrics.totalMemoryUsage;
    this.memoryMetrics.performanceStats.memoryEfficiency = maxUsage > 0 
      ? 1 - (currentUsage / maxUsage) 
      : 1;

    this.memoryMetrics.performanceStats.lastCalculated = new Date();
  }

  private async notifySubscribers(
    subscribers: Map<string, (event: MemoryEvent) => void>, 
    event: MemoryEvent
  ): Promise<void> {
    const notifications = Array.from(subscribers.values()).map(async (listener) => {
      try {
        await listener(event);
      } catch (error) {
        this.logger.error('Memory event listener failed:', error);
      }
    });

    await Promise.allSettled(notifications);
  }

  private generateSubscriptionId(): string {
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
export class MemoryEventManagerFactory implements IEventManagerFactory<EventManagerConfig> {
  constructor(
    private logger: ILogger,
    private config: IConfig
  ) {
    this.logger.debug('MemoryEventManagerFactory initialized');
  }

  /**
   * Create a new MemoryEventManager instance.
   */
  async create(config: EventManagerConfig): Promise<IEventManager> {
    this.logger.info(`Creating memory event manager: ${config.name}`);

    this.validateConfig(config);
    const optimizedConfig = this.applyMemoryDefaults(config);
    const manager = new MemoryEventManager(optimizedConfig, this.logger);
    await this.configureMemoryManager(manager, optimizedConfig);

    this.logger.info(`Memory event manager created successfully: ${config.name}`);
    return manager;
  }

  private validateConfig(config: EventManagerConfig): void {
    if (!config.name) {
      throw new Error('Memory event manager name is required');
    }

    if (config.type !== 'memory') {
      throw new Error('Manager type must be "memory"');
    }

    if (config.maxListeners && config.maxListeners < 100) {
      this.logger.warn('Memory managers should support at least 100 listeners for high-frequency operations');
    }
  }

  private applyMemoryDefaults(config: EventManagerConfig): EventManagerConfig {
    return {
      ...config,
      maxListeners: config.maxListeners || 500,
      processing: {
        strategy: 'immediate', // Memory operations need immediate processing
        timeout: 50, // Very fast timeout for memory operations
        retries: 1, // Limited retries for memory operations
        batchSize: 200, // High batch size for memory events
        ...config.processing
      },
      persistence: {
        enabled: false, // Memory events are typically ephemeral
        ...config.persistence
      },
      monitoring: {
        enabled: true,
        metricsInterval: 10000, // 10 second metrics for memory
        healthCheckInterval: 30000, // 30 second health checks
        ...config.monitoring
      }
    };
  }

  private async configureMemoryManager(
    manager: MemoryEventManager, 
    config: EventManagerConfig
  ): Promise<void> {
    if (config.monitoring?.enabled) {
      await manager.start();
      this.logger.debug(`Memory event manager monitoring started: ${config.name}`);
    }

    if (config.monitoring?.healthCheckInterval) {
      setInterval(async () => {
        try {
          const status = await manager.healthCheck();
          if (status.status !== 'healthy') {
            this.logger.warn(`Memory manager health degraded: ${config.name}`, status.metadata);
          }
        } catch (error) {
          this.logger.error(`Memory manager health check failed: ${config.name}`, error);
        }
      }, config.monitoring.healthCheckInterval);
    }
  }
}

export default MemoryEventManagerFactory;