/**
 * @file Bootstrap Logger - Logtape Integration.
 *
 * Simple logger that works without config dependencies by using logtape directly.
 * Used for early initialization before full config system is ready.
 *
 * This BREAKS the circular dependency: logger ↔ config.
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (LogLevel = {}));
/**
 * Bootstrap logger that works without config system - uses logtape directly.
 *
 * @example
 */
export class BootstrapLogger {
    logger; // logtape logger
    prefix;
    constructor(prefix = 'system', level = LogLevel.INFO) {
        this.prefix = prefix;
        try {
            // Try to use logtape if available, fallback to console
            const { getLogger } = require('@logtape/logtape');
            this.logger = getLogger(prefix);
        }
        catch (error) {
            // Fallback to console if logtape not ready
            this.logger = {
                debug: (msg, meta) => console.debug(`[${prefix}] DEBUG: ${msg}`, meta || ''),
                info: (msg, meta) => console.info(`[${prefix}] INFO: ${msg}`, meta || ''),
                warn: (msg, meta) => console.warn(`[${prefix}] WARN: ${msg}`, meta || ''),
                error: (msg, meta) => console.error(`[${prefix}] ERROR: ${msg}`, meta || ''),
            };
        }
    }
    debug(message, meta) {
        this.logger.debug(message, meta);
    }
    info(message, meta) {
        this.logger.info(message, meta);
    }
    warn(message, meta) {
        this.logger.warn(message, meta);
    }
    error(message, meta) {
        this.logger.error(message, meta);
    }
}
/**
 * Factory function for creating bootstrap loggers.
 *
 * @param prefix
 * @example
 */
export function createBootstrapLogger(prefix) {
    return new BootstrapLogger(prefix);
}
/**
 * Global bootstrap logger for system initialization.
 */
export const systemLogger = createBootstrapLogger('system');
