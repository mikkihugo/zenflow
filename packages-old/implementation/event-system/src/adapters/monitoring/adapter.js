/**
 * @file Monitoring Event Adapter - Main Adapter Implementation
 *
 * Core monitoring event adapter implementation.
 */
import { getLogger } from '@claude-zen/foundation';
import { MonitoringAdapterHelpers } from './helpers';
import { MonitoringEventManager } from './manager';
/**
 * Create a monitoring event adapter instance.
 */
export async function createMonitoringEventAdapter(config) {
    const logger = getLogger('monitoring-event-adapter');
    try {
        logger.info(`Creating monitoring event adapter: ${config.name}`);
        // Validate configuration
        MonitoringAdapterHelpers.validateConfig(config);
        // Apply monitoring-optimized defaults
        const optimizedConfig = MonitoringAdapterHelpers.createDefaultConfig(config.name, config);
        // Create monitoring event manager configured for monitoring events
        const adapter = new MonitoringEventManager(optimizedConfig, logger);
        logger.info(`Monitoring event adapter created successfully: ${config.name}`);
        return adapter;
    }
    catch (error) {
        logger.error(`Failed to create monitoring event adapter: ${config.name}`, error);
        throw error;
    }
}
