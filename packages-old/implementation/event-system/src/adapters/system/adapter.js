/**
 * @file System Event Adapter - Main Adapter Implementation
 *
 * Core system event adapter implementation.
 */
import { getLogger } from '@claude-zen/foundation';
import { SystemAdapterHelpers } from './helpers';
import { SystemEventManager } from './manager';
/**
 * Create a system event adapter instance.
 */
export async function createSystemEventAdapter(config) {
    const logger = getLogger('system-event-adapter');
    try {
        logger.info(`Creating system event adapter: ${config.name}`);
        // Validate configuration
        SystemAdapterHelpers.validateConfig(config);
        // Apply system-optimized defaults
        const optimizedConfig = SystemAdapterHelpers.createDefaultConfig(config.name, config);
        // Create system event manager configured for system events
        const adapter = new SystemEventManager(optimizedConfig, logger);
        logger.info(`System event adapter created successfully: ${config.name}`);
        return adapter;
    }
    catch (error) {
        logger.error(`Failed to create system event adapter: ${config.name}`, error);
        throw error;
    }
}
