/**
 * @file Monitoring Event Adapter Helpers
 *
 * Helper functions for monitoring event adapter operations.
 */
import type { Logger } from '@claude-zen/foundation';
import type { EventManagerConfig } from '../../core/interfaces';
/**
 * Helper function to validate monitoring adapter configuration.
 */
export declare function validateMonitoringAdapterConfig(config: EventManagerConfig): boolean;
/**
 * Helper function to create default monitoring adapter config.
 */
export declare function createDefaultMonitoringAdapterConfig(name: string, overrides?: any): EventManagerConfig;
/**
 * Alias for createDefaultMonitoringAdapterConfig for compatibility.
 */
export declare function createDefaultConfig(name: string, overrides?: any): EventManagerConfig;
/**
 * Helper function to validate generic config.
 */
export declare function validateConfig(config: any): boolean;
/**
 * Helper function for logging monitoring adapter events.
 */
export declare function logMonitoringAdapterEvent(logger: Logger, event: string, data?: any): void;
/**
 * Helper function to generate monitoring adapter event IDs.
 */
export declare function generateMonitoringAdapterEventId(): string;
/**
 * Collection of monitoring adapter helpers.
 */
export declare const MonitoringEventHelpers: {
    validateMonitoringAdapterConfig: typeof validateMonitoringAdapterConfig;
    createDefaultMonitoringAdapterConfig: typeof createDefaultMonitoringAdapterConfig;
    createDefaultConfig: typeof createDefaultConfig;
    validateConfig: typeof validateConfig;
    logMonitoringAdapterEvent: typeof logMonitoringAdapterEvent;
    generateMonitoringAdapterEventId: typeof generateMonitoringAdapterEventId;
};
/**
 * Alias for MonitoringEventHelpers for compatibility.
 */
export declare const MonitoringAdapterHelpers: {
    validateMonitoringAdapterConfig: typeof validateMonitoringAdapterConfig;
    createDefaultMonitoringAdapterConfig: typeof createDefaultMonitoringAdapterConfig;
    createDefaultConfig: typeof createDefaultConfig;
    validateConfig: typeof validateConfig;
    logMonitoringAdapterEvent: typeof logMonitoringAdapterEvent;
    generateMonitoringAdapterEventId: typeof generateMonitoringAdapterEventId;
};
//# sourceMappingURL=helpers.d.ts.map