/**
 * @file Logger utility - Fixed circular dependency version
 * Enhanced logger with two-phase initialization to avoid circular dependencies.
 * @module Logger
 */
import { type LogLevel as BootstrapLogLevel, type Logger } from './bootstrap-logger';
export type { Logger } from './bootstrap-logger';
export { LogLevel } from './bootstrap-logger';
export interface LoggerConfig {
    prefix?: string;
    level?: BootstrapLogLevel;
}
/**
 * Enhanced logger that can be upgraded from bootstrap logger.
 *
 * @example
 */
declare class EnhancedLogger implements Logger {
    private bootstrapLogger;
    private configLoaded;
    private prefix;
    constructor(prefix: string);
    /**
     * Upgrade logger with config (called after config system is ready).
     *
     * @param config
     */
    upgradeWithConfig(config: unknown): void;
    debug(message: string, meta?: unknown): void;
    info(message: string, meta?: unknown): void;
    warn(message: string, meta?: unknown): void;
    error(message: string, meta?: unknown): void;
}
/**
 * Create or get an enhanced logger for a component.
 *
 * @example
 */
export declare class Logger extends EnhancedLogger {
    constructor(prefix?: string);
}
/**
 * Upgrade all loggers with config system (called after config is loaded).
 *
 * @param config
 * @example
 */
export declare function upgradeAllLoggersWithConfig(config: unknown): void;
/**
 * Factory function to create a logger instance.
 * Uses bootstrap logger initially, can be upgraded later with config.
 *
 * @param prefix Component prefix for log messages.
 * @returns Logger instance.
 * @example
 */
export declare function createLogger(prefix?: string): Logger;
//# sourceMappingURL=logger.d.ts.map