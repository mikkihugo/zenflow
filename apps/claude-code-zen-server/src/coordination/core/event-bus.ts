/**
 * @file Event bus for coordinating system-wide events and messaging
 */

import { EventEmitter } from 'eventemitter3';

export interface SystemEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: Date;
  source: string;
}

export interface EventBusInterface {
  emit(eventName: string | symbol, ...args: unknown[]): boolean;
  emitSystemEvent(event: SystemEvent): boolean;
  on(eventType: string | symbol, handler: (...args: any[]) => void): this;
  off(eventType: string | symbol, handler: (...args: any[]) => void): this;
  once(eventType: string | symbol, handler: (...args: any[]) => void): this;
  removeAllListeners(eventType?: string | symbol): this;
}

export class EventBus extends EventEmitter implements EventBusInterface {
  private static instance: EventBus;
  private eventHistory: SystemEvent[] = [];
  private maxHistorySize = 1000;

  constructor() {
    super();
    // Support many listeners - EventEmitter3 handles this internally
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  emitSystemEvent(event: SystemEvent): boolean {
    // Store in history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Emit to listeners
    return super.emit(event.type, event);
  }

  override on(eventType: string | symbol, handler: (...args: any[]) => void): this {
    return super.on(eventType, handler);
  }

  override off(eventType: string | symbol, handler: (...args: any[]) => void): this {
    return super.off(eventType, handler);
  }

  override once(
    eventType: string | symbol,
    handler: (...args: any[]) => void
  ): this {
    return super.once(eventType, handler);
  }

  override removeAllListeners(eventType?: string | symbol): this {
    return super.removeAllListeners(eventType);
  }

  getEventHistory(eventType?: string): SystemEvent[] {
    if (eventType) {
      return this.eventHistory.filter((event) => event.type === eventType);
    }
    return [...this.eventHistory];
  }

  clearHistory(): void {
    this.eventHistory = [];
  }
}

// Export singleton instance
export const eventBus = EventBus.getInstance();
