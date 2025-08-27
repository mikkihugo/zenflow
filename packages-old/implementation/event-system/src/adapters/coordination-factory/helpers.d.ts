/**
 * @file Coordination Factory Helpers
 *
 * Helper functions for coordination event factory operations.
 */
import type { Logger } from '@claude-zen/foundation';
import type { EventManagerConfig } from '../../core/interfaces';
/**
 * Helper function to validate coordination configuration.
 */
export declare function validateCoordinationConfig(config: EventManagerConfig): boolean;
/**
 * Helper function to create default coordination config.
 */
export declare function createDefaultCoordinationConfig(name: string, overrides?: any): EventManagerConfig;
/**
 * Helper function for logging coordination events.
 */
export declare function logCoordinationEvent(logger: Logger, event: string, data?: any): void;
/**
 * Helper function to generate coordination event IDs.
 */
export declare function generateCoordinationEventId(): string;
/**
 * Helper function to validate generic config.
 */
export declare function validateConfig(config: any): boolean;
/**
 * Helper function to calculate metrics.
 */
export declare function calculateMetrics(totalCreated: number, totalErrors: number, activeInstances: number, runningInstances: number, startTime: Date): any;
/**
 * Helper function to create default configuration.
 */
export declare function createDefaultConfig(name: string): EventManagerConfig;
/**
 * Collection of coordination factory helpers.
 */
export declare const CoordinationFactoryHelpers: {
    validateCoordinationConfig: typeof validateCoordinationConfig;
    createDefaultCoordinationConfig: typeof createDefaultCoordinationConfig;
    createDefaultConfig: typeof createDefaultConfig;
    logCoordinationEvent: typeof logCoordinationEvent;
    generateCoordinationEventId: typeof generateCoordinationEventId;
    validateConfig: typeof validateConfig;
    calculateMetrics: typeof calculateMetrics;
};
//# sourceMappingURL=helpers.d.ts.map