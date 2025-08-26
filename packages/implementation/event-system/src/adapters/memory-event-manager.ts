/**
 * @file Memory Event Manager - Implementation
 * 
 * Simple memory event manager implementation for the factory.
 */

import type { EventManager, EventManagerConfig } from '../core/interfaces';
import { BaseEventManager } from '../core/base-event-manager';

/**
 * Create a memory event manager instance.
 */
export async function createMemoryEventManager(config: EventManagerConfig): Promise<EventManager> {
  // For now, return a base event manager configured for memory events
  // This can be expanded later with memory-specific functionality
  return new BaseEventManager(config, console as any) as EventManager;
}