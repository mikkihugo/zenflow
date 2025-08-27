/**
 * @file System Factory Helpers
 *
 * Helper functions for system event factory operations.
 */
/**
 * Helper function to validate system configuration.
 */
export function validateSystemConfig(config) {
    return !!(config && config.name && config.type === 'system');
}
/**
 * Helper function to create default system config.
 */
export function createDefaultSystemConfig(name, overrides) {
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
 * Alias for createDefaultSystemConfig for compatibility.
 */
export function createDefaultConfig(name, overrides) {
    return createDefaultSystemConfig(name, overrides);
}
/**
 * Helper function for logging system events.
 */
export function logSystemEvent(logger, event, data) {
    logger.debug(`System event: ${event}`, data);
}
/**
 * Helper function to generate system event IDs.
 */
export function generateSystemEventId() {
    return `system_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * Helper function to validate generic config.
 */
export function validateConfig(config) {
    return !!(config && typeof config === 'object');
}
/**
 * Helper function to calculate metrics.
 */
export function calculateMetrics(totalCreated, totalErrors, activeInstances, runningInstances, startTime) {
    const now = new Date();
    const uptimeMs = now.getTime() - startTime.getTime();
    const uptimeMinutes = uptimeMs / (1000 * 60);
    return {
        totalCreated,
        totalErrors,
        activeInstances,
        runningInstances,
        uptime: uptimeMs,
        creationRate: uptimeMinutes > 0 ? totalCreated / uptimeMinutes : 0,
        errorRate: totalCreated > 0 ? totalErrors / totalCreated : 0,
        timestamp: now,
    };
}
/**
 * Helper function to calculate system success rate.
 */
export function calculateSystemSuccessRate(totalEvents, failedEvents) {
    if (totalEvents === 0)
        return 1;
    return Math.max(0, (totalEvents - failedEvents) / totalEvents);
}
/**
 * Helper function to optimize system parameters.
 */
export function optimizeSystemParameters(metrics) {
    return {
        queueSize: metrics.successRate > 0.9 ? 10000 : 5000,
        batchSize: metrics.averageResponseTime < 100 ? 50 : 25,
        throttleMs: metrics.errorRate > 0.1 ? 1000 : 500,
    };
}
/**
 * Collection of system factory helpers.
 */
export const SystemFactoryHelpers = {
    validateSystemConfig,
    createDefaultSystemConfig,
    createDefaultConfig,
    logSystemEvent,
    generateSystemEventId,
    validateConfig,
    calculateMetrics,
    calculateSystemSuccessRate,
    optimizeSystemParameters,
};
