/**
 * @file Interface Event Manager - Implementation
 *
 * Simple interface event manager implementation for the factory.
 */

import type { EventManager, EventManagerConfig } from '../core/interfaces';
import { BaseEventManager } from '../core/base-event-manager';

/**
 * Concrete interface event manager implementation.
 */
export class InterfaceEventManager extends BaseEventManager {
  constructor(config: EventManagerConfig) {
    super(config, console as any);
  }
  
  // Add interface-specific methods here as needed
  async handleInterfaceEvent(eventType: string, data: any): Promise<void> {
    const event = {
      id: `interface_${eventType}_${Date.now()}`,
      timestamp: new Date(),
      source: this.name,
      type: eventType,
      payload: data,
    };
    
    await this.emit(event);
  }
}

/**
 * Create an interface event manager instance.
 */
export async function createInterfaceEventManager(
  config: EventManagerConfig
): Promise<EventManager> {
  return new InterfaceEventManager(config);
}
