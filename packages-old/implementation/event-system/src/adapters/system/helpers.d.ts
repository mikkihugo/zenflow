/**
 * @file System Event Adapter Helpers
 *
 * Helper functions for system event adapter operations.
 */
import type { Logger } from '@claude-zen/foundation';
import type { EventManagerConfig } from '../../core/interfaces';
/**
 * Helper function to validate system adapter configuration.
 */
export declare function validateSystemAdapterConfig(config: EventManagerConfig): boolean;
/**
 * Helper function to create default system adapter config.
 */
export declare function createDefaultSystemAdapterConfig(name: string, overrides?: any): EventManagerConfig;
/**
 * Alias for createDefaultSystemAdapterConfig for compatibility.
 */
export declare function createDefaultConfig(name: string, overrides?: any): EventManagerConfig;
/**
 * Helper function to validate generic config.
 */
export declare function validateConfig(config: any): boolean;
/**
 * Helper function for logging system adapter events.
 */
export declare function logSystemAdapterEvent(logger: Logger, event: string, data?: any): void;
/**
 * Helper function to generate system adapter event IDs.
 */
export declare function generateSystemAdapterEventId(): string;
/**
 * Collection of system adapter helpers.
 */
export declare const SystemAdapterHelpers: {
    validateSystemAdapterConfig: typeof validateSystemAdapterConfig;
    createDefaultSystemAdapterConfig: typeof createDefaultSystemAdapterConfig;
    createDefaultConfig: typeof createDefaultConfig;
    logSystemAdapterEvent: typeof logSystemAdapterEvent;
    generateSystemAdapterEventId: typeof generateSystemAdapterEventId;
    validateConfig: typeof validateConfig;
};
export declare const SystemEventHelpers: {
    validateSystemAdapterConfig: typeof validateSystemAdapterConfig;
    createDefaultSystemAdapterConfig: typeof createDefaultSystemAdapterConfig;
    createDefaultConfig: typeof createDefaultConfig;
    logSystemAdapterEvent: typeof logSystemAdapterEvent;
    generateSystemAdapterEventId: typeof generateSystemAdapterEventId;
    validateConfig: typeof validateConfig;
};
//# sourceMappingURL=helpers.d.ts.map