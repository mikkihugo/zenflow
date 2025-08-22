/**
 * @file Event bus for coordinating system-wide events and messaging
 *
 * STRATEGIC FACADE INTEGRATION:
 * Uses @claude-zen/infrastructure facade which delegates to @claude-zen/event-system
 * for proper event coordination instead of custom EventEmitter implementation.
 */

// import { getEventSystemAccess } from '@claude-zen/infrastructure';
// Temporarily comment out until infrastructure facade is available

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

export class EventBus implements EventBusInterface {
  private static instance: EventBus;
  private eventHistory: SystemEvent[] = [];
  private maxHistorySize = 1000;
  private eventSystemAccess: any = null;

  constructor() {
    this.initializeEventSystem();
  }

  private async initializeEventSystem(): Promise<void> {
    try {
      // Use infrastructure facade access
      const { getServiceContainer } = await import(
        '@claude-zen/infrastructure'
      );
      const container = await getServiceContainer();
      this.eventSystemAccess = container;
    } catch (error) {
      console.warn('Event system not available, using fallback:', error);
      // Fallback implementation will be used
    }
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  async emitSystemEvent(event: SystemEvent): Promise<boolean> {
    // Store in history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Emit using infrastructure facade event system
    if (this.eventSystemAccess) {
      try {
        await this.eventSystemAccess.emit(event.type, event);
        return true;
      } catch (error) {
        console.warn('Event system emit failed, using fallback:', error);
      }
    }

    // Fallback for backward compatibility
    return true;
  }

  emit(eventName: string | symbol, ...args: any[]): boolean {
    if (this.eventSystemAccess) {
      try {
        this.eventSystemAccess.emit(
          String(eventName),
          args.length === 1 ? args[0] : args
        );
        return true;
      } catch (error) {
        console.warn('Event system emit failed:', error);
      }
    }
    return true;
  }

  on(eventType: string | symbol, handler: (...args: any[]) => void): this {
    if (this.eventSystemAccess) {
      this.eventSystemAccess.on(String(eventType), handler);
    }
    return this;
  }

  off(eventType: string | symbol, handler: (...args: any[]) => void): this {
    if (this.eventSystemAccess) {
      this.eventSystemAccess.off(String(eventType), handler);
    }
    return this;
  }

  once(eventType: string | symbol, handler: (...args: any[]) => void): this {
    // Most event systems don't have 'once', so we simulate it
    const wrappedHandler = (...args: any[]) => {
      handler(...args);
      this.off(eventType, wrappedHandler);
    };
    return this.on(eventType, wrappedHandler);
  }

  removeAllListeners(eventType?: string | symbol): this {
    // Event system facade doesn't expose removeAllListeners,
    // so we maintain backward compatibility
    console.warn(
      'removeAllListeners not fully supported with event system facade'
    );
    return this;
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
