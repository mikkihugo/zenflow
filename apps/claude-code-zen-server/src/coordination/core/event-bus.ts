/**
 * @file Event bus for coordinating system-wide events and messaging
 *
 * TYPED EVENT SYSTEM:
 * Uses our own TypedEventBase from @claude-zen/foundation for type-safe event coordination.
 * This provides a robust event system for internal coordination without external dependencies.
 */

import { TypedEventBase, getLogger } from '@claude-zen/foundation';
import type { Logger } from '@claude-zen/foundation';

export interface SystemEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: Date;
  source: string;
}

export interface EventBusInterface {
  emit(eventName: string | symbol, ...args: any[]): boolean;
  emitSystemEvent(event: SystemEvent): Promise<boolean>;
  on(eventType: string | symbol, handler: (...args: any[]) => void): this;
  off(eventType: string | symbol, handler: (...args: any[]) => void): this;
  once(eventType: string | symbol, handler: (...args: any[]) => void): this;
  removeAllListeners(eventType?: string | symbol): this;
}

export class EventBus extends TypedEventBase implements EventBusInterface {
  private static instance: EventBus;
  private eventHistory: SystemEvent[] = [];
  private maxHistorySize = 1000;
  private logger: Logger;

  constructor() {
    super();
    this.logger = getLogger('EventBus', { level: 'INFO' });
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  async emitSystemEvent(event: SystemEvent): Promise<boolean> {
    try {
      // Store in history
      this.eventHistory.push(event);
      if (this.eventHistory.length > this.maxHistorySize) {
        this.eventHistory.shift();
      }

      // Emit using our TypedEventBase system
      this.emit(event.type, event);
      
      this.logger.debug('System event emitted', {
        eventId: event.id,
        type: event.type,
        source: event.source
      });
      
      return true;
    } catch (error) {
      this.logger.error('Failed to emit system event', { error, event });
      return false;
    }
  }

  emit(eventName: string | symbol, ...args: any[]): boolean {
    try {
      // Use TypedEventBase emit method
      super.emit(eventName, ...args);
      return true;
    } catch (error) {
      this.logger.error('Failed to emit event', { eventName, error });
      return false;
    }
  }

  on(eventType: string | symbol, handler: (...args: any[]) => void): this {
    super.on(eventType, handler);
    return this;
  }

  off(eventType: string | symbol, handler: (...args: any[]) => void): this {
    super.off(eventType, handler);
    return this;
  }

  once(eventType: string | symbol, handler: (...args: any[]) => void): this {
    super.once(eventType, handler);
    return this;
  }

  removeAllListeners(eventType?: string | symbol): this {
    super.removeAllListeners(eventType);
    return this;
  }

  /**
   * Create a system event with proper metadata
   */
  createSystemEvent(
    type: string,
    payload: Record<string, unknown>,
    source: string = 'coordination-system'
  ): SystemEvent {
    return {
      id: this.generateEventId(),
      type,
      payload,
      timestamp: new Date(),
      source
    };
  }

  /**
   * Get event history for debugging/monitoring
   */
  getEventHistory(eventType?: string, limit?: number): SystemEvent[] {
    let events = eventType 
      ? this.eventHistory.filter((event) => event.type === eventType)
      : [...this.eventHistory];
    
    return limit ? events.slice(-limit) : events;
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
    this.logger.info('Event history cleared');
  }
}

// Export singleton instance
export const eventBus = EventBus.getInstance();
