/**
 * @file Workflow Event Manager - Implementation
 * 
 * Simple workflow event manager implementation for the factory.
 */

import type { EventManager, EventManagerConfig } from '../core/interfaces';
import { BaseEventManager } from '../core/base-event-manager';

/**
 * Create a workflow event manager instance.
 */
export async function createWorkflowEventManager(config: EventManagerConfig): Promise<EventManager> {
  // For now, return a base event manager configured for workflow events
  // This can be expanded later with workflow-specific functionality
  return new BaseEventManager(config, console as any) as EventManager;
}