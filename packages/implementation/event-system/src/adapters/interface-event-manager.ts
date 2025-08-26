/**
 * @file Interface Event Manager - Implementation
 * 
 * Simple interface event manager implementation for the factory.
 */

import type { EventManager, EventManagerConfig } from '../core/interfaces';
import { BaseEventManager } from '../core/base-event-manager';

/**
 * Create an interface event manager instance.
 */
export async function createInterfaceEventManager(config: EventManagerConfig): Promise<EventManager> {
  // For now, return a base event manager configured for interface events
  // This can be expanded later with interface-specific functionality
  return new BaseEventManager(config, console as any) as EventManager;
}