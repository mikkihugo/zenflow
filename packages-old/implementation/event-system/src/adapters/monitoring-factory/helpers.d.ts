/**
 * @file Monitoring Factory Helpers
 *
 * Helper functions for monitoring event factory operations.
 */
import type { Logger } from '@claude-zen/foundation';
import type { EventManagerConfig } from '../../core/interfaces';
/**
 * Helper function to validate monitoring configuration.
 */
export declare function validateMonitoringConfig(config: EventManagerConfig): boolean;
/**
 * Helper function to create default monitoring config.
 */
export declare function createDefaultMonitoringConfig(name: string, overrides?: any): EventManagerConfig;
/**
 * Alias for createDefaultMonitoringConfig for compatibility.
 */
export declare function createDefaultConfig(name: string, overrides?: any): EventManagerConfig;
/**
 * Helper function for logging monitoring events.
 */
export declare function logMonitoringEvent(logger: Logger, event: string, data?: any): void;
/**
 * Helper function to generate monitoring event IDs.
 */
export declare function generateMonitoringEventId(): string;
/**
 * Helper function to validate generic config.
 */
export declare function validateConfig(config: any): boolean;
/**
 * Helper function to calculate metrics.
 */
export declare function calculateMetrics(totalCreated: number, totalErrors: number, activeInstances: number, runningInstances: number, startTime: Date): any;
/**
 * Helper function to calculate monitoring success rate.
 */
export declare function calculateMonitoringSuccessRate(active: number, failed: number): number;
/**
 * Collection of monitoring factory helpers.
 */
export declare const MonitoringFactoryHelpers: {
    validateMonitoringConfig: typeof validateMonitoringConfig;
    createDefaultMonitoringConfig: typeof createDefaultMonitoringConfig;
    createDefaultConfig: typeof createDefaultConfig;
    logMonitoringEvent: typeof logMonitoringEvent;
    generateMonitoringEventId: typeof generateMonitoringEventId;
    validateConfig: typeof validateConfig;
    calculateMetrics: typeof calculateMetrics;
    calculateMonitoringSuccessRate: typeof calculateMonitoringSuccessRate;
};
//# sourceMappingURL=helpers.d.ts.map