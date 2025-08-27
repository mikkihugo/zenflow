/**
 * @file System Event Adapter Helpers
 *
 * Helper functions for system event adapter operations.
 */
/**
 * Helper function to validate system adapter configuration.
 */
export function validateSystemAdapterConfig(config) {
    return !!(config && config.name && config.type === 'system');
}
/**
 * Helper function to create default system adapter config.
 */
export function createDefaultSystemAdapterConfig(name, overrides) {
    return {
        name,
        type: 'system',
        enabled: true,
        maxListeners: 300,
        processing: {
            strategy: 'immediate',
            queueSize: 10000,
        },
        ...overrides,
    };
}
/**
 * Alias for createDefaultSystemAdapterConfig for compatibility.
 */
export function createDefaultConfig(name, overrides) {
    return createDefaultSystemAdapterConfig(name, overrides);
}
/**
 * Helper function to validate generic config.
 */
export function validateConfig(config) {
    return !!(config && typeof config === 'object');
}
/**
 * Helper function for logging system adapter events.
 */
export function logSystemAdapterEvent(logger, event, data) {
    logger.debug(`System adapter event: ${event}`, data);
}
/**
 * Helper function to generate system adapter event IDs.
 */
export function generateSystemAdapterEventId() {
    return `system_adapter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * Collection of system adapter helpers.
 */
export const SystemAdapterHelpers = {
    validateSystemAdapterConfig,
    createDefaultSystemAdapterConfig,
    createDefaultConfig,
    logSystemAdapterEvent,
    generateSystemAdapterEventId,
    validateConfig,
};
// Export both names for compatibility
export const SystemEventHelpers = SystemAdapterHelpers;
