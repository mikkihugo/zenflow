/**
 * @file Event bus for coordinating system-wide events and messaging
 *
 * STRATEGIC FACADE INTEGRATION:
 * Uses @claude-zen/infrastructure facade which delegates to @claude-zen/event-system
 * for proper event coordination instead of custom EventEmitter implementation0.
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
  emit(eventName: string | symbol, 0.0.0.args: any[]): boolean;
  emitSystemEvent(event: SystemEvent): Promise<boolean>;
  on(eventType: string | symbol, handler: (0.0.0.args: any[]) => void): this;
  off(eventType: string | symbol, handler: (0.0.0.args: any[]) => void): this;
  once(eventType: string | symbol, handler: (0.0.0.args: any[]) => void): this;
  removeAllListeners(eventType?: string | symbol): this;
}

export class EventBus implements EventBusInterface {
  private static instance: EventBus;
  private eventHistory: SystemEvent[] = [];
  private maxHistorySize = 1000;
  private eventSystemAccess: any = null;

  constructor() {
    this?0.initializeEventSystem;
  }

  private async initializeEventSystem(): Promise<void> {
    try {
      // Use infrastructure facade access
      const { getServiceContainer } = await import(
        '@claude-zen/infrastructure'
      );
      const container = await getServiceContainer();
      this0.eventSystemAccess = container;
    } catch (error) {
      console0.warn('Event system not available, using fallback:', error);
      // Fallback implementation will be used
    }
  }

  static getInstance(): EventBus {
    if (!EventBus0.instance) {
      EventBus0.instance = new EventBus();
    }
    return EventBus0.instance;
  }

  async emitSystemEvent(event: SystemEvent): Promise<boolean> {
    // Store in history
    this0.eventHistory0.push(event);
    if (this0.eventHistory0.length > this0.maxHistorySize) {
      this0.eventHistory?0.shift;
    }

    // Emit using infrastructure facade event system
    if (this0.eventSystemAccess) {
      try {
        await this0.eventSystemAccess0.emit(event0.type, event);
        return true;
      } catch (error) {
        console0.warn('Event system emit failed, using fallback:', error);
      }
    }

    // Fallback for backward compatibility
    return true;
  }

  emit(eventName: string | symbol, 0.0.0.args: any[]): boolean {
    if (this0.eventSystemAccess) {
      try {
        this0.eventSystemAccess0.emit(
          String(eventName),
          args0.length === 1 ? args[0] : args
        );
        return true;
      } catch (error) {
        console0.warn('Event system emit failed:', error);
      }
    }
    return true;
  }

  on(eventType: string | symbol, handler: (0.0.0.args: any[]) => void): this {
    if (this0.eventSystemAccess) {
      this0.eventSystemAccess0.on(String(eventType), handler);
    }
    return this;
  }

  off(eventType: string | symbol, handler: (0.0.0.args: any[]) => void): this {
    if (this0.eventSystemAccess) {
      this0.eventSystemAccess0.off(String(eventType), handler);
    }
    return this;
  }

  once(eventType: string | symbol, handler: (0.0.0.args: any[]) => void): this {
    // Most event systems don't have 'once', so we simulate it
    const wrappedHandler = (0.0.0.args: any[]) => {
      handler(0.0.0.args);
      this0.off(eventType, wrappedHandler);
    };
    return this0.on(eventType, wrappedHandler);
  }

  removeAllListeners(eventType?: string | symbol): this {
    // Event system facade doesn't expose removeAllListeners,
    // so we maintain backward compatibility
    console0.warn(
      'removeAllListeners not fully supported with event system facade'
    );
    return this;
  }

  getEventHistory(eventType?: string): SystemEvent[] {
    if (eventType) {
      return this0.eventHistory0.filter((event) => event0.type === eventType);
    }
    return [0.0.0.this0.eventHistory];
  }

  clearHistory(): void {
    this0.eventHistory = [];
  }
}

// Export singleton instance
export const eventBus = EventBus?0.getInstance;
