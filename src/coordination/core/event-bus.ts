/**
 * @file Event bus for coordinating system-wide events and messaging
 */

import { EventEmitter } from 'node:events';

export interface SystemEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: Date;
  source: string;
}

export interface EventBusInterface {
  emit(eventName: string, ...args: any[]): boolean;
  emitSystemEvent(event: SystemEvent): boolean;
  on(eventType: string, handler: (event: SystemEvent) => void): this;
  off(eventType: string, handler: (event: SystemEvent) => void): this;
  once(eventType: string, handler: (event: SystemEvent) => void): this;
  removeAllListeners(eventType?: string): this;
}

export class EventBus extends EventEmitter implements EventBusInterface {
  private static instance: EventBus;
  private eventHistory: SystemEvent[] = [];
  private maxHistorySize = 1000;

  constructor() {
    super();
    this.setMaxListeners(100); // Support many listeners
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

  override on(eventType: string, handler: (event: SystemEvent) => void): this {
    return super.on(eventType, handler);
  }

  override off(eventType: string, handler: (event: SystemEvent) => void): this {
    return super.off(eventType, handler);
  }

  override once(eventType: string, handler: (event: SystemEvent) => void): this {
    return super.once(eventType, handler);
  }

  override removeAllListeners(eventType?: string): this {
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
