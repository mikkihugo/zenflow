/**
 * @file Monitoring Event Adapter - Main Adapter Implementation
 * 
 * Core monitoring event adapter implementation.
 */

import { type EventEmitter, getLogger } from '@claude-zen/foundation';
import { BaseEventManager } from '../../core/base-event-manager';
import type { EventManagerConfig, EventManager } from '../../core/interfaces';
import type { MonitoringEventAdapterConfig } from './types';
import { MonitoringAdapterHelpers } from './helpers';

/**
 * Create a monitoring event adapter instance.
 */
export async function createMonitoringEventAdapter(config: MonitoringEventAdapterConfig): Promise<EventManager> {
  const logger = getLogger('monitoring-event-adapter');
  
  try {
    logger.info(`Creating monitoring event adapter: ${config.name}`);
    
    // Validate configuration
    MonitoringAdapterHelpers.validateConfig(config);
    
    // Apply monitoring-optimized defaults
    const optimizedConfig = MonitoringAdapterHelpers.createDefaultConfig(config.name, config);
    
    // Create base event manager configured for monitoring events
    const adapter = new BaseEventManager(optimizedConfig, logger as any) as EventManager;
    
    logger.info(`Monitoring event adapter created successfully: ${config.name}`);
    return adapter;
  } catch (error) {
    logger.error(`Failed to create monitoring event adapter: ${config.name}`, error);
    throw error;
  }
}