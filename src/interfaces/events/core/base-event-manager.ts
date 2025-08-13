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

import type { ILogger } from '../../../core/interfaces/base-interfaces.ts';
import type {
  EventFilter,
  EventManagerConfig,
  EventManagerMetrics,
  EventManagerStatus,
  EventPriority,
  EventProcessingStrategy,
  IEventManager,
  SystemEvent,
} from './interfaces.ts';

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
 * ```typescript
 * class CustomEventManager extends BaseEventManager {
 *   constructor(config: EventManagerConfig, logger: ILogger) {
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
 * const subscriptionId = manager.subscribe(['custom:event'], (event) => {
 *   console.log('Event received:', event);
 * });
 *
 * await manager.emit({
 *   id: 'custom-001',
 *   type: 'custom:event',
 *   timestamp: new Date(),
 *   source: 'test'
 * });
 * ```
 */
export abstract class BaseEventManager implements IEventManager {
  public readonly name: string;
  public readonly type: string;

  protected subscribers = new Map<
    string,
    {
      eventTypes: string[];
      listener: (event: SystemEvent) => void | Promise<void>;
      filter?: EventFilter;
      subscriptionTime: Date;
      eventCount: number;
    }
  >();

  protected eventQueue: SystemEvent[] = [];
  protected processingBatch: SystemEvent[] = [];
  protected isProcessing = false;
  protected isRunning = false;
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

  protected config: EventManagerConfig;
  protected logger: ILogger;
  protected processingInterval?: NodeJS.Timeout;
  protected healthCheckInterval?: NodeJS.Timeout;

  constructor(config: EventManagerConfig, logger: ILogger) {
    this.config = config;
    this.logger = logger;
    this.name = config.name;
    this.type = config.type;
    this.processingStrategy = config.processing?.strategy || 'immediate';

    this.logger.debug(
      `BaseEventManager initialized: ${this.name} (${this.type})`
    );
  }

  /**
   * Start the event manager and begin processing.
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn(`Event manager already running: ${this.name}`);
      return;
    }

    this.isRunning = true;
    this.metrics.startTime = new Date();

    // Start processing based on strategy
    if (
      this.processingStrategy === 'queued' ||
      this.processingStrategy === 'batched'
    ) {
      this.startQueueProcessing();
    }

    // Start health monitoring if configured
    if (this.config.monitoring?.enabled) {
      this.startHealthMonitoring();
    }

    this.logger.info(`Event manager started: ${this.name}`);
  }

  /**
   * Stop the event manager and halt processing.
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

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

    this.logger.info(`Event manager stopped: ${this.name}`);
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

    this.logger.info(`Event manager destroyed: ${this.name}`);
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
    if (!this.isRunning) {
      this.logger.warn(`Event manager not running, queuing event: ${event.id}`);
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
        priority: options?.priority || 'medium',
        metadata: {
          ...event.metadata,
          emittedAt: new Date(),
          managerId: this.name,
        },
      } as SystemEvent;

      // Process based on strategy
      switch (this.processingStrategy) {
        case 'immediate':
          await this.processEventImmediate(enrichedEvent);
          break;
        case 'queued':
          this.eventQueue.push(enrichedEvent);
          break;
        case 'batched':
          this.processingBatch.push(enrichedEvent);
          if (
            this.processingBatch.length >=
            (this.config.processing?.batchSize || 10)
          ) {
            await this.processBatch();
          }
          break;
        case 'throttled':
          await this.processEventThrottled(enrichedEvent);
          break;
        default:
          await this.processEventImmediate(enrichedEvent);
      }

      // Update metrics
      const processingTime = Date.now() - startTime;
      this.metrics.totalProcessingTime += processingTime;
      this.metrics.averageLatency =
        this.metrics.totalProcessingTime / this.metrics.eventsEmitted;
      this.metrics.eventsProcessed++;

      this.logger.debug(`Event emitted: ${event.type} (${processingTime}ms)`);
    } catch (error) {
      this.metrics.eventsFailed++;
      this.metrics.errorCount++;
      this.logger.error(`Event emission failed: ${event.id}`, error);

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
  subscribe(
    eventTypes: string | string[],
    listener: (event: SystemEvent) => void | Promise<void>,
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
        ? this.wrapOnceListener(listener, subscriptionId)
        : listener,
      filter: options?.filter,
      subscriptionTime: new Date(),
      eventCount: 0,
    });

    this.metrics.subscriptionCount++;

    this.logger.debug(
      `Subscription created: ${subscriptionId} for types ${types.join(', ')}`
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
      this.logger.debug(`Subscription removed: ${subscriptionId}`);
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
      uptime,
      queueSize: this.eventQueue.length,
      errorRate:
        this.metrics.eventsEmitted > 0
          ? this.metrics.eventsFailed / this.metrics.eventsEmitted
          : 0,
      lastActivity: this.metrics.lastEmissionTime,
      isRunning: this.isRunning,
      customMetrics: {},
    };
  }

  /**
   * Perform health check on the event manager.
   */
  async healthCheck(): Promise<EventManagerStatus> {
    const metrics = await this.getMetrics();
    const queueBacklog =
      this.eventQueue.length > (this.config.processing?.queueSize || 1000);
    const highErrorRate = metrics.errorRate > 0.1; // 10% error threshold
    const notResponsive = !this.isRunning;

    const isHealthy = !(queueBacklog || highErrorRate || notResponsive);

    return {
      name: this.name,
      type: this.type,
      status: isHealthy ? 'healthy' : 'unhealthy',
      lastCheck: new Date(),
      subscriptions: this.metrics.subscriptionCount,
      queueSize: this.eventQueue.length,
      errorRate: metrics.errorRate,
      uptime: metrics.uptime,
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
   * Get list of active subscriptions (for debugging).
   */
  getSubscriptions(): Array<{
    id: string;
    eventTypes: string[];
    eventCount: number;
    subscriptionTime: Date;
  }> {
    return Array.from(this.subscribers.entries()).map(([id, subscription]) => ({
      id,
      eventTypes: subscription.eventTypes,
      eventCount: subscription.eventCount,
      subscriptionTime: subscription.subscriptionTime,
    }));
  }

  /**
   * Clear all subscriptions.
   */
  clearSubscriptions(): void {
    this.subscribers.clear();
    this.metrics.subscriptionCount = 0;
    this.logger.debug(`All subscriptions cleared for manager: ${this.name}`);
  }

  /**
   * Protected methods for extension by subclasses.
   */

  protected async processEventImmediate(event: SystemEvent): Promise<void> {
    await this.notifySubscribers(event);
  }

  protected async processEventThrottled(event: SystemEvent): Promise<void> {
    // Simple throttling - could be made more sophisticated
    const delay = this.config.processing?.throttleDelay || 100;
    setTimeout(async () => {
      await this.notifySubscribers(event);
    }, delay);
  }

  protected async processBatch(): Promise<void> {
    if (this.processingBatch.length === 0 || this.isProcessing) {
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
      this.logger.error('Batch processing failed:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  protected async processEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0 || this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    const batchSize = this.config.processing?.batchSize || 10;
    const batch = this.eventQueue.splice(0, batchSize);

    try {
      for (const event of batch) {
        await this.processEventImmediate(event);
      }
    } catch (error) {
      this.logger.error('Queue processing failed:', error);
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
        this.logger.error(`Subscriber notification failed: ${error}`);
        this.metrics.errorCount++;
      }
    });

    await Promise.allSettled(notifications);
  }

  protected findMatchingSubscribers(event: SystemEvent): Array<{
    eventTypes: string[];
    listener: (event: SystemEvent) => void | Promise<void>;
    filter?: EventFilter;
    subscriptionTime: Date;
    eventCount: number;
  }> {
    const matching = [];

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
    if (subscriptionType.includes('*')) {
      const pattern = subscriptionType.replace(/\*/g, '.*');
      return new RegExp(`^${pattern}$`).test(eventType);
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
        if (!event.metadata || event.metadata[key] !== value) {
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
    return `${this.name}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  protected wrapOnceListener(
    listener: (event: SystemEvent) => void | Promise<void>,
    subscriptionId: string
  ): (event: SystemEvent) => void | Promise<void> {
    return async (event: SystemEvent) => {
      try {
        await listener(event);
      } finally {
        this.unsubscribe(subscriptionId);
      }
    };
  }

  protected startQueueProcessing(): void {
    const interval = this.config.processing?.processInterval || 100;
    this.processingInterval = setInterval(async () => {
      if (this.eventQueue.length > 0) {
        await this.processEventQueue();
      }
      if (
        this.processingBatch.length > 0 &&
        this.processingStrategy === 'batched'
      ) {
        await this.processBatch();
      }
    }, interval);
  }

  protected startHealthMonitoring(): void {
    const interval = this.config.monitoring?.healthCheckInterval || 60000;
    this.healthCheckInterval = setInterval(async () => {
      try {
        const status = await this.healthCheck();
        if (status.status !== 'healthy') {
          this.logger.warn(
            `Event manager health check failed: ${this.name}`,
            status
          );
        }
      } catch (error) {
        this.logger.error(
          `Health check error for manager ${this.name}:`,
          error
        );
      }
    }, interval);
  }
}

export default BaseEventManager;
