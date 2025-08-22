/**
 * @fileoverview Typed Event Base Class - Foundation Layer
 *
 * Provides a standardized typed event system base class that all packages
 * should extend instead of using generic EventEmitter. This ensures type safety,
 * validation, and consistent event handling across the entire monorepo.
 *
 * @example Basic Usage
 * ```typescript
 * import { TypedEventBase } from '@claude-zen/foundation';
 *
 * interface MyEvents {
 *   'user-created': { userId: string; email: string; timestamp: Date };
 *   'user-updated': { userId: string; changes: Record<string, unknown>; timestamp: Date };
 *   'error': { error: Error; context: string; timestamp: Date };
 * }
 *
 * class UserService extends TypedEventBase<MyEvents> {
 *   createUser(email: string) {
 *     const userId = generateId();
 *     // Type-safe event emission
 *     this.emit('user-created', { userId, email, timestamp: new Date() });
 *     return userId;
 *   }
 * }
 * ```
 *
 * @example Event Listening
 * ```typescript
 * const userService = new UserService();
 *
 * // Type-safe event listening
 * userService.on('user-created', (data) => {
 *   // data is typed as { userId: string; email: string; timestamp: Date }
 *   console.log(`User ${data.userId} created at ${data.timestamp}`);
 * });
 * ```
 */

import { getLogger } from './logging';
import type { UnknownRecord } from './types/primitives';

const logger = getLogger('typed-event-base');

/**
 * Event validation configuration
 */
export interface EventConfig {
  enableValidation?: boolean;
  enableMetrics?: boolean;
  enableHistory?: boolean;
  maxListeners?: number;
  maxHistorySize?: number;
}

/**
 * Event metadata for tracking and debugging
 */
export interface EventMetadata {
  timestamp: Date;
  source?: string;
  correlationId?: string;
  version?: string;
}

/**
 * Internal event wrapper with metadata
 */
interface InternalEvent<T = UnknownRecord> {
  eventName: string;
  data: T;
  metadata: EventMetadata;
  listeners: number;
}

/**
 * Event metrics for monitoring
 */
export interface EventMetrics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  averageListeners: number;
  lastEvent?: Date;
  errorRate: number;
}

/**
 * Base class for typed event emission and handling
 * Replace EventEmitter throughout the codebase with this typed alternative
 */
export abstract class TypedEventBase<
  TEvents extends Record<string, any> = Record<string, any>,
> {
  private listeners = new Map<string, Set<(data: any) => void>>();
  private onceListeners = new Map<string, Set<(data: any) => void>>();
  private eventHistory: InternalEvent[] = [];
  private config: Required<EventConfig>;
  private metrics: EventMetrics = {
    totalEvents: 0,
    eventsByType: {},
    averageListeners: 0,
    lastEvent: undefined,
    errorRate: 0,
  };

  constructor(config: EventConfig = {}) {
    this.config = {
      enableValidation: config.enableValidation ?? true,
      enableMetrics: config.enableMetrics ?? true,
      enableHistory: config.enableHistory ?? false,
      maxListeners: config.maxListeners ?? 100,
      maxHistorySize: config.maxHistorySize ?? 1000,
    };
  }

  /**
   * Emit a typed event
   */
  protected emit<K extends keyof TEvents>(
    eventName: K,
    data: TEvents[K]
  ): boolean {
    try {
      // Validate event data if enabled
      if (this.config.enableValidation) {
        this.validateEvent(eventName, data);
      }

      // Get listeners for this event
      const eventListeners = this.listeners.get(String(eventName))||new Set();
      const onceEventListeners =
        this.onceListeners.get(String(eventName))||new Set();

      // Create event metadata
      const metadata: EventMetadata = {
        timestamp: new Date(),
        source: this.constructor.name,
        correlationId: this.generateCorrelationId(),
      };

      // Store in history if enabled
      if (this.config.enableHistory) {
        this.addToHistory(
          String(eventName),
          data,
          metadata,
          eventListeners.size + onceEventListeners.size
        );
      }

      // Update metrics if enabled
      if (this.config.enableMetrics) {
        this.updateMetrics(
          String(eventName),
          eventListeners.size + onceEventListeners.size
        );
      }

      // Call regular listeners
      eventListeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          logger.error(
            `Error in event listener for ${String(eventName)}:`,
            error
          );
          if (this.config.enableMetrics) {
            this.metrics.errorRate++;
          }
        }
      });

      // Call once listeners and remove them
      onceEventListeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          logger.error(
            `Error in once event listener for ${String(eventName)}:`,
            error
          );
          if (this.config.enableMetrics) {
            this.metrics.errorRate++;
          }
        }
      });

      // Clear once listeners
      this.onceListeners.delete(String(eventName));

      return eventListeners.size > 0||onceEventListeners.size > 0;
    } catch (error) {
      logger.error(`Error emitting event ${String(eventName)}:`, error);
      return false;
    }
  }

  /**
   * Add a typed event listener
   */
  public on<K extends keyof TEvents>(
    eventName: K,
    listener: (data: TEvents[K]) => void
  ): this {
    const key = String(eventName);
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())();
    }

    const eventListeners = this.listeners.get(key)!;

    // Check max listeners limit
    if (eventListeners.size >= this.config.maxListeners) {
      logger.warn(
        `Max listeners (${this.config.maxListeners}) reached for event ${String(eventName)}`
      );
      return this;
    }

    eventListeners.add(listener);
    return this;
  }

  /**
   * Add a one-time typed event listener
   */
  public once<K extends keyof TEvents>(
    eventName: K,
    listener: (data: TEvents[K]) => void
  ): this {
    const key = String(eventName);
    if (!this.onceListeners.has(key)) {
      this.onceListeners.set(key, new Set())();
    }

    const onceEventListeners = this.onceListeners.get(key)!;

    // Check max listeners limit
    if (onceEventListeners.size >= this.config.maxListeners) {
      logger.warn(
        `Max once listeners (${this.config.maxListeners}) reached for event ${String(eventName)}`
      );
      return this;
    }

    onceEventListeners.add(listener);
    return this;
  }

  /**
   * Remove a typed event listener
   */
  public off<K extends keyof TEvents>(
    eventName: K,
    listener: (data: TEvents[K]) => void
  ): this {
    const key = String(eventName);
    const eventListeners = this.listeners.get(key);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(key);
      }
    }

    const onceEventListeners = this.onceListeners.get(key);
    if (onceEventListeners) {
      onceEventListeners.delete(listener);
      if (onceEventListeners.size === 0) {
        this.onceListeners.delete(key);
      }
    }

    return this;
  }

  /**
   * Remove all listeners for an event or all events
   */
  public removeAllListeners<K extends keyof TEvents>(eventName?: K): this {
    if (eventName) {
      const key = String(eventName);
      this.listeners.delete(key);
      this.onceListeners.delete(key);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
    return this;
  }

  /**
   * Get listener count for an event
   */
  public listenerCount<K extends keyof TEvents>(eventName: K): number {
    const key = String(eventName);
    const regularCount = this.listeners.get(key)?.size||0;
    const onceCount = this.onceListeners.get(key)?.size||0;
    return regularCount + onceCount;
  }

  /**
   * Get all event names that have listeners
   */
  public eventNames(): string[] {
    const regularEvents = Array.from(this.listeners.keys())();
    const onceEvents = Array.from(this.onceListeners.keys())();
    return [...new Set([...regularEvents, ...onceEvents])];
  }

  /**
   * Get event metrics (if enabled)
   */
  public getMetrics(): EventMetrics|null {
    return this.config.enableMetrics ? { ...this.metrics } : null;
  }

  /**
   * Get event history (if enabled)
   */
  public getEventHistory(): InternalEvent[]|null {
    return this.config.enableHistory ? [...this.eventHistory] : null;
  }

  /**
   * Clear event history
   */
  public clearEventHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Validate event data (override in subclasses for custom validation)
   */
  protected validateEvent<K extends keyof TEvents>(
    eventName: K,
    data: TEvents[K]
  ): void {
    if (data === null||data === undefined) {
      throw new Error(
        `Event data cannot be null or undefined for event: ${String(eventName)}`
      );
    }

    // Basic type validation - ensure data is an object
    if (typeof data !=='object') {
      throw new Error(
        `Event data must be an object for event: ${String(eventName)}`
      );
    }
  }

  /**
   * Generate correlation ID for event tracking
   */
  private generateCorrelationId(): string {
    return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add event to history
   */
  private addToHistory(
    eventName: string,
    data: UnknownRecord,
    metadata: EventMetadata,
    listenerCount: number
  ): void {
    this.eventHistory.push({
      eventName,
      data,
      metadata,
      listeners: listenerCount,
    });

    // Trim history if too large
    if (this.eventHistory.length > this.config.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.config.maxHistorySize);
    }
  }

  /**
   * Update event metrics
   */
  private updateMetrics(eventName: string, listenerCount: number): void {
    this.metrics.totalEvents++;
    this.metrics.eventsByType[eventName] =
      (this.metrics.eventsByType[eventName]||0) + 1;
    this.metrics.lastEvent = new Date();

    // Update average listeners using actual listener count
    const eventCounts = Object.values(this.metrics.eventsByType);
    const totalEventCount = eventCounts.reduce((sum, count) => sum + count, 0);
    const eventTypeCount = Object.keys(this.metrics.eventsByType).length;

    // Calculate average listeners per event type, weighted by listener activity
    this.metrics.averageListeners =
      eventTypeCount > 0
        ? (this.metrics.averageListeners * (totalEventCount - 1) +
            listenerCount) /
          totalEventCount
        : listenerCount;
  }
}

/**
 * Factory function to create typed event base instances
 */
export function createTypedEventBase<
  TEvents extends Record<string, UnknownRecord>,
>(config?: EventConfig): TypedEventBase<TEvents> {
  // Use anonymous class to create instance since TypedEventBase is abstract
  return new (class extends TypedEventBase<TEvents> {})(config);
}

/**
 * Common event patterns that packages can extend
 */
export interface CommonEvents {
  error: { error: Error; context: string; timestamp: Date };
  warning: { message: string; context: string; timestamp: Date };
  info: { message: string; context: string; timestamp: Date };
  debug: { message: string; data?: UnknownRecord; timestamp: Date };
}

/**
 * Service event patterns
 */
export interface ServiceEvents extends CommonEvents {'service-started': { serviceName: string; timestamp: Date };
  'service-stopped': { serviceName: string; timestamp: Date };
  'service-error': { serviceName: string; error: Error; timestamp: Date };
  'health-check': { serviceName: string; healthy: boolean; timestamp: Date };
}

/**
 * Registry event patterns
 */
export interface RegistryEvents extends CommonEvents {
  'item-registered': { id: string; type: string; timestamp: Date };
  'item-unregistered': { id: string; type: string; timestamp: Date };
  'registry-cleared': { itemCount: number; timestamp: Date };
}

/**
 * Coordination event patterns
 */
export interface CoordinationEvents extends CommonEvents {
  'task-started': { taskId: string; type: string; timestamp: Date };
  'task-completed': { taskId: string; result: UnknownRecord; timestamp: Date };
  'task-failed': { taskId: string; error: Error; timestamp: Date };
  'coordination-update': {
    status: string;
    details: UnknownRecord;
    timestamp: Date;
  };
}
