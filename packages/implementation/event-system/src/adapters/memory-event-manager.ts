/**
 * @file Memory Event Manager - Implementation
 *
 * Simple memory event manager implementation for the factory.
 */

import type { EventManager, EventManagerConfig } from '../core/interfaces';
import { BaseEventManager } from '../core/base-event-manager';

/**
 * Concrete memory event manager implementation.
 */
export class MemoryEventManager extends BaseEventManager {
  private memoryCache = new Map<string, any>();
  
  constructor(config: EventManagerConfig) {
    super(config, console as any);
  }
  
  // Add memory-specific methods here as needed
  async storeInMemory(key: string, data: any): Promise<void> {
    this.memoryCache.set(key, data);
    
    const event = {
      id: `memory_store_${Date.now()}`,
      timestamp: new Date(),
      source: this.name,
      type: 'memory:store',
      payload: { key, dataSize: JSON.stringify(data).length },
    };
    
    await this.emit(event);
  }
  
  getFromMemory(key: string): any {
    return this.memoryCache.get(key);
  }
  
  clearMemory(): void {
    this.memoryCache.clear();
  }
}

/**
 * Create a memory event manager instance.
 */
export async function createMemoryEventManager(
  config: EventManagerConfig
): Promise<EventManager> {
  return new MemoryEventManager(config);
}
