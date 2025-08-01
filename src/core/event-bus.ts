/**
 * Event Bus - Core event system for claude-flow
 * Provides centralized event handling and communication
 */

import { EventEmitter } from 'node:events';

export interface IEventBus {
  on(event: string, listener: (...args: any[]) => void): void;
  off(event: string, listener: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): boolean;
  once(event: string, listener: (...args: any[]) => void): void;
}

/**
 * Unified Event Bus implementation
 * Extends Node.js EventEmitter with additional features
 */
export class EventBus extends EventEmitter implements IEventBus {
  private static instance: EventBus | null = null;

  constructor() {
    super();
    this.setMaxListeners(100); // Increase limit for swarm operations
  }

  /**
   * Get singleton instance
   */
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Enhanced emit with error handling
   */
  emit(event: string, ...args: any[]): boolean {
    try {
      return super.emit(event, ...args);
    } catch (error) {
      console.error(`EventBus error in event '${event}':`, error);
      return false;
    }
  }

  /**
   * Alias for removeListener
   */
  off(event: string, listener: (...args: any[]) => void): this {
    return this.removeListener(event, listener);
  }

  /**
   * Get event statistics
   */
  getStats(): { eventNames: string[]; listenerCount: number } {
    const eventNames = this.eventNames().map(name => String(name));
    const listenerCount = eventNames.reduce((sum, name) => sum + this.listenerCount(name), 0);
    
    return {
      eventNames,
      listenerCount
    };
  }
}

export default EventBus;