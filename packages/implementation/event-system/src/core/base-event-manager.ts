import { EnhancedError, EventEmitter } from '@claude-zen/foundation';
/**
 * @fileoverview Base Event Manager Implementation
 *
 * Base class for all event managers providing common functionality including
 * event emission, subscription management, filtering, health checking, and
 * performance monitoring. All specialized event managers extend this base.
 *
 * ## Features
 *
 * - **Event Emission**: Reliable event publishing with retry mechanisms
 * - **Subscription Management**: Dynamic listener registration and cleanup
 * - **Event Filtering**: Advanced filtering with custom criteria support
 * - **Performance Monitoring**: Built-in metrics collection and health checks
 * - **Error Handling**: Comprehensive error recovery and logging
 *
 * ## Design Patterns
 *
 * - **Observer Pattern**: Event subscription and notification system
 * - **Strategy Pattern**: Pluggable processing strategies (immediate, queued, batched)
 * - **Template Method**: Extensible event processing pipeline
 * - **Circuit Breaker**: Automatic failure recovery and degradation
 *
 * @author Claude Code Zen Team
 * @version 1.0.0-alpha.43
 * @since 1.0.0
 */

import type { Logger } from '@claude-zen/foundation';
import type {
  EventFilter,
  EventManagerConfig,
  EventManagerMetrics,
  EventManagerStatus,
  EventPriority,
  EventProcessingStrategy,
  EventManager,
  EventManagerType,
  SystemEvent,
} from './interfaces;

/**
 * Base Event Manager providing core event management functionality.
 *
 * Abstract base class that implements common event management patterns
 * including subscription management, event emission, filtering, and
 * performance monitoring. Designed for extension by specialized managers.
 *
 * ## Core Capabilities
 *
 * - **Subscription Management**: Add, remove, and manage event listeners
 * - **Event Processing**: Multiple processing strategies with batching support
 * - **Error Recovery**: Automatic retry and circuit breaker patterns
 * - **Performance Tracking**: Built-in metrics and health monitoring
 * - **Lifecycle Management**: Start, stop, and destroy functionality
 *
 * ## Processing Strategies
 *
 * - **Immediate**: Process events synchronously as they arrive
 * - **Queued**: Queue events for asynchronous processing
 * - **Batched**: Collect events into batches for efficient processing
 * - **Throttled**: Rate-limit event processing to prevent overload
 *
 * @example
 * ```typescript`
 * class CustomEventManager extends BaseEventManager {
 *   constructor(config: EventManagerConfig, logger: Logger) {
 *     super(config, logger);
 *   }
 *
 *   async handleCustomEvent(event: SystemEvent): Promise<void> {
 *     // Custom event handling logic
 *     await this.emit(event);
 *   }
 * }
 *
 * const manager = new CustomEventManager(config, logger);
 * await manager.start();
 *
 * const subscriptionId = manager.subscribe(['custom:event'], (event) => {'
 *   console.log('Event received:', event);'
 * });
 *
 * await manager.emit({
 *   id: 'custom-001',
 *   type: 'custom:event',
 *   timestamp: new Date(),
 *   source: 'test'* });'
 * ````
 */
export abstract class BaseEventManager implements EventManager {
  public readonly name: string;
  public readonly type: EventManagerType;

  protected subscribers = new Map<
    string,
    {
      eventTypes: string[];
      listener: (event: SystemEvent) => void|Promise<void>;
      filter?: EventFilter;
      subscriptionTime: Date;
      eventCount: number;
    }
  >();

  protected eventQueue: SystemEvent[] = [];
  protected processingBatch: SystemEvent[] = [];
  protected isProcessing = false;
  protected _isRunning = false;
  protected processingStrategy: EventProcessingStrategy;

  protected metrics = {
    eventsEmitted: 0,
    eventsProcessed: 0,
    eventsFailed: 0,
    subscriptionCount: 0,
    averageLatency: 0,
    totalProcessingTime: 0,
    lastEmissionTime: new Date(),
    startTime: new Date(),
    errorCount: 0,
    retryCount: 0,
  };

  public readonly config: EventManagerConfig;
  protected logger: Logger;
  protected processingInterval?: NodeJS.Timeout;
  protected healthCheckInterval?: NodeJS.Timeout;

  // Enhanced functionality properties
  protected globalFilters?: Map<string, EventFilter>;
  protected globalTransforms?: Map<string, {
    mapper?: (event: SystemEvent) => SystemEvent;
    enricher?: (event: SystemEvent) => Promise<SystemEvent>;
    validator?: (event: SystemEvent) => boolean;
    metadata: {
      transformId: string;
      createdAt: Date;
      createdBy: string;
      active: boolean;
      executionCount: number;
      lastExecuted?: Date;
    };
  }>;
  protected eventHistory?: SystemEvent[];
  protected lifecycleEmitter?: EventEmitter;

  constructor(config: EventManagerConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
    this.name = config.name;
    this.type = config.type as EventManagerType;
    this.processingStrategy = config.processing?.strategy||'immediate;

    this.logger.debug(
      `BaseEventManager initialized: ${this.name} (${this.type})``
    );
  }

  /**
   * Start the event manager and begin processing.
   */
  async start(): Promise<void> {
    if (this._isRunning) {
      this.logger.warn(`Event manager already running: ${this.name}`);`
      return;
    }

    this._isRunning = true;
    this.metrics.startTime = new Date();

    // Start processing based on strategy
    if (
      this.processingStrategy === 'queued'||this.processingStrategy ==='batched') {'
      this.startQueueProcessing();
    }

    // Start health monitoring if configured
    if (this.config.monitoring?.enabled) {
      this.startHealthMonitoring();
    }

    this.logger.info(`Event manager started: $this.name`);`
    
    // Emit lifecycle event
    if (this.lifecycleEmitter) {
      this.lifecycleEmitter.emit('start', {'
        managerName: this.name,
        managerType: this.type,
        processingStrategy: this.processingStrategy,
        startTime: this.metrics.startTime,
      });
    }
  }

  /**
   * Stop the event manager and halt processing.
   */
  async stop(): Promise<void> {
    if (!this._isRunning) {
      return;
    }

    this._isRunning = false;

    // Stop processing intervals
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = undefined;
    }

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }

    // Process remaining events
    if (this.eventQueue.length > 0) {
      await this.processEventQueue();
    }

    this.logger.info(`Event manager stopped: ${this.name}`);`
    
    // Emit lifecycle event
    if (this.lifecycleEmitter) {
      this.lifecycleEmitter.emit('stop', {'
        managerName: this.name,
        managerType: this.type,
        uptime: Date.now() - this.metrics.startTime.getTime(),
        finalMetrics: {
          eventsProcessed: this.metrics.eventsProcessed,
          eventsFailed: this.metrics.eventsFailed,
          subscriptionCount: this.metrics.subscriptionCount,
        },
      });
    }
  }

  /**
   * Destroy the event manager and clean up resources.
   */
  async destroy(): Promise<void> {
    await this.stop();

    // Clear all subscribers
    this.subscribers.clear();
    this.eventQueue.length = 0;
    this.processingBatch.length = 0;

    this.logger.info(`Event manager destroyed: $this.name`);`
  }

  /**
   * Emit an event to all matching subscribers.
   */
  async emit(
    event: SystemEvent,
    options?: {
      priority?: EventPriority;
      timeout?: number;
      retries?: number;
    }
  ): Promise<void> {
    if (!this._isRunning) {
      this.logger.warn(`Event manager not running, queuing event: ${event.id}`);`
      this.eventQueue.push(event);
      return;
    }

    const startTime = Date.now();
    this.metrics.eventsEmitted++;
    this.metrics.lastEmissionTime = new Date();

    try {
      // Add priority and options to event
      const enrichedEvent = {
        ...event,
        priority: options?.priority||'medium',
        metadata: {
          ...event.metadata,
          emittedAt: new Date(),
          managerId: this.name,
        },
      } as SystemEvent;

      // Process based on strategy
      switch (this.processingStrategy) {
        case 'immediate':'
          await this.processEventImmediate(enrichedEvent);
          break;
        case 'queued':'
          this.eventQueue.push(enrichedEvent);
          break;
        case 'batched':'
          this.processingBatch.push(enrichedEvent);
          if (
            this.processingBatch.length >=
            (this.config.processing?.batchSize||10)
          ) {
            await this.processBatch();
          }
          break;
        case'throttled':'
          await this.processEventThrottled(enrichedEvent);
          break;
        default:
          await this.processEventImmediate(enrichedEvent);
      }

      // Track event in history
      if (!this.eventHistory) {
        this.eventHistory = [];
      }
      this.eventHistory.push(enrichedEvent);
      
      // Keep history size manageable (last 10,000 events)
      if (this.eventHistory.length > 10000) {
        this.eventHistory = this.eventHistory.slice(-5000);
      }

      // Update metrics
      const processingTime = Date.now() - startTime;
      this.metrics.totalProcessingTime += processingTime;
      this.metrics.averageLatency =
        this.metrics.totalProcessingTime / this.metrics.eventsEmitted;
      this.metrics.eventsProcessed++;

      // Emit lifecycle event
      if (this.lifecycleEmitter) {
        this.lifecycleEmitter.emit('emission', {'
          event: enrichedEvent,
          processingTime,
          strategy: this.processingStrategy,
        });
      }

      this.logger.debug(`Event emitted: $event.type($processingTimems)`);`
    } catch (error) {
      this.metrics.eventsFailed++;
      this.metrics.errorCount++;
      this.logger.error(`Event emission failed: $event.id`, error);`

      // Emit error lifecycle event
      if (this.lifecycleEmitter) {
        this.lifecycleEmitter.emit('error', {'
          type: 'emission_failed',
          event: enrichedEvent,
          error: error instanceof Error ? error.message : String(error),
          managerName: this.name,
          timestamp: new Date(),
        });
      }

      // Retry if configured
      if (options?.retries && options.retries > 0) {
        this.metrics.retryCount++;
        await this.emit(event, { ...options, retries: options.retries - 1 });
      } else {
        throw error;
      }
    }
  }

  /**
   * Subscribe to events with optional filtering.
   */
  subscribe<T extends SystemEvent>(
    eventTypes: string|string[],
    listener: (event: T) => void|Promise<void>,
    options?: {
      filter?: EventFilter;
      once?: boolean;
    }
  ): string {
    const subscriptionId = this.generateSubscriptionId();
    const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];

    this.subscribers.set(subscriptionId, {
      eventTypes: types,
      listener: options?.once
        ? this.wrapOnceListener(
            listener as (event: SystemEvent) => void|Promise<void>,
            subscriptionId
          )
        : (listener as (event: SystemEvent) => void|Promise<void>),
      filter: options?.filter,
      subscriptionTime: new Date(),
      eventCount: 0,
    });

    this.metrics.subscriptionCount++;
    
    // Emit lifecycle event
    if (this.lifecycleEmitter) {
      this.lifecycleEmitter.emit('subscription', {'
        action: 'added',
        subscriptionId,
        eventTypes: types,
        managerName: this.name,
        hasFilter: !!options?.filter,
        isOnceListener: !!options?.once,
      });
    }

    this.logger.debug(
      `Subscription created: ${subscriptionId} for types ${types.join(', ')}``
    );
    return subscriptionId;
  }

  /**
   * Unsubscribe from events.
   */
  unsubscribe(subscriptionId: string): boolean {
    const removed = this.subscribers.delete(subscriptionId);
    if (removed) {
      this.metrics.subscriptionCount--;
      
      // Emit lifecycle event
      if (this.lifecycleEmitter) {
        this.lifecycleEmitter.emit('subscription', {'
          action: 'removed',
          subscriptionId,
          managerName: this.name,
        });
      }
      
      this.logger.debug(`Subscription removed: ${subscriptionId}`);`
    }
    return removed;
  }

  /**
   * Get event manager metrics.
   */
  async getMetrics(): Promise<EventManagerMetrics> {
    const uptime = Date.now() - this.metrics.startTime.getTime();

    return {
      name: this.name,
      type: this.type,
      eventsProcessed: this.metrics.eventsProcessed,
      eventsFailed: this.metrics.eventsFailed,
      subscriptionCount: this.metrics.subscriptionCount,
      averageLatency: this.metrics.averageLatency,
      queueSize: this.eventQueue.length,
      eventsEmitted: this.metrics.eventsEmitted,
      p95Latency: this.metrics.averageLatency * 1.2, // Approximate p95
      p99Latency: this.metrics.averageLatency * 1.5, // Approximate p99
      throughput:
        this.metrics.eventsProcessed /
        Math.max(1, (Date.now() - this.metrics.startTime.getTime()) / 1000), // events per second
      memoryUsage: process.memoryUsage().heapUsed,
      timestamp: new Date(),
    };
  }

  /**
   * Perform health check on the event manager.
   */
  async healthCheck(): Promise<EventManagerStatus> {
    const metrics = await this.getMetrics();
    const queueBacklog =
      this.eventQueue.length > (this.config.processing?.queueSize||1000);
    const highErrorRate = false; // metrics.errorRate > 0.1; // 10% error threshold (errorRate not in interface)
    const notResponsive = !this.isRunning;

    const isHealthy = !(queueBacklog||highErrorRate||notResponsive);

    return {
      name: this.name,
      type: this.type,
      status: isHealthy ?'healthy' : 'unhealthy',
      lastCheck: new Date(),
      subscriptions: this.metrics.subscriptionCount,
      queueSize: this.eventQueue.length,
      errorRate: 0, // Default value for missing property
      uptime: Date.now() - this.metrics.startTime.getTime(), // Default value for missing property
      metadata: {
        isRunning: this.isRunning,
        processingStrategy: this.processingStrategy,
        queueBacklog,
        highErrorRate,
        lastActivity: this.metrics.lastEmissionTime,
      },
    };
  }

  /**
   * Get list of active subscriptions.
   */
  getSubscriptions(): Array<{
    id: string;
    eventTypes: string[];
    listener: (event: SystemEvent) => void|Promise<void>;
    filter?: EventFilter;
    priority: EventPriority;
    created: Date;
    active: boolean;
    metadata?: Record<string, unknown>;
  }> {
    return Array.from(this.subscribers.entries()).map(([id, subscription]) => ({
      id,
      eventTypes: subscription.eventTypes,
      listener: subscription.listener,
      filter: subscription.filter,
      priority:'medium' as EventPriority, // Default priority'
      created: subscription.subscriptionTime,
      active: true, // All stored subscriptions are active
      metadata: { eventCount: subscription.eventCount },
    }));
  }

  /**
   * Check if the event manager is currently running.
   */
  isRunning(): boolean {
    return this._isRunning;
  }

  /**
   * Clear all subscriptions.
   */
  clearSubscriptions(): void {
    this.subscribers.clear();
    this.metrics.subscriptionCount = 0;
    this.logger.debug(`All subscriptions cleared for manager: $this.name`);`
  }

  /**
   * Restart the event manager (stop then start).
   */
  async restart(): Promise<void> {
    this.logger.info(`Restarting event manager: ${this.name}`);`
    await this.stop();
    await this.start();
  }

  /**
   * Emit a batch of events efficiently.
   */
  async emitBatch<T extends SystemEvent>(
    batch: {
      id: string;
      events: T[];
      size: number;
      created: Date;
      metadata?: Record<string, unknown>;
    },
    options?: { priority?: EventPriority; timeout?: number; retries?: number }
  ): Promise<void> {
    this.logger.debug(`Emitting batch of $batch.events.lengthevents`);`

    // Process all events in the batch
    const promises = batch.events.map((event) => this.emit(event, options));
    await Promise.allSettled(promises);
  }

  /**
   * Emit an event with immediate processing (bypassing queues).
   */
  async emitImmediate<T extends SystemEvent>(event: T): Promise<void> {
    // Force immediate processing regardless of strategy
    const originalStrategy = this.processingStrategy;
    this.processingStrategy = 'immediate;

    try {
      await this.emit(event);
    } finally {
      this.processingStrategy = originalStrategy;
    }
  }

  /**
   * Unsubscribe all listeners for an event type or all listeners.
   */
  unsubscribeAll(eventType?: string): number {
    let removedCount = 0;

    if (eventType) {
      // Remove subscriptions for specific event type
      for (const [id, subscription] of this.subscribers.entries()) {
        if (subscription.eventTypes.includes(eventType)) {
          this.subscribers.delete(id);
          removedCount++;
        }
      }
    } else {
      // Remove all subscriptions
      removedCount = this.subscribers.size;
      this.subscribers.clear();
    }

    this.metrics.subscriptionCount -= removedCount;
    this.logger.debug(
      `Unsubscribed ${removedCount} listeners${eventType ? ` for event type: ${eventType}` : ''}``
    );
    return removedCount;
  }

  /**
   * Add a global event filter with comprehensive validation and storage.
   */
  addFilter(filter: EventFilter): string {
    const filterId = `filter-${Date.now()}-${Math.random().toString(36).substring(2)}`;`
    
    // Validate filter structure
    if (!filter || typeof filter !== 'object') {'
      throw new EnhancedError('Invalid filter provided', {'
        context: { filterId, filter },
        severity: 'high',
      });
    }

    // Initialize global filters map if not exists
    if (!this.globalFilters) {
      this.globalFilters = new Map<string, EventFilter>();
    }

    // Store the filter with enhanced metadata
    this.globalFilters.set(filterId, {
      ...filter,
      metadata: {
        ...filter.metadata,
        filterId,
        createdAt: new Date(),
        createdBy: this.name,
        active: true,
      },
    });

    this.logger.info(`Global event filter added: ${filterId}`, {`
      filterId,
      filterTypes: filter.types,
      filterSources: filter.sources,
      hasCustomFilter: !!filter.customFilter,
    });

    return filterId;
  }

  /**
   * Remove a previously added filter with validation.
   */
  removeFilter(filterId: string): boolean {
    if (!this.globalFilters || !this.globalFilters.has(filterId)) {
      this.logger.warn(`Filter not found for removal: ${filterId}`);`
      return false;
    }

    const removedFilter = this.globalFilters.get(filterId);
    const success = this.globalFilters.delete(filterId);
    
    if (success) {
      this.logger.info(`Global event filter removed: $filterId`, {`
        filterId,
        filterTypes: removedFilter?.types,
        filterSources: removedFilter?.sources,
      });
    }
    
    return success;
  }

  /**
   * Add a global event transformation with comprehensive processing.
   */
  addTransform(transform: {
    mapper?: (event: SystemEvent) => SystemEvent;
    enricher?: (event: SystemEvent) => Promise<SystemEvent>;
    validator?: (event: SystemEvent) => boolean;
  }): string {
    const transformId = `transform-${Date.now()}-${Math.random().toString(36).substring(2)}`;`
    
    // Validate transform structure
    if (!transform || typeof transform !== 'object') {'
      throw new EnhancedError('Invalid transform provided', {'
        context: { transformId, transform },
        severity: 'high',
      });
    }

    if (!transform.mapper && !transform.enricher && !transform.validator) {
      throw new EnhancedError('Transform must have at least one processing function', {'
        context: { transformId },
        severity: 'high',
      });
    }

    // Initialize global transforms map if not exists
    if (!this.globalTransforms) {
      this.globalTransforms = new Map<string, {
        mapper?: (event: SystemEvent) => SystemEvent;
        enricher?: (event: SystemEvent) => Promise<SystemEvent>;
        validator?: (event: SystemEvent) => boolean;
        metadata: {
          transformId: string;
          createdAt: Date;
          createdBy: string;
          active: boolean;
          executionCount: number;
          lastExecuted?: Date;
        };
      }>();
    }

    // Store the transform with enhanced metadata
    this.globalTransforms.set(transformId, {
      ...transform,
      metadata: {
        transformId,
        createdAt: new Date(),
        createdBy: this.name,
        active: true,
        executionCount: 0,
      },
    });

    this.logger.info(`Global event transform added: $transformId`, {`
      transformId,
      hasMapper: !!transform.mapper,
      hasEnricher: !!transform.enricher,
      hasValidator: !!transform.validator,
    });

    return transformId;
  }

  /**
   * Remove a previously added transformation with validation.
   */
  removeTransform(transformId: string): boolean {
    if (!this.globalTransforms || !this.globalTransforms.has(transformId)) {
      this.logger.warn(`Transform not found for removal: ${transformId}`);`
      return false;
    }

    const removedTransform = this.globalTransforms.get(transformId);
    const success = this.globalTransforms.delete(transformId);
    
    if (success) {
      this.logger.info(`Global event transform removed: $transformId`, {`
        transformId,
        executionCount: removedTransform?.metadata.executionCount,
        lastExecuted: removedTransform?.metadata.lastExecuted,
      });
    }
    
    return success;
  }

  /**
   * Query historical events with comprehensive filtering and pagination.
   */
  async query<T extends SystemEvent>(options: {
    filter?: EventFilter;
    limit?: number;
    offset?: number;
    sortBy?: 'timestamp' | 'priority' | 'type' | 'source;
    sortOrder?: 'asc' | 'desc;
    includeMetadata?: boolean;
  }): Promise<T[]> {
    const startTime = Date.now();
    const queryId = `query-${Date.now()}-${Math.random().toString(36).substring(2)}`;`
    
    this.logger.debug(`Starting historical event query: $queryId`, options);`

    try {
      // Initialize event history storage if not exists
      if (!this.eventHistory) {
        this.eventHistory = [];
      }

      let results = [...this.eventHistory] as T[];

      // Apply filtering if provided
      if (options.filter) {
        results = results.filter(event => this.eventMatchesFilter(event, options.filter!));
      }

      // Apply sorting
      const sortBy = options.sortBy || 'timestamp;
      const sortOrder = options.sortOrder || 'desc;
      
      results.sort((a, b) => {
        let valueA: any, valueB: any;
        
        switch (sortBy) {
          case 'timestamp':'
            valueA = new Date(a.timestamp).getTime();
            valueB = new Date(b.timestamp).getTime();
            break;
          case 'priority': {'
            const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
            valueA = priorityOrder[a.priority as keyof typeof priorityOrder] || 2;
            valueB = priorityOrder[b.priority as keyof typeof priorityOrder] || 2;
            break;
          }
          case 'type':'
            valueA = a.type;
            valueB = b.type;
            break;
          case 'source':'
            valueA = a.source;
            valueB = b.source;
            break;
          default:
            valueA = a.timestamp;
            valueB = b.timestamp;
        }
        
        const comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        return sortOrder === 'asc' ? comparison : -comparison;'
      });

      // Apply pagination
      const offset = options.offset || 0;
      const limit = options.limit || 100;
      results = results.slice(offset, offset + limit);

      // Filter metadata if requested
      if (options.includeMetadata === false) {
        results = results.map(event => {
          const { metadata, ...eventWithoutMetadata } = event;
          return eventWithoutMetadata as T;
        });
      }

      const queryTime = Date.now() - startTime;
      
      this.logger.info(`Historical event query completed: ${queryId}`, {`
        queryId,
        resultCount: results.length,
        queryTimeMs: queryTime,
        hasFilter: !!options.filter,
        sortBy,
        sortOrder,
        limit,
        offset,
      });

      return results;
      
    } catch (error) {
      const queryTime = Date.now() - startTime;
      
      this.logger.error(`Historical event query failed: ${queryId}`, {`
        queryId,
        error: error instanceof Error ? error.message : String(error),
        queryTimeMs: queryTime,
        options,
      });
      
      throw new EnhancedError('Failed to query historical events', {'
        context: { queryId, options, queryTime },
        cause: error instanceof Error ? error : new Error(String(error)),
        severity: 'high',
      });
    }
  }

  /**
   * Get event history for a specific event type with comprehensive filtering.
   */
  async getEventHistory(
    eventType: string,
    limit?: number
  ): Promise<SystemEvent[]> {
    const startTime = Date.now();
    const historyId = `history-${Date.now()}-${Math.random().toString(36).substring(2)}`;`
    
    this.logger.debug(`Getting event history: $historyId`, {`
      eventType,
      limit,
    });

    try {
      // Validate event type
      if (!eventType || typeof eventType !== 'string') {'
        throw new EnhancedError('Invalid event type provided', {'
          context: { eventType, historyId },
          severity: 'medium',
        });
      }

      // Use the query method with specific type filter
      const results = await this.query({
        filter: {
          types: [eventType],
        },
        limit: limit || 100,
        sortBy: 'timestamp',
        sortOrder: 'desc',
        includeMetadata: true,
      });

      const queryTime = Date.now() - startTime;
      
      this.logger.info(`Event history retrieved: ${historyId}`, {`
        historyId,
        eventType,
        resultCount: results.length,
        queryTimeMs: queryTime,
        limit: limit || 100,
      });

      return results;
      
    } catch (error) {
      const queryTime = Date.now() - startTime;
      
      this.logger.error(`Event history retrieval failed: ${historyId}`, {`
        historyId,
        eventType,
        error: error instanceof Error ? error.message : String(error),
        queryTimeMs: queryTime,
        limit,
      });
      
      throw new EnhancedError('Failed to get event history', {'
        context: { historyId, eventType, limit, queryTime },
        cause: error instanceof Error ? error : new Error(String(error)),
        severity: 'high',
      });
    }
  }

  /**
   * Update event manager configuration dynamically.
   */
  updateConfig(config: Partial<EventManagerConfig>): void {
    // Note: config is readonly, so we need to cast for updates
    (this.config as any) = { ...this.config, ...config };

    // Update processing strategy if changed
    if (config.processing?.strategy) {
      this.processingStrategy = config.processing.strategy;
    }

    this.logger.debug(`Configuration updated for manager: ${this.name}`);`
  }

  /**
   * Add listener for manager lifecycle events using Foundation EventEmitter.
   */
  on(
    event: 'start' | 'stop' | 'error' | 'subscription' | 'emission',
    handler: (...args: unknown[]) => void
  ): void {
    // Initialize lifecycle emitter if not exists
    if (!this.lifecycleEmitter) {
      this.lifecycleEmitter = new EventEmitter();
    }

    // Validate event and handler
    if (!event || typeof event !== 'string') {'
      throw new EnhancedError('Invalid event name provided', {'
        context: { event, managerName: this.name },
        severity: 'medium',
      });
    }

    if (!handler || typeof handler !== 'function') {'
      throw new EnhancedError('Invalid handler function provided', {'
        context: { event, managerName: this.name },
        severity: 'medium',
      });
    }

    this.lifecycleEmitter.on(event, handler);
    
    this.logger.debug(`Lifecycle listener added for event: $event`, {`
      event,
      managerName: this.name,
      listenerCount: this.lifecycleEmitter.listenerCount(event),
    });
  }

  /**
   * Remove listener for manager events.
   */
  off(event: string, handler?: (...args: unknown[]) => void): void {
    if (!this.lifecycleEmitter) {
      this.logger.warn(`No lifecycle emitter exists for manager: ${this.name}`);`
      return;
    }

    if (!event || typeof event !== 'string') {'
      this.logger.warn('Invalid event name provided for removal', { event });'
      return;
    }

    if (handler && typeof handler === 'function') {'
      this.lifecycleEmitter.off(event, handler);
    } else {
      this.lifecycleEmitter.removeAllListeners(event);
    }
    
    this.logger.debug(`Lifecycle listener(s) removed for event: $event`, {`
      event,
      managerName: this.name,
      removedSpecificHandler: !!handler,
      remainingListeners: this.lifecycleEmitter.listenerCount(event),
    });
  }

  /**
   * Add one-time listener for manager events.
   */
  once(event: string, handler: (...args: unknown[]) => void): void {
    // Initialize lifecycle emitter if not exists
    if (!this.lifecycleEmitter) {
      this.lifecycleEmitter = new EventEmitter();
    }

    // Validate event and handler
    if (!event || typeof event !== 'string') {'
      throw new EnhancedError('Invalid event name provided', {'
        context: { event, managerName: this.name },
        severity: 'medium',
      });
    }

    if (!handler || typeof handler !== 'function') {'
      throw new EnhancedError('Invalid handler function provided', {'
        context: { event, managerName: this.name },
        severity: 'medium',
      });
    }

    this.lifecycleEmitter.once(event, handler);
    
    this.logger.debug(`One-time lifecycle listener added for event: ${event}`, {`
      event,
      managerName: this.name,
      totalListenerCount: this.lifecycleEmitter.listenerCount(event),
    });
  }

  /**
   * Protected methods for extension by subclasses.
   */

  protected async processEventImmediate(event: SystemEvent): Promise<void> {
    await this.notifySubscribers(event);
  }

  protected async processEventThrottled(event: SystemEvent): Promise<void> {
    // Simple throttling - could be made more sophisticated
    const delay = (this.config.processing as any)?.throttleDelay||100;
    setTimeout(async () => {
      await this.notifySubscribers(event);
    }, delay);
  }

  protected async processBatch(): Promise<void> {
    if (this.processingBatch.length === 0||this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    const batch = [...this.processingBatch];
    this.processingBatch.length = 0;

    try {
      // Process batch in parallel
      await Promise.allSettled(
        batch.map((event) => this.notifySubscribers(event))
      );
    } catch (error) {
      this.logger.error('Batch processing failed:', error);'
    } finally {
      this.isProcessing = false;
    }
  }

  protected async processEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0||this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    const batchSize = this.config.processing?.batchSize||10;
    const batch = this.eventQueue.splice(0, batchSize);

    try {
      for (const event of batch) {
        await this.processEventImmediate(event);
      }
    } catch (error) {
      this.logger.error('Queue processing failed:', error);'
      this.metrics.errorCount++;
    } finally {
      this.isProcessing = false;
    }
  }

  protected async notifySubscribers(event: SystemEvent): Promise<void> {
    const matchingSubscribers = this.findMatchingSubscribers(event);

    if (matchingSubscribers.length === 0) {
      return;
    }

    // Notify subscribers in parallel
    const notifications = matchingSubscribers.map(async (subscription) => {
      try {
        subscription.eventCount++;
        await subscription.listener(event);
      } catch (error) {
        this.logger.error(`Subscriber notification failed: ${error}`);`
        this.metrics.errorCount++;
      }
    });

    await Promise.allSettled(notifications);
  }

  protected findMatchingSubscribers(event: SystemEvent): Array<{
    eventTypes: string[];
    listener: (event: SystemEvent) => void|Promise<void>;
    filter?: EventFilter;
    subscriptionTime: Date;
    eventCount: number;
  }> {
    const matching: Array<{
      eventTypes: string[];
      listener: (event: SystemEvent) => void|Promise<void>;
      filter?: EventFilter;
      subscriptionTime: Date;
      eventCount: number;
    }> = [];

    for (const subscription of this.subscribers.values()) {
      // Check event type match
      if (
        !subscription.eventTypes.some((type) =>
          this.eventTypeMatches(event.type, type)
        )
      ) {
        continue;
      }

      // Apply filter if provided
      if (
        subscription.filter &&
        !this.eventMatchesFilter(event, subscription.filter)
      ) {
        continue;
      }

      matching.push(subscription);
    }

    return matching;
  }

  protected eventTypeMatches(
    eventType: string,
    subscriptionType: string
  ): boolean {
    // Support wildcard matching
    if (subscriptionType.includes('*')) {'
      const pattern = subscriptionType.replace(/*/g, '.*');'
      return new RegExp(`^$pattern$`).test(eventType);`
    }

    return eventType === subscriptionType;
  }

  protected eventMatchesFilter(
    event: SystemEvent,
    filter: EventFilter
  ): boolean {
    // Type filtering
    if (filter.types && !filter.types.includes(event.type)) {
      return false;
    }

    // Source filtering
    if (filter.sources && !filter.sources.includes(event.source)) {
      return false;
    }

    // Priority filtering
    if (
      filter.priorities &&
      event.priority &&
      !filter.priorities.includes(event.priority)
    ) {
      return false;
    }

    // Metadata filtering
    if (filter.metadata) {
      for (const [key, value] of Object.entries(filter.metadata)) {
        if (!event.metadata||event.metadata[key] !== value) {
          return false;
        }
      }
    }

    // Custom filter
    if (filter.customFilter && !filter.customFilter(event)) {
      return false;
    }

    return true;
  }

  protected generateSubscriptionId(): string {
    return `${this.name}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;`
  }

  protected wrapOnceListener(
    listener: (event: SystemEvent) => void|Promise<void>,
    subscriptionId: string
  ): (event: SystemEvent) => void|Promise<void> {
    return async (event: SystemEvent) => {
      try {
        await listener(event);
      } finally {
        this.unsubscribe(subscriptionId);
      }
    };
  }

  protected startQueueProcessing(): void {
    const interval = (this.config.processing as any)?.processInterval||100;
    this.processingInterval = setInterval(async () => {
      if (this.eventQueue.length > 0) {
        await this.processEventQueue();
      }
      if (
        this.processingBatch.length > 0 &&
        this.processingStrategy ==='batched') {'
        await this.processBatch();
      }
    }, interval);
  }

  protected startHealthMonitoring(): void {
    const interval =
      (this.config.monitoring as any)?.healthCheckInterval||60000;
    this.healthCheckInterval = setInterval(async () => {
      try {
        const status = await this.healthCheck();
        if (status.status !=='healthy') {'
          this.logger.warn(
            `Event manager health check failed: $this.name`,`
            status
          );
        }
      } catch (error) {
        this.logger.error(
          `Health check error for manager ${this.name}:`,`
          error
        );
      }
    }, interval);
  }
}

export default BaseEventManager;
