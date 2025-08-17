/**
 * @fileoverview Centralized Logging Configuration for claude-code-zen
 *
 * Central logging foundation for the entire ecosystem. All libs and main system
 * use this shared logging configuration with ZEN_ environment variables.
 */
import { getLogger as getLogTapeLogger } from '@logtape/logtape';
export var LoggingLevel;
(function (LoggingLevel) {
    LoggingLevel["DEBUG"] = "debug";
    LoggingLevel["INFO"] = "info";
    LoggingLevel["WARN"] = "warn";
    LoggingLevel["ERROR"] = "error";
})(LoggingLevel || (LoggingLevel = {}));
class LoggingConfigurationManager {
    static instance;
    config;
    loggers = new Map();
    initialized = false;
    constructor() {
        this.config = this.loadConfiguration();
        this.initializeLogTape();
    }
    static getInstance() {
        if (!LoggingConfigurationManager.instance) {
            LoggingConfigurationManager.instance = new LoggingConfigurationManager();
        }
        return LoggingConfigurationManager.instance;
    }
    loadConfiguration() {
        // Load from ZEN_ environment variables with sensible defaults
        const nodeEnv = process.env['NODE_ENV'] || 'development';
        const defaultLevel = nodeEnv === 'development' ? LoggingLevel.DEBUG : LoggingLevel.INFO;
        // Use centralized ZEN environment variable access
        const zenLogLevel = process.env['ZEN_LOG_LEVEL'];
        const zenLogFormat = process.env['ZEN_LOG_FORMAT'];
        const zenLogConsole = process.env['ZEN_LOG_CONSOLE'];
        const zenLogFile = process.env['ZEN_LOG_FILE'];
        const zenLogTimestamp = process.env['ZEN_LOG_TIMESTAMP'];
        const config = {
            level: zenLogLevel || defaultLevel,
            enableConsole: zenLogConsole !== 'false',
            enableFile: zenLogFile === 'true',
            timestamp: zenLogTimestamp !== 'false',
            format: zenLogFormat || 'text',
            components: {}
        };
        // Component-specific log levels from ZEN_LOG_COMPONENT_* variables
        Object.keys(process.env).forEach(key => {
            if (key.startsWith('ZEN_LOG_COMPONENT_')) {
                const component = key.replace('ZEN_LOG_COMPONENT_', '').toLowerCase();
                const level = process.env[key];
                if (level && Object.values(LoggingLevel).includes(level)) {
                    config.components[component] = level;
                }
            }
        });
        return config;
    }
    initializeLogTape() {
        if (this.initialized)
            return;
        // LogTape will be configured by the main application
        // For standalone usage, use default LogTape configuration
        this.initialized = true;
    }
    getLogger(name) {
        if (this.loggers.has(name)) {
            return this.loggers.get(name);
        }
        // Get component-specific log level if configured
        const componentLevel = this.config.components[name.toLowerCase()] || this.config.level;
        // Create LogTape logger
        const logTapeLogger = getLogTapeLogger(name);
        // Wrap with our interface and add extra methods
        const logger = {
            debug: (message, meta) => {
                if (this.shouldLog('debug', componentLevel)) {
                    logTapeLogger.debug(this.formatMessage(message, meta));
                }
            },
            info: (message, meta) => {
                if (this.shouldLog('info', componentLevel)) {
                    logTapeLogger.info(this.formatMessage(message, meta));
                }
            },
            warn: (message, meta) => {
                if (this.shouldLog('warn', componentLevel)) {
                    logTapeLogger.warn(this.formatMessage(message, meta));
                }
            },
            error: (message, meta) => {
                if (this.shouldLog('error', componentLevel)) {
                    logTapeLogger.error(this.formatMessage(message, meta));
                }
            },
            success: (message, meta) => {
                if (this.shouldLog('info', componentLevel)) {
                    logTapeLogger.info(`✅ ${this.formatMessage(message, meta)}`);
                }
            },
            progress: (message, meta) => {
                if (this.shouldLog('info', componentLevel)) {
                    logTapeLogger.info(`🔄 ${this.formatMessage(message, meta)}`);
                }
            }
        };
        this.loggers.set(name, logger);
        return logger;
    }
    shouldLog(messageLevel, componentLevel) {
        const levels = ['debug', 'info', 'warn', 'error'];
        const messageLevelIndex = levels.indexOf(messageLevel);
        const componentLevelIndex = levels.indexOf(componentLevel);
        return messageLevelIndex >= componentLevelIndex;
    }
    formatMessage(message, meta) {
        if (!meta)
            return message;
        if (this.config.format === 'json') {
            return JSON.stringify({ message, meta });
        }
        if (typeof meta === 'object') {
            return `${message} ${JSON.stringify(meta)}`;
        }
        return `${message} ${meta}`;
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        // Reinitialize LogTape with new config
        this.initialized = false;
        this.initializeLogTape();
        // Clear cached loggers to pick up new config
        this.loggers.clear();
    }
    getConfig() {
        return { ...this.config };
    }
    // Environment validation helpers
    validateEnvironment() {
        const issues = [];
        // Check if ZEN environment variables are properly set
        const zenVars = Object.keys(process.env).filter(key => key.startsWith('ZEN_LOG_'));
        if (zenVars.length === 0) {
            issues.push('No ZEN_LOG_* environment variables found - using defaults');
        }
        // Validate log levels
        const invalidLevels = Object.entries(this.config.components)
            .filter(([, level]) => !Object.values(LoggingLevel).includes(level))
            .map(([component]) => component);
        if (invalidLevels.length > 0) {
            issues.push(`Invalid log levels for components: ${invalidLevels.join(', ')}`);
        }
        return {
            isValid: issues.length === 0,
            issues,
            config: this.getConfig()
        };
    }
}
// Singleton instance
const loggingManager = LoggingConfigurationManager.getInstance();
/**
 * Get a logger instance for the specified component
 *
 * @param name Component name for the logger
 * @returns Logger instance configured with component-specific settings
 */
export function getLogger(name) {
    return loggingManager.getLogger(name);
}
/**
 * Update global logging configuration
 *
 * @param config Partial configuration to update
 */
export function updateLoggingConfig(config) {
    loggingManager.updateConfig(config);
}
/**
 * Get current logging configuration
 *
 * @returns Current logging configuration
 */
export function getLoggingConfig() {
    return loggingManager.getConfig();
}
/**
 * Validate ZEN environment variables and logging setup
 *
 * @returns Validation result with issues and current config
 */
export function validateLoggingEnvironment() {
    return loggingManager.validateEnvironment();
}
// Export types for external use (already exported above)
// export type { LoggingConfig, Logger };
// Default export for convenience
export default {
    getLogger,
    updateLoggingConfig,
    getLoggingConfig,
    validateLoggingEnvironment,
    LoggingLevel
};
