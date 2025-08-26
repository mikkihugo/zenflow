/**
 * @file System Event Adapter - Main Adapter Implementation
 * 
 * Core system event adapter implementation.
 */

import { type EventEmitter, getLogger } from '@claude-zen/foundation';
import { BaseEventManager } from '../../core/base-event-manager';
import type { EventManagerConfig, EventManager } from '../../core/interfaces';
import type { SystemEventAdapterConfig } from './types';
import { SystemAdapterHelpers } from './helpers';

/**
 * Create a system event adapter instance.
 */
export async function createSystemEventAdapter(config: SystemEventAdapterConfig): Promise<EventManager> {
  const logger = getLogger('system-event-adapter');
  
  try {
    logger.info(`Creating system event adapter: ${config.name}`);
    
    // Validate configuration
    SystemAdapterHelpers.validateConfig(config);
    
    // Apply system-optimized defaults
    const optimizedConfig = SystemAdapterHelpers.createDefaultConfig(config.name, config);
    
    // Create base event manager configured for system events
    const adapter = new BaseEventManager(optimizedConfig, logger as any) as EventManager;
    
    logger.info(`System event adapter created successfully: ${config.name}`);
    return adapter;
  } catch (error) {
    logger.error(`Failed to create system event adapter: ${config.name}`, error);
    throw error;
  }
}