/**
 * @file Neural Event Manager - Implementation
 * 
 * Simple neural event manager implementation for the factory.
 */

import type { EventManager, EventManagerConfig } from '../core/interfaces';
import { BaseEventManager } from '../core/base-event-manager';

/**
 * Create a neural event manager instance.
 */
export async function createNeuralEventManager(config: EventManagerConfig): Promise<EventManager> {
  // For now, return a base event manager configured for neural events
  // This can be expanded later with neural-specific functionality
  return new BaseEventManager(config, console as any) as EventManager;
}