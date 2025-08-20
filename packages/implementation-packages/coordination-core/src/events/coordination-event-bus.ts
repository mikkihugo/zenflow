/**
 * @fileoverview Coordination Event Bus
 * 
 * Coordination-specific event bus extending our existing event-system.
 */

import { getLogger } from '@claude-zen/foundation';
import type { CoordinationEventType } from './coordination-events';

const logger = getLogger('coordination-event-bus');

/**
 * Coordination Event Bus extending the existing event system.
 * Uses a simplified event emitter for coordination-specific events.
 */
export class CoordinationEventBus {
  private static instance: CoordinationEventBus;
  private listeners = new Map<string, Set<(event: any) => void>>();

  private constructor() {
    logger.info('Coordination Event Bus initialized');
  }

  /**
   * Get singleton instance.
   */
  static getInstance(): CoordinationEventBus {
    if (!CoordinationEventBus.instance) {
      CoordinationEventBus.instance = new CoordinationEventBus();
    }
    return CoordinationEventBus.instance;
  }

  /**
   * Subscribe to coordination events.
   */
  on<T extends CoordinationEventType>(
    eventType: T['type'],
    handler: (event: T) => Promise<void> | void
  ): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler);
  }

  /**
   * Subscribe to coordination events once.
   */
  once<T extends CoordinationEventType>(
    eventType: T['type'],
    handler: (event: T) => Promise<void> | void
  ): void {
    const wrappedHandler = async (event: T) => {
      await handler(event);
      this.off(eventType, wrappedHandler);
    };
    this.on(eventType, wrappedHandler);
  }

  /**
   * Unsubscribe from events.
   */
  off<T extends CoordinationEventType>(
    eventType: T['type'],
    handler?: (event: T) => Promise<void> | void
  ): void {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      if (handler) {
        eventListeners.delete(handler);
      } else {
        eventListeners.clear();
      }
    }
  }

  /**
   * Emit coordination event.
   */
  async emit<T extends CoordinationEventType>(event: T): Promise<void> {
    try {
      const eventListeners = this.listeners.get(event.type);
      if (eventListeners) {
        const promises: Promise<void>[] = [];
        for (const handler of eventListeners) {
          try {
            const result = handler(event);
            // Check if the result is a Promise by checking for then method
            if (typeof (result as any)?.then === 'function') {
              promises.push(result as unknown as Promise<void>);
            }
          } catch (error) {
            logger.error('Error in event handler:', error);
          }
        }
        if (promises.length > 0) {
          await Promise.all(promises);
        }
      }
      logger.debug(`Emitted coordination event: ${event.type}`, { eventId: event.id });
    } catch (error) {
      logger.error(`Failed to emit coordination event ${event.type}:`, error);
      throw error;
    }
  }

  /**
   * Create and emit event with automatic ID and timestamp.
   */
  async createAndEmit<T extends Omit<CoordinationEventType, 'id' | 'timestamp'>>(
    eventData: T
  ): Promise<void> {
    const event = {
      ...eventData,
      id: `coord-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    } as unknown as CoordinationEventType;

    await this.emit(event);
  }

  /**
   * Subscribe to all events (wildcard).
   */
  onAll(
    handler: (event: CoordinationEventType) => Promise<void> | void
  ): void {
    this.on('*' as any, handler);
  }

  /**
   * Subscribe to multiple event types.
   */
  onMultiple(
    eventTypes: string[],
    handler: (event: CoordinationEventType) => Promise<void> | void
  ): void {
    eventTypes.forEach(eventType => {
      this.on(eventType as any, handler);
    });
  }

  /**
   * Get event bus statistics.
   */
  getStats() {
    let totalHandlers = 0;
    for (const handlers of this.listeners.values()) {
      totalHandlers += handlers.size;
    }
    return {
      timestamp: Date.now(),
      active: true,
      eventTypes: this.listeners.size,
      totalHandlers
    };
  }

  /**
   * Clear all event handlers.
   */
  clear(): void {
    this.listeners.clear();
    logger.info('All coordination event handlers cleared');
  }

  /**
   * Shutdown the coordination event bus.
   */
  async shutdown(): Promise<void> {
    await this.createAndEmit({
      type: 'system:shutdown',
      source: 'coordination-event-bus',
      reason: 'Manual shutdown',
      activeAgents: 0,
      completedOperations: 0
    });

    this.clear();
    logger.info('Coordination Event Bus shutdown complete');
  }
}