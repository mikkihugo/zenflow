/**
 * @file Logger utility - Fixed circular dependency version
 * Enhanced logger with two-phase initialization to avoid circular dependencies.
 * @module Logger
 */
import { createBootstrapLogger, } from './bootstrap-logger.ts';
// Re-export for compatibility
export { LogLevel } from './bootstrap-logger.ts';
/**
 * Enhanced logger that can be upgraded from bootstrap logger.
 *
 * @example
 */
class EnhancedLogger {
    bootstrapLogger;
    configLoaded = false;
    prefix;
    constructor(prefix) {
        this.prefix = prefix;
        this.bootstrapLogger = createBootstrapLogger(prefix);
    }
    /**
     * Upgrade logger with config (called after config system is ready).
     *
     * @param config
     */
    upgradeWithConfig(config) {
        try {
            // This will be called AFTER config system is fully loaded
            const centralConfig = config?.getAll?.();
            if (centralConfig) {
                this.configLoaded = true;
                // Enhanced logging behavior can be implemented here
            }
        }
        catch (error) {
            // Keep using bootstrap logger if config fails
            this.bootstrapLogger.error('Failed to upgrade logger with config', error);
        }
    }
    debug(message, meta) {
        this.bootstrapLogger.debug(message, meta);
    }
    info(message, meta) {
        this.bootstrapLogger.info(message, meta);
    }
    warn(message, meta) {
        this.bootstrapLogger.warn(message, meta);
    }
    error(message, meta) {
        this.bootstrapLogger.error(message, meta);
    }
}
// Registry for enhanced loggers that can be upgraded later
const loggerRegistry = new Map();
/**
 * Create or get an enhanced logger for a component.
 *
 * @example
 */
export class Logger extends EnhancedLogger {
    constructor(prefix = 'system') {
        super(prefix);
        loggerRegistry.set(prefix, this);
    }
}
/**
 * Upgrade all loggers with config system (called after config is loaded).
 *
 * @param config
 * @example
 */
export function upgradeAllLoggersWithConfig(config) {
    for (const logger of loggerRegistry.values()) {
        logger.upgradeWithConfig(config);
    }
}
/**
 * Factory function to create a logger instance.
 * Uses bootstrap logger initially, can be upgraded later with config.
 *
 * @param prefix Component prefix for log messages.
 * @returns Logger instance.
 * @example
 */
export function createLogger(prefix = 'system') {
    return new Logger(prefix);
}
