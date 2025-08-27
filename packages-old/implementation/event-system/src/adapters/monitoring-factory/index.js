/**
 * @file Monitoring Event Factory - Main Export
 *
 * Exports the modular monitoring event factory system with all components.
 */
// Main factory class
export { MonitoringEventFactory } from './factory';
// Helper functions and utilities
export { MonitoringFactoryHelpers } from './helpers';
// Factory function for creating MonitoringEventFactory instances
import { MonitoringEventFactory } from './factory';
import { MonitoringFactoryHelpers } from './helpers';
export function createMonitoringEventFactory(config) {
    return new MonitoringEventFactory(config);
}
// Convenience functions for creating monitoring event managers
export async function createMonitoringManager(config) {
    const factory = new MonitoringEventFactory();
    return await factory.create(config);
}
export async function createBasicMonitoringManager(name, overrides) {
    const config = MonitoringFactoryHelpers.createDefaultConfig(name, {
        processing: {
            strategy: 'immediate',
            queueSize: 1000,
        },
        monitoring: {
            enabled: true,
            metricsInterval: 10000,
            trackLatency: true,
            trackThroughput: false,
            trackErrors: true,
        },
        ...overrides,
    });
    return createMonitoringManager(config);
}
export async function createAdvancedMonitoringManager(name, overrides) {
    const config = MonitoringFactoryHelpers.createDefaultConfig(name, {
        processing: {
            strategy: 'queued',
            queueSize: 5000,
        },
        retry: {
            attempts: 4,
            delay: 2000,
            backoff: 'exponential',
            maxDelay: 12000,
        },
        health: {
            checkInterval: 30000,
            timeout: 8000,
            failureThreshold: 3,
            successThreshold: 2,
            enableAutoRecovery: true,
        },
        monitoring: {
            enabled: true,
            metricsInterval: 5000,
            trackLatency: true,
            trackThroughput: true,
            trackErrors: true,
            enableProfiling: true,
        },
        ...overrides,
    });
    return createMonitoringManager(config);
}
// Global factory instance
export const monitoringEventFactory = new MonitoringEventFactory();
// Default export
export default MonitoringEventFactory;
