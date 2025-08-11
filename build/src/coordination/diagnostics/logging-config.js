/**
 * @file Coordination system: logging-config.
 */
import { getLogger } from '../../config/logging-config.ts';
const logger = getLogger('coordination-diagnostics-logging-config');
/**
 * Simple logger implementation for diagnostics.
 *
 * @example
 */
class DiagnosticsLogger {
    name;
    options;
    constructor(name, options) {
        this.name = name;
        this.options = options;
    }
    shouldLog(level) {
        const levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
        const currentLevel = levels[this.options.level.toUpperCase()] ?? 1;
        const messageLevel = levels[level.toUpperCase()] ?? 1;
        return messageLevel >= currentLevel;
    }
    formatMessage(level, message, meta) {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${this.name}] ${level.toUpperCase()}: ${message}${metaStr}`;
    }
    info(message, meta) {
        if (this.shouldLog('INFO')) {
            logger.info(this.formatMessage('INFO', message, meta));
        }
    }
    warn(message, meta) {
        if (this.shouldLog('WARN')) {
            logger.warn(this.formatMessage('WARN', message, meta));
        }
    }
    error(message, meta) {
        if (this.shouldLog('ERROR')) {
            logger.error(this.formatMessage('ERROR', message, meta));
        }
    }
    debug(message, meta) {
        if (this.shouldLog('DEBUG')) {
            logger.debug(this.formatMessage('DEBUG', message, meta));
        }
    }
}
/**
 * Logging configuration manager for diagnostics.
 *
 * @example
 */
export class DiagnosticsLoggingConfig {
    loggers = new Map();
    /**
     * Get or create a logger for a component.
     *
     * @param component
     * @param options
     * @param options.level
     */
    getLogger(component, options) {
        const key = `${component}-${options?.level}`;
        if (this.loggers.has(key)) {
            return this.loggers.get(key);
        }
        const logger = new DiagnosticsLogger(component, options);
        this.loggers.set(key, logger);
        return logger;
    }
    /**
     * Get logging configuration.
     */
    logConfiguration() {
        return {
            logLevel: process.env['LOG_LEVEL'] || 'INFO',
            enableConsole: true,
            enableFile: process.env['LOG_TO_FILE'] === 'true',
            timestamp: true,
            component: 'diagnostics',
        };
    }
}
// Singleton instance
export const loggingConfig = new DiagnosticsLoggingConfig();
export default loggingConfig;
