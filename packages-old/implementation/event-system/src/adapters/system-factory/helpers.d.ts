/**
 * @file System Factory Helpers
 *
 * Helper functions for system event factory operations.
 */
import type { Logger } from '@claude-zen/foundation';
import type { EventManagerConfig } from '../../core/interfaces';
/**
 * Helper function to validate system configuration.
 */
export declare function validateSystemConfig(config: EventManagerConfig): boolean;
/**
 * Helper function to create default system config.
 */
export declare function createDefaultSystemConfig(name: string, overrides?: any): EventManagerConfig;
/**
 * Alias for createDefaultSystemConfig for compatibility.
 */
export declare function createDefaultConfig(name: string, overrides?: any): EventManagerConfig;
/**
 * Helper function for logging system events.
 */
export declare function logSystemEvent(logger: Logger, event: string, data?: any): void;
/**
 * Helper function to generate system event IDs.
 */
export declare function generateSystemEventId(): string;
/**
 * Helper function to validate generic config.
 */
export declare function validateConfig(config: any): boolean;
/**
 * Helper function to calculate metrics.
 */
export declare function calculateMetrics(totalCreated: number, totalErrors: number, activeInstances: number, runningInstances: number, startTime: Date): any;
/**
 * Helper function to calculate system success rate.
 */
export declare function calculateSystemSuccessRate(totalEvents: number, failedEvents: number): number;
/**
 * Helper function to optimize system parameters.
 */
export declare function optimizeSystemParameters(metrics: {
    successRate: number;
    averageResponseTime: number;
    errorRate: number;
}): any;
/**
 * Collection of system factory helpers.
 */
export declare const SystemFactoryHelpers: {
    validateSystemConfig: typeof validateSystemConfig;
    createDefaultSystemConfig: typeof createDefaultSystemConfig;
    createDefaultConfig: typeof createDefaultConfig;
    logSystemEvent: typeof logSystemEvent;
    generateSystemEventId: typeof generateSystemEventId;
    validateConfig: typeof validateConfig;
    calculateMetrics: typeof calculateMetrics;
    calculateSystemSuccessRate: typeof calculateSystemSuccessRate;
    optimizeSystemParameters: typeof optimizeSystemParameters;
};
//# sourceMappingURL=helpers.d.ts.map