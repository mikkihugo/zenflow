/**
 * Event Bus - Core event system for claude-zen
 * Provides centralized event handling and communication
 * Following Google TypeScript standards with strict typing
 */

import { EventEmitter } from 'node:events';
import type {
  EventBusConfig,
  EventListener,
  EventListenerAny,
  EventMap,
  EventMetrics,
  EventMiddleware,
} from '../types/event-types';

export interface IEventBus {
  on<T extends keyof EventMap>(event: T, listener: EventListener<T>): this;
  off<T extends keyof EventMap>(event: T, listener: EventListener<T>): this;
  emit<T extends keyof EventMap>(event: T, payload: EventMap[T]): boolean;
  once<T extends keyof EventMap>(event: T, listener: EventListener<T>): this;
}

/**
 * Unified Event Bus implementation
 * Extends Node.js EventEmitter with additional features
 */
export class EventBus extends EventEmitter implements IEventBus {
  private static instance: EventBus | null = null;
  private middleware: EventMiddleware[] = [];
  private metrics: {
    eventCount: number;
    eventTypes: Record<string, number>;
    avgProcessingTime: number;
    errorCount: number;
    listenerCount: number;
  };
  private config: EventBusConfig;

  constructor(config: Partial<EventBusConfig> = {}) {
    super();
    this.config = {
      maxListeners: 100,
      enableMiddleware: true,
      enableMetrics: true,
      enableLogging: false,
      logLevel: 'info',
      ...config,
    };
    this.setMaxListeners(this.config.maxListeners);
    this.metrics = {
      eventCount: 0,
      eventTypes: {},
      avgProcessingTime: 0,
      errorCount: 0,
      listenerCount: 0,
    };
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<EventBusConfig>): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus(config);
    }
    return EventBus.instance;
  }

  /**
   * Type-safe emit with error handling and middleware support
   */
  emit<T extends keyof EventMap>(event: T, payload: EventMap[T]): boolean {
    const startTime = Date.now();

    try {
      // Update metrics
      this.metrics.eventCount++;
      this.metrics.eventTypes[event as string] =
        (this.metrics.eventTypes[event as string] || 0) + 1;

      // Run middleware if enabled
      if (this.config.enableMiddleware && this.middleware.length > 0) {
        this.runMiddleware(event, payload);
      }

      // Log if enabled
      if (this.config.enableLogging) {
      }

      const result = super.emit(event as string, payload);

      // Update processing time metrics
      const processingTime = Date.now() - startTime;
      this.updateProcessingTimeMetrics(processingTime);

      return result;
    } catch (error) {
      this.metrics.errorCount++;
      console.error(`EventBus error in event '${String(event)}':`, error);
      return false;
    }
  }

  /**
   * Type-safe event listener registration
   */
  on<T extends keyof EventMap>(event: T, listener: EventListener<T>): this {
    super.on(event as string, listener as EventListenerAny);
    this.metrics.listenerCount++;
    return this;
  }

  /**
   * Type-safe once listener registration
   */
  once<T extends keyof EventMap>(event: T, listener: EventListener<T>): this {
    super.once(event as string, listener as EventListenerAny);
    this.metrics.listenerCount++;
    return this;
  }

  /**
   * Type-safe event listener removal
   */
  off<T extends keyof EventMap>(event: T, listener: EventListener<T>): this {
    super.off(event as string, listener as EventListenerAny);
    this.metrics.listenerCount = Math.max(0, this.metrics.listenerCount - 1);
    return this;
  }

  /**
   * Add middleware for event processing
   */
  use(middleware: EventMiddleware): void {
    this.middleware.push(middleware);
  }

  /**
   * Remove middleware
   */
  removeMiddleware(middleware: EventMiddleware): void {
    const index = this.middleware.indexOf(middleware);
    if (index > -1) {
      this.middleware.splice(index, 1);
    }
  }

  /**
   * Get event bus metrics
   */
  getMetrics(): EventMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
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
   * Run middleware chain
   */
  private runMiddleware<T extends keyof EventMap>(event: T, payload: EventMap[T]): void {
    let index = 0;

    const next = (): void => {
      if (index < this.middleware.length) {
        const middleware = this.middleware[index++];
        middleware(event, payload, next);
      }
    };

    next();
  }

  /**
   * Update processing time metrics
   */
  private updateProcessingTimeMetrics(processingTime: number): void {
    const totalTime =
      this.metrics.avgProcessingTime * (this.metrics.eventCount - 1) + processingTime;
    this.metrics.avgProcessingTime = totalTime / this.metrics.eventCount;
  }

  /**
   * Get event statistics
   */
  getStats(): { eventNames: string[]; listenerCount: number } {
    const eventNames = this.eventNames().map((name) => String(name));
    const listenerCount = eventNames.reduce((sum, name) => sum + this.listenerCount(name), 0);

    return {
      eventNames,
      listenerCount,
    };
  }
}

export default EventBus;
