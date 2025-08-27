/**
 * @fileoverview Event Bus - Modern TypeScript Event System
 * 
 * Clean, modern event bus with TypeScript generics:
 * - Full type safety through generic event maps
 * - Professional middleware support with koa-compose pattern
 * - Comprehensive metrics and telemetry
 * - High-performance EventEmitter from foundation
 * - Async/await support with Result patterns
 */

import { EventEmitter } from './event-emitter.js';

// Simple logger for event-system to avoid circular dependency
// Production-ready: Use structured logging instead of direct console
const logger = {
  info: (msg: string, data?: unknown) => {
    // Use structured logging in production
    process.stdout.write(`${JSON.stringify({
      level: 'info',
      component: 'EventBus',
      message: msg,
      data: data || null,
      timestamp: new Date().toISOString()
    })}\n`);
  },
  error: (msg: string, data?: unknown) => {
    process.stderr.write(`${JSON.stringify({
      level: 'error', 
      component: 'EventBus',
      message: msg,
      data: data || null,
      timestamp: new Date().toISOString()
    })}\n`);
  },
  warn: (msg: string, data?: unknown) => {
    process.stderr.write(`${JSON.stringify({
      level: 'warn',
      component: 'EventBus', 
      message: msg,
      data: data || null,
      timestamp: new Date().toISOString()
    })}\n`);
  },
  debug: (msg: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
      process.stdout.write(`${JSON.stringify({
        level: 'debug',
        component: 'EventBus',
        message: msg, 
        data: data || null,
        timestamp: new Date().toISOString()
      })}\n`);
    }
  }
};

// Simple Result type to avoid foundation dependency
type Result<T, E> = { isOk(): boolean; isErr(): boolean; value?: T; error?: E };
const safeAsync = async <T>(fn: () => Promise<T>): Promise<Result<T, Error>> => {
  try {
    const result = await fn();
    return { isOk: () => true, isErr: () => false, value: result };
  } catch (error) {
    return { isOk: () => false, isErr: () => true, error: error as Error };
  }
};

export interface EventBusConfig {
  maxListeners?: number;
  enableMiddleware?: boolean;
  enableMetrics?: boolean;
  enableLogging?: boolean;
  logLevel?: string;
}

export type EventListener<T = unknown> = (event: T) => void | Promise<void>;

export interface EventMetrics {
  eventCount: number;
  eventTypes: Record<string, number>;
  avgProcessingTime: number;
  errorCount: number;
  listenerCount: number;
}

export interface EventContext {
  event: string | symbol;
  payload: unknown;
  timestamp: number;
  processedBy: string[];
}

export type EventMiddleware = (
  context: EventContext,
  next: () => Promise<void>
) => Promise<void>;

export interface Event<T = unknown> {
  type: string;
  payload: T;
  timestamp: Date;
  id: string;
}

/**
 * Modern Event Bus with full TypeScript generics, middleware, metrics, and professional features.
 * Single implementation replacing all previous event system variants.
 * 
 * @example
 * ```typescript
 * // Define your event map
 * interface MyEvents {
 *   userAction: { action: string; target: string };
 *   systemEvent: { type: string; data: unknown };
 * }
 * 
 * // Create fully typed event bus
 * const eventBus = new EventBus<MyEvents>();
 * 
 * // Fully typed listeners
 * eventBus.on('userAction', (payload) => {
 *   // payload is typed as { action: string; target: string }
 *   console.log(payload.action, payload.target);
 * });
 * 
 * // Fully typed emission
 * eventBus.emit('userAction', { action: 'click', target: 'button' });
 * ```
 */
export class EventBus<TEventMap extends Record<string, unknown> = Record<string, unknown>> extends EventEmitter {
  private static instance: EventBus | null = null;
  private middleware: EventMiddleware[] = [];
  private busMetrics: EventMetrics;
  private busConfig: Required<EventBusConfig>;

  constructor(config: EventBusConfig = {}) {
    super();
    this.busConfig = {
      maxListeners: 100,
      enableMiddleware: true,
      enableMetrics: true,
      enableLogging: false,
      logLevel: 'info',
      ...config,
    };

    this.setMaxListeners(this.busConfig.maxListeners);

    this.busMetrics = {
      eventCount: 0,
      eventTypes: {},
      avgProcessingTime: 0,
      errorCount: 0,
      listenerCount: 0,
    };
  }

  /**
   * Get singleton instance.
   */
  static getInstance<T extends Record<string, unknown> = Record<string, unknown>>(
    config?: EventBusConfig
  ): EventBus<T> {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus<T>(config);
    }
    return EventBus.instance as EventBus<T>;
  }

  /**
   * Initialize event bus with proper async operations.
   */
  async initialize(): Promise<Result<void, Error>> {
    return safeAsync(async () => {
      // Validate configuration
      if (this.busConfig.maxListeners < 1) {
        throw new Error('maxListeners must be at least 1');
      }

      // Initialize metrics if enabled
      if (this.busConfig.enableMetrics) {
        this.resetMetrics();
        // Emit initialization event
        this.emit('eventbus:initialized', { timestamp: Date.now() });
      }

      // Set up error handling
      this.on('error', (error) => {
        if (this.busConfig.enableLogging) {
          logger.error('EventBus error', error);
        }
        if (this.busConfig.enableMetrics) {
          this.busMetrics.errorCount++;
        }
      });

      if (this.busConfig.enableLogging) {
        logger.info('Event bus initialized', {
          config: this.busConfig,
          metrics: this.busMetrics,
        });
      }

      // Small delay to ensure proper initialization order
      await new Promise(resolve => setTimeout(resolve, 1));
    });
  }

  // =============================================================================
  // CORE EVENT METHODS - Fully typed with generics
  // =============================================================================

  /**
   * Emit event with full generic type checking.
   */
  override emit<K extends keyof TEventMap>(eventType: K, payload: TEventMap[K]): boolean;
  override emit(event: string | symbol, payload?: unknown): boolean;
  override emit(event: string | symbol, payload?: unknown): boolean {
    const startTime = Date.now();

    try {
      // Update metrics
      if (this.busConfig.enableMetrics) {
        this.busMetrics.eventCount++;
        const eventKey = String(event);
        this.busMetrics.eventTypes[eventKey] = (this.busMetrics.eventTypes[eventKey] || 0) + 1;
      }

      // Handle middleware for synchronous usage
      if (this.busConfig.enableMiddleware && this.middleware.length > 0) {
        this.runMiddleware(String(event), payload).catch((error) => {
          if (this.busConfig.enableMetrics) this.busMetrics.errorCount++;
          if (this.busConfig.enableLogging) {
            logger.error(`Middleware error in sync emit for '${String(event)}':`, error);
          }
        });
      }

      // Log if enabled
      if (this.busConfig.enableLogging) {
        logger.info(`Emitting event: ${String(event)}`, { payload });
      }

      // Emit event
      const result = super.emit(String(event), payload);

      // Update processing time metrics
      if (this.busConfig.enableMetrics) {
        const processingTime = Date.now() - startTime;
        this.updateProcessingTimeMetrics(processingTime);
      }

      return result;
    } catch (error) {
      if (this.busConfig.enableMetrics) this.busMetrics.errorCount++;
      if (this.busConfig.enableLogging) {
        logger.error(`Error in event '${String(event)}':`, error);
      }
      return false;
    }
  }

  /**
   * Async emit with middleware and error handling.
   */
  async emitSafe<K extends keyof TEventMap>(
    eventType: K, 
    payload: TEventMap[K]
  ): Promise<Result<boolean, Error>>;
  async emitSafe(event: string, payload: unknown): Promise<Result<boolean, Error>>;
  async emitSafe(event: string, payload: unknown): Promise<Result<boolean, Error>> {
    return safeAsync(async () => {
      const startTime = Date.now();

      // Update metrics
      if (this.busConfig.enableMetrics) {
        this.busMetrics.eventCount++;
        this.busMetrics.eventTypes[event] = (this.busMetrics.eventTypes[event] || 0) + 1;
      }

      // Run middleware if enabled
      if (this.busConfig.enableMiddleware && this.middleware.length > 0) {
        await this.runMiddleware(event, payload);
      }

      // Log if enabled
      if (this.busConfig.enableLogging) {
        logger.info(`Emitting event: ${event}`, { payload });
      }

      // Emit event
      const result = super.emit(String(event), payload);

      // Update processing time metrics
      if (this.busConfig.enableMetrics) {
        const processingTime = Date.now() - startTime;
        this.updateProcessingTimeMetrics(processingTime);
      }

      return result;
    });
  }

  /**
   * Add event listener with full generic type checking.
   */
  override on<K extends keyof TEventMap>(
    eventType: K, 
    listener: (payload: TEventMap[K]) => void | Promise<void>
  ): this;
  override on(event: string | symbol, listener: EventListener): this;
  override on(event: string | symbol | keyof TEventMap, listener: EventListener): this {
    super.on(String(event), listener);
    if (this.busConfig.enableMetrics) {
      this.busMetrics.listenerCount++;
    }
    return this;
  }

  /**
   * Add one-time event listener with full generic type checking.
   */
  override once<K extends keyof TEventMap>(
    eventType: K, 
    listener: (payload: TEventMap[K]) => void | Promise<void>
  ): this;
  override once(event: string | symbol, listener: EventListener): this;
  override once(event: string | symbol | keyof TEventMap, listener: EventListener): this {
    super.once(String(event), listener);
    if (this.busConfig.enableMetrics) {
      this.busMetrics.listenerCount++;
    }
    return this;
  }

  /**
   * Remove event listener with full generic type checking.
   */
  override off<K extends keyof TEventMap>(
    eventType: K, 
    listener: (payload: TEventMap[K]) => void | Promise<void>
  ): this;
  override off(event: string | symbol, listener: EventListener): this;
  override off(event: string | symbol | keyof TEventMap, listener: EventListener): this {
    super.off(String(event), listener);
    if (this.busConfig.enableMetrics) {
      this.busMetrics.listenerCount = Math.max(0, this.busMetrics.listenerCount - 1);
    }
    return this;
  }

  // =============================================================================
  // MIDDLEWARE SUPPORT
  // =============================================================================

  /**
   * Add middleware for event processing.
   */
  use(middleware: EventMiddleware): void {
    this.middleware.push(middleware);
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

  // =============================================================================
  // METRICS AND MONITORING
  // =============================================================================

  /**
   * Get event bus metrics.
   */
  getMetrics(): EventMetrics {
    return { ...this.busMetrics };
  }

  /**
   * Get configuration.
   */
  getConfig(): Required<EventBusConfig> {
    return { ...this.busConfig };
  }

  /**
   * Reset metrics.
   */
  resetMetrics(): void {
    this.busMetrics = {
      eventCount: 0,
      eventTypes: {},
      avgProcessingTime: 0,
      errorCount: 0,
      listenerCount: 0,
    };
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

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  /**
   * Run middleware chain using koa-compose pattern.
   */
  private async runMiddleware(event: string, payload: unknown): Promise<void> {
    if (this.middleware.length === 0) return;

    const context: EventContext = {
      event,
      payload,
      timestamp: Date.now(),
      processedBy: [],
    };

    try {
      let index = 0;
      const dispatch = async (i: number): Promise<void> => {
        if (i <= index) return Promise.reject(new Error('next() called multiple times'));
        index = i;
        let fn: EventMiddleware | undefined = this.middleware[i];
        if (i === this.middleware.length) fn = undefined;
        if (!fn) return;
        try {
          return await fn(context, dispatch.bind(null, i + 1));
        } catch (error) {
          return Promise.reject(error);
        }
      };
      await dispatch(0);
    } catch (error) {
      if (this.busConfig.enableMetrics) this.busMetrics.errorCount++;
      if (this.busConfig.enableLogging) {
        logger.error(`Middleware error for event '${event}':`, error);
      }
      throw error;
    }
  }

  /**
   * Update processing time metrics.
   */
  private updateProcessingTimeMetrics(processingTime: number): void {
    const totalTime =
      this.busMetrics.avgProcessingTime * (this.busMetrics.eventCount - 1) +
      processingTime;
    this.busMetrics.avgProcessingTime = totalTime / this.busMetrics.eventCount;
  }
}

export default EventBus;