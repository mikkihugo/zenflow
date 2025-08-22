import { EventEmitter } from '@claude-zen/foundation';
/**
 * @fileoverview Event Bus - Professional Battle-Tested Architecture
 *
 * High-performance event bus with battle-tested dependencies and foundation integration.
 *
 * **BATTLE-TESTED DEPENDENCIES INTEGRATED:**
 * - eventemitter3: High-performance event emitter (2x faster than Node.js EventEmitter)
 * - koa-compose: Battle-tested middleware composition used by Koa.js framework
 * - foundation error handling: Result patterns with neverthrow
 * - foundation DI: Injectable and singleton decorators
 * - foundation logging: Professional logging system
 *
 * Key Features:
 * - Type-safe event handling with strict typing
 * - Modern async middleware with koa-compose (battle-tested)
 * - Foundation dependency injection support
 * - Professional error handling with Result patterns
 * - High-performance eventemitter3 (2x faster than Node.js EventEmitter)
 * - Professional logging and metrics
 *
 * @example Basic event bus usage
 * ```typescript
 * import { EventBus } from '@claude-zen/event-system';
 *
 * const eventBus = new EventBus({
 *   maxListeners: 100,
 *   enableMetrics: true
 * });
 *
 * // Type-safe event handling
 * eventBus.on('userAction', (payload) => {
 *   console.log('User action:', payload);
 * });
 *
 * eventBus.emit('userAction', { action: 'click', target: 'button' });
 * ```
 */

import { TypedEventBase } from '@claude-zen/foundation';
import compose from 'koa-compose';
import {
  getLogger,
  injectable,
  singleton,
  Result,
  ok,
  err,
  safeAsync,
  recordMetric,
  recordHistogram,
  startTrace,
  withTrace,
  traced,
  metered,
} from '@claude-zen/foundation';

const logger = getLogger('EventBus');

export interface EventBusConfig {
  maxListeners: number;
  enableMiddleware: boolean;
  enableMetrics: boolean;
  enableLogging: boolean;
  enableTelemetry: boolean;
  logLevel: string;
}

export type EventListenerFunction = (event: unknown) => void'' | ''Promise<void>;

export interface EventMap {
  [key: string]: any;
}

export interface EventMetrics {
  eventCount: number;
  eventTypes: Record<string, number>;
  avgProcessingTime: number;
  errorCount: number;
  listenerCount: number;
}

// Modern koa-compose compatible middleware types
export interface EventContext {
  event: string'' | ''symbol;
  payload: unknown;
  timestamp: number;
  processedBy: string[];
}

export type EventMiddleware = (
  context: EventContext,
  next: () => Promise<void>
) => Promise<void>;

/**
 * Professional Event Bus with battle-tested dependencies and foundation integration.
 * Uses eventemitter3 for 2x performance improvement over Node.js EventEmitter.
 *
 * @example
 * ```typescript
 * const eventBus = new EventBus({
 *   maxListeners: 100,
 *   enableMetrics: true
 * });
 * ```
 */
@injectable()
@singleton()
export class EventBus extends TypedEventBase {
  private static instance: EventBus'' | ''null = null;
  private middleware: EventMiddleware[] = [];
  private metrics: EventMetrics;
  private config: EventBusConfig;

  constructor(config: Partial<EventBusConfig> = {}) {
    super();
    this.config = {
      maxListeners: 100,
      enableMiddleware: true,
      enableMetrics: true,
      enableLogging: true,
      enableTelemetry: true,
      logLevel:'info',
      ...config,
    };

    this.metrics = {
      eventCount: 0,
      eventTypes: {},
      avgProcessingTime: 0,
      errorCount: 0,
      listenerCount: 0,
    };
  }

  /**
   * Get singleton instance with foundation DI support.
   * Prefers dependency injection over static singleton.
   *
   * @param config - Optional configuration
   */
  static getInstance(config?: Partial<EventBusConfig>): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus(config);
    }
    return EventBus.instance;
  }

  /**
   * Initialize event bus with foundation integration.
   * Should be called after construction.
   */
  async initialize(): Promise<Result<void, Error>> {
    return safeAsync(async () => {
      logger.info('[EventBus] Initialized successfully', {
        config: this.config,
        metrics: this.metrics,
      });
    });
  }

  /**
   * Type-safe emit with foundation error handling and middleware.
   * Uses Result patterns for robust error handling.
   *
   * @param event - Event name
   * @param payload - Event payload
   * @returns Result<boolean, Error> - Success or error result
   */
  @traced('event.emit')
  @metered('event_bus_emit')
  async emitSafe(event: string, payload: any): Promise<Result<boolean, Error>> {
    return withTrace('event.emit', async (span) => {
      return safeAsync(async () => {
        const startTime = Date.now();

        // Record telemetry metrics
        if (this.config.enableTelemetry) {
          recordMetric('event_bus.events_total', 1, { event_type: event });
          recordMetric(
            'event_bus.active_listeners',
            this.listenerCount(event),
            { event_type: event }
          );
        }

        // Update local metrics
        this.metrics.eventCount++;
        this.metrics.eventTypes[event] =
          (this.metrics.eventTypes[event]'' | '''' | ''0) + 1;

        // Run middleware if enabled (now async with koa-compose)
        if (this.config.enableMiddleware && this.middleware.length > 0) {
          await this.runMiddleware(event, payload);
        }

        // Log if enabled
        if (this.config.enableLogging) {
          logger.info(`[EventBus] Emitting event: ${event}`, { payload });
        }

        // Use eventemitter3's emit (faster than Node.js EventEmitter)
        const result = super.emit(event, payload);

        // Update processing time metrics and telemetry
        const processingTime = Date.now() - startTime;
        this.updateProcessingTimeMetrics(processingTime);

        if (this.config.enableTelemetry) {
          recordHistogram('event_bus.processing_duration', processingTime, {
            event_type: event,
          });
          span?.setAttributes({
            'event.result': result,
            'event.processing_time_ms': processingTime,
            'event.middleware_count': this.middleware.length,
          });
        }

        return result;
      });
    });
  }

  /**
   * Legacy emit method for compatibility.
   * For async middleware support, use emitSafe() instead.
   *
   * @param event - Event name
   * @param payload - Event payload
   */
  override emit(event: string'' | ''symbol, payload?: any): boolean {
    const startTime = Date.now();

    try {
      // Update metrics
      this.metrics.eventCount++;
      const eventKey = String(event);
      this.metrics.eventTypes[eventKey] =
        (this.metrics.eventTypes[eventKey]'' | '''' | ''0) + 1;

      // Handle middleware for synchronous usage
      if (this.config.enableMiddleware && this.middleware.length > 0) {
        // For synchronous emit, run middleware without await
        // Note: This may not complete middleware processing
        this.runMiddleware(String(event), payload).catch((error) => {
          this.metrics.errorCount++;
          logger.error(
            `[EventBus] Middleware error in sync emit for'${String(event)}':`,
            error
          );
        });
      }

      // Log if enabled
      if (this.config.enableLogging) {
        logger.info(`[EventBus] Emitting event: ${String(event)}`, { payload });
      }

      // Use eventemitter3's emit (faster than Node.js EventEmitter)
      const result = super.emit(event, payload);

      // Update processing time metrics
      const processingTime = Date.now() - startTime;
      this.updateProcessingTimeMetrics(processingTime);

      return result;
    } catch (error) {
      this.metrics.errorCount++;
      logger.error(`[EventBus] Error in event '${String(event)}':`, error);
      return false;
    }
  }

  /**
   * Type-safe event listener registration with telemetry.
   */
  override on(event: string'' | ''symbol, listener: EventListenerFunction): this {
    super.on(event, listener);
    this.metrics.listenerCount++;

    // Record telemetry
    if (this.config.enableTelemetry) {
      recordMetric('event_bus.listeners_registered', 1, {
        event_type: String(event),
      });
      recordMetric('event_bus.total_listeners', this.metrics.listenerCount);
    }

    return this;
  }

  /**
   * Type-safe once listener registration.
   */
  override once(event: string'' | ''symbol, listener: EventListenerFunction): this {
    super.once(event, listener);
    this.metrics.listenerCount++;
    return this;
  }

  /**
   * Type-safe event listener removal with telemetry.
   */
  override off(event: string'' | ''symbol, listener: EventListenerFunction): this {
    super.off(event, listener);
    this.metrics.listenerCount = Math.max(0, this.metrics.listenerCount - 1);

    // Record telemetry
    if (this.config.enableTelemetry) {
      recordMetric('event_bus.listeners_removed', 1, {
        event_type: String(event),
      });
      recordMetric('event_bus.total_listeners', this.metrics.listenerCount);
    }

    return this;
  }

  /**
   * Add middleware for event processing with telemetry.
   */
  use(middleware: EventMiddleware): void {
    this.middleware.push(middleware);

    // Record telemetry
    if (this.config.enableTelemetry) {
      recordMetric('event_bus.middleware_added', 1);
      recordMetric('event_bus.middleware_count', this.middleware.length);
    }
  }

  /**
   * Remove middleware.
   */
  removeMiddleware(middleware: EventMiddleware): void {
    const index = this.middleware.indexOf(middleware);
    if (index > -1) {
      this.middleware.splice(index, 1);
    }
  }

  /**
   * Get event bus metrics.
   */
  getMetrics(): EventMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics.
   */
  resetMetrics(): void {
    this.metrics = {
      eventCount: 0,
      eventTypes: {},
      avgProcessingTime: 0,
      errorCount: 0,
      listenerCount: 0,
    };
  }

  /**
   * Run middleware chain using battle-tested koa-compose.
   * Provides async middleware support and proper error handling.
   */
  private async runMiddleware(event: string, payload: any): Promise<void> {
    if (this.middleware.length === 0) return;

    // Create context for middleware
    const context: EventContext = {
      event,
      payload,
      timestamp: Date.now(),
      processedBy: [],
    };

    // Use koa-compose for battle-tested middleware composition
    const composedMiddleware = compose(this.middleware);

    try {
      await composedMiddleware(context, async () => {
        // Empty next function - middleware chain completes here
      });
    } catch (error) {
      this.metrics.errorCount++;

      // Record telemetry for middleware errors
      if (this.config.enableTelemetry) {
        recordMetric('event_bus.middleware_errors', 1, { event_type: event });
      }

      logger.error(`[EventBus] Middleware error for event '${event}':`, error);
      throw error; // Re-throw to let caller handle
    }
  }

  /**
   * Update processing time metrics.
   */
  private updateProcessingTimeMetrics(processingTime: number): void {
    const totalTime =
      this.metrics.avgProcessingTime * (this.metrics.eventCount - 1) +
      processingTime;
    this.metrics.avgProcessingTime = totalTime / this.metrics.eventCount;
  }

  /**
   * Get event statistics.
   */
  getStats(): { eventNames: string[]; listenerCount: number } {
    const eventNames = this.eventNames().map((name) => String(name));
    const listenerCount = eventNames.reduce(
      (sum, name) => sum + this.listenerCount(name),
      0
    );

    return {
      eventNames,
      listenerCount,
    };
  }
}

export default EventBus;
