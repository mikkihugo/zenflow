/**
 * @fileoverview Centralized Logging Configuration for claude-code-zen
 *
 * Central logging foundation for the entire ecosystem. All libs and main system
 * use this shared logging configuration with ZEN_ environment variables.
 */
import { getLogger as getLogTapeLogger, } from '@logtape/logtape';
/**
 * Logging severity levels for the foundation logging system.
 * Follows standard logging conventions from most verbose to least verbose.
 *
 * @example
 * ```typescript`
 * const logger = getLogger('myapp');
 * logger.debug('Debug info'); // Only shown in development
 * logger.info('User action');  // General information
 * logger.warn('Deprecated API'); // Warnings
 * logger.error('Failed request'); // Errors
 * ```
 */
export var LoggingLevel;
(function (LoggingLevel) {
    /** Detailed trace information for debugging */
    LoggingLevel["TRACE"] = "trace";
    /** Debug information useful during development */
    LoggingLevel["DEBUG"] = "debug";
    /** General informational messages */
    LoggingLevel["INFO"] = "info";
    /** Warning messages for potentially problematic situations */
    LoggingLevel["WARN"] = "warning";
    /** Error messages for failure conditions */
    LoggingLevel["ERROR"] = "error";
    /** Fatal errors that require immediate attention */
    LoggingLevel["FATAL"] = "fatal";
})(LoggingLevel || (LoggingLevel = {}));
class LoggingConfigurationManager {
    static instance;
    config;
    loggers = new Map();
    initialized = false;
    constructor() {
        this.config = this.loadConfiguration();
        // Initialize LogTape asynchronously - will be handled by getInstance
    }
    static getInstance() {
        if (!LoggingConfigurationManager.instance) {
            LoggingConfigurationManager.instance = new LoggingConfigurationManager();
            // Initialize LogTape asynchronously when needed
            LoggingConfigurationManager.instance
                .initializeLogTape()
                .catch((error) => {
                // Enhanced error handling for logging initialization
                console.error('LogTape initialization failed:', {
                    error: error['message'],
                    timestamp: new Date().toISOString(),
                    fallback: 'Console logging will be used',
                });
            });
        }
        return LoggingConfigurationManager.instance;
    }
    loadConfiguration() {
        try {
            return this.createConfigFromEnvironment();
        }
        catch (error) {
            this.logFallbackWarning(error);
            return this.createConfigFromEnvironment();
        }
    }
    createConfigFromEnvironment() {
        const defaultLevel = this.getDefaultLogLevel();
        const config = this.buildBaseConfig(defaultLevel);
        this.addComponentLevels(config);
        return config;
    }
    getDefaultLogLevel() {
        const nodeEnv = process.env['NODE_ENV'] || 'development';
        return nodeEnv === 'development' ? LoggingLevel.DEBUG : LoggingLevel.INFO;
    }
    buildBaseConfig(defaultLevel) {
        const zenLogLevel = process.env['ZEN_LOG_LEVEL'];
        const zenLogFormat = process.env['ZEN_LOG_FORMAT'];
        const zenLogConsole = process.env['ZEN_LOG_CONSOLE'];
        const zenLogFile = process.env['ZEN_LOG_FILE'];
        const zenLogTimestamp = process.env['ZEN_LOG_TIMESTAMP'];
        return {
            level: zenLogLevel || defaultLevel,
            enableConsole: zenLogConsole !== 'false',
            enableFile: zenLogFile === 'true',
            timestamp: zenLogTimestamp !== 'false',
            format: zenLogFormat || 'text',
            components: {},
        };
    }
    addComponentLevels(config) {
        for (const key of Object.keys(process.env)) {
            if (key.startsWith('ZEN_LOG_COMPONENT_')) {
                const component = key.replace('ZEN_LOG_COMPONENT_', '').toLowerCase();
                const level = process.env[key];
                if (level && Object.values(LoggingLevel).includes(level)) {
                    config.components[component] = level;
                }
            }
        }
    }
    logFallbackWarning(error) {
        console.warn('[LoggingConfig] Configuration fallback activated:', {
            reason: 'Central config failed',
            error: error instanceof Error ? error['message'] : String(error),
            fallback: 'Environment variables',
            timestamp: new Date().toISOString(),
        });
    }
    async initializeLogTape() {
        if (this.initialized) {
            return;
        }
        const collectorConfig = await this.setupInternalCollector();
        const { configure } = await import('@logtape/logtape');
        const sinkConfig = this.createSinkConfiguration(collectorConfig);
        const loggerConfig = this.createLoggerConfiguration(collectorConfig.useInternalCollector);
        await configure({
            sinks: sinkConfig,
            loggers: loggerConfig,
        });
        this.initialized = true;
    }
    /**
     * Setup internal OTEL collector configuration
     */
    async setupInternalCollector() {
        const config = {
            internalCollectorSink: null,
            useInternalCollector: false,
        };
        try {
            const otelConfig = this.loadOtelEnvironmentConfig();
            if (otelConfig.useInternalOtelCollector && otelConfig.zenOtelEnabled) {
                const isCollectorReachable = await this.checkCollectorAvailability(otelConfig.internalCollectorEndpoint);
                if (isCollectorReachable) {
                    config.internalCollectorSink = this.createInternalCollectorSink(otelConfig.internalCollectorEndpoint);
                    config.useInternalCollector = true;
                    this.logCollectorSuccess(otelConfig.internalCollectorEndpoint);
                }
                else {
                    this.handleCollectorFallback(otelConfig);
                }
            }
        }
        catch {
            console.info(' Foundation LogTape using console-only (OTEL unavailable)');
        }
        return config;
    }
    /**
     * Load OTEL configuration from environment variables
     */
    loadOtelEnvironmentConfig() {
        return {
            useInternalOtelCollector: process.env['ZEN_USE_INTERNAL_OTEL_COLLECTOR'] !== 'false',
            zenOtelEnabled: process.env['ZEN_OTEL_ENABLED'] === 'true',
            internalCollectorEndpoint: process.env['ZEN_INTERNAL_COLLECTOR_ENDPOINT'] ||
                'http: //localhost:4318',
            otelLogsExporter: process.env['OTEL_LOGS_EXPORTER'],
        };
    }
    /**
     * Check if OTEL collector is available
     */
    async checkCollectorAvailability(endpoint) {
        try {
            const response = await globalThis
                .fetch(`${endpoint}/health`, {
                method: 'GET',
                headers: { accept: 'application/json' },
            })
                .catch(() => null);
            return response?.ok === true;
        }
        catch {
            return false;
        }
    }
    /**
     * Handle collector fallback scenarios
     */
    handleCollectorFallback(otelConfig) {
        console.info('  Internal OTEL collector unavailable, trying external OTEL...');
        if (otelConfig.otelLogsExporter === 'otlp' || otelConfig.zenOtelEnabled) {
            console.info('  OTEL integration has been moved to @claude-zen/infrastructure package. Use getTelemetryManager() instead.');
            console.info('   Foundation logging will use console-only mode.');
        }
    }
    /**
     * Log successful collector initialization
     */
    logCollectorSuccess(endpoint) {
        console.info('[LogTape] System initialized successfully:', {
            collector: 'Internal OTEL collector',
            endpoint,
            status: 'active',
            timestamp: new Date().toISOString(),
        });
        console.info(`   Internal Collector: ${endpoint}/ingest`);
        console.info('   Service: claude-zen-foundation');
    }
    /**
     * Create sink configuration
     */
    createSinkConfiguration(collectorConfig) {
        const sinkConfig = {
            console: this.createConsoleSink(),
        };
        if (collectorConfig.useInternalCollector &&
            collectorConfig.internalCollectorSink) {
            sinkConfig['collector'] = collectorConfig.internalCollectorSink;
        }
        return sinkConfig;
    }
    /**
     * Create console sink handler
     */
    createConsoleSink() {
        return (record) => {
            if (!this.config.enableConsole) {
                return;
            }
            const timestamp = this.config.timestamp
                ? `[${new Date(record['timestamp']).toISOString()}] `
                : '';
            const level = String(record['level']).toUpperCase().padStart(5);
            const category = Array.isArray(record['category'])
                ? record['category'].join('.')
                : String(record['category'] || 'unknown');
            const message = Array.isArray(record['message'])
                ? record['message'].join('')
                : String(record['message'] || '');
            const properties = (record['properties'] || {});
            const props = Object.keys(properties).length > 0
                ? ` ${JSON.stringify(properties)}`
                : '';
            console.info(`${timestamp}${level} [${category}] ${message}${props}`);
        };
    }
    /**
     * Create logger configuration
     */
    createLoggerConfiguration(useInternalCollector) {
        const sinks = useInternalCollector ? ['console', 'collector'] : ['console'];
        return [
            {
                category: ['foundation'],
                sinks,
                lowestLevel: this.config.level,
            },
            {
                category: ['claude-code-sdk-integration'],
                sinks,
                lowestLevel: this.config.level,
            },
            {
                category: ['SyslogBridge'],
                sinks,
                lowestLevel: this.config.level,
            },
            {
                category: ['logtape', 'meta'],
                sinks: ['console'],
                lowestLevel: 'warning',
            },
            {
                category: [],
                sinks,
                lowestLevel: 'info',
            },
        ];
    }
    /**
     * Create a custom sink that sends logs to the internal OTEL collector
     */
    createInternalCollectorSink(collectorEndpoint) {
        return async (record) => {
            try {
                const { timestamp } = record;
                const level = String(record['level'] || 'info');
                const category = Array.isArray(record['category'])
                    ? record['category']
                    : [String(record['category'] || 'unknown')];
                const message = Array.isArray(record['message'])
                    ? record['message']
                    : [String(record['message'] || '')];
                const properties = (record['properties'] || {});
                // Convert LogTape record to our internal telemetry format
                const telemetryData = {
                    timestamp,
                    type: 'logs',
                    service: {
                        name: 'claude-zen-foundation',
                        version: '1.0.0',
                        instance: process.env['HOSTNAME'] || 'localhost',
                    },
                    data: {
                        logs: [
                            {
                                timestamp,
                                level: level.toLowerCase(),
                                message: message.join(''),
                                body: message.join(''),
                                category: category.join('.'),
                                properties,
                                severity: this.mapLogLevelToSeverity(level),
                            },
                        ],
                    },
                    attributes: {
                        logLogger: category.join('.'),
                        logLevel: level.toLowerCase(),
                        serviceName: 'claude-zen-foundation',
                        ...properties,
                    },
                };
                // Send to internal collector via HTTP POST
                await globalThis
                    .fetch(`${collectorEndpoint}/ingest`, {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify(telemetryData),
                })
                    .catch((fetchError) => {
                    // Silently ignore fetch errors to avoid logging loops
                    console.debug('Failed to send log to internal collector:', fetchError['message']);
                });
            }
            catch (error) {
                // Silently ignore errors to avoid logging loops
                console.debug('Internal collector sink error:', error);
            }
        };
    }
    /**
     * Map LogTape log levels to OpenTelemetry severity numbers
     */
    mapLogLevelToSeverity(level) {
        const severityMap = {
            trace: 1, // TRACE
            debug: 5, // DEBUG
            info: 9, // INFO
            warning: 13, // WARN
            error: 17, // ERROR
            critical: 21, // FATAL
        };
        return severityMap[level.toLowerCase()] || 9;
    }
    createLoggerMethod(name, level, logTapeMethod, componentLevel) {
        return (message, meta) => {
            if (this.shouldLog(level, componentLevel)) {
                const formattedMessage = this.formatMessage(message, meta);
                logTapeMethod(formattedMessage);
                addLogEntry({
                    timestamp: new Date().toISOString(),
                    level,
                    category: name,
                    message: formattedMessage,
                    meta: meta,
                });
            }
        };
    }
    createWrappedLogger(name, logTapeLogger, componentLevel) {
        return {
            trace: this.createLoggerMethod(name, LoggingLevel.TRACE, logTapeLogger.debug.bind(logTapeLogger), componentLevel),
            debug: this.createLoggerMethod(name, LoggingLevel.DEBUG, logTapeLogger.debug.bind(logTapeLogger), componentLevel),
            info: this.createLoggerMethod(name, LoggingLevel.INFO, logTapeLogger.info.bind(logTapeLogger), componentLevel),
            warn: this.createLoggerMethod(name, LoggingLevel.WARN, logTapeLogger.warn.bind(logTapeLogger), componentLevel),
            error: this.createLoggerMethod(name, LoggingLevel.ERROR, logTapeLogger.error.bind(logTapeLogger), componentLevel),
            fatal: this.createLoggerMethod(name, LoggingLevel.FATAL, logTapeLogger.error.bind(logTapeLogger), componentLevel),
        };
    }
    getLogger(name) {
        if (this.loggers.has(name)) {
            const logger = this.loggers.get(name);
            if (!logger) {
                throw new Error(`Logger '${name}' not found`);
            }
            return logger;
        }
        const componentLevel = this.config.components[name.toLowerCase()] || this.config.level;
        const logTapeLogger = getLogTapeLogger(name);
        const logger = this.createWrappedLogger(name, logTapeLogger, componentLevel);
        // Add success and progress methods
        logger.success = (message, meta) => {
            if (this.shouldLog('info', componentLevel)) {
                const formattedMessage = ` ${this.formatMessage(message, meta)}`;
                logTapeLogger.info(formattedMessage);
                addLogEntry({
                    timestamp: new Date().toISOString(),
                    level: LoggingLevel.INFO,
                    category: name,
                    message: formattedMessage,
                    meta: meta,
                });
            }
        };
        logger.progress = (message, meta) => {
            if (this.shouldLog('info', componentLevel)) {
                const formattedMessage = ` ${this.formatMessage(message, meta)}`;
                logTapeLogger.info(formattedMessage);
                addLogEntry({
                    timestamp: new Date().toISOString(),
                    level: LoggingLevel.INFO,
                    category: name,
                    message: formattedMessage,
                    meta: meta,
                });
            }
        };
        this.loggers.set(name, logger);
        return logger;
    }
    shouldLog(messageLevel, componentLevel) {
        const levels = ['trace', 'debug', 'info', 'warning', 'error'];
        const messageLevelIndex = levels.indexOf(messageLevel);
        const componentLevelIndex = levels.indexOf(componentLevel);
        return messageLevelIndex >= componentLevelIndex;
    }
    formatMessage(message, meta) {
        if (!meta) {
            return message;
        }
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
        this.initializeLogTape().catch(console.error);
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
        const zenVars = Object.keys(process.env).filter((key) => key.startsWith('ZEN_LOG_'));
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
            config: this.getConfig(),
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
// Internal log storage (in-memory circular buffer)
const LOG_BUFFER_SIZE = 1000;
const logBuffer = [];
let logBroadcaster = null;
/**
 * Add log entry to buffer and broadcast if enabled
 */
function addLogEntry(entry) {
    // Add to circular buffer
    logBuffer.push(entry);
    if (logBuffer.length > LOG_BUFFER_SIZE) {
        logBuffer.shift(); // Remove oldest entry
    }
    // Broadcast to WebSocket clients if broadcaster is set
    if (logBroadcaster) {
        logBroadcaster('log: entry', entry);
    }
}
/**
 * Get recent log entries for WebSocket clients
 * @param limit Maximum number of entries to return
 * @returns Array of recent log entries
 */
export function getLogEntries(limit = 100) {
    return logBuffer.slice(-limit);
}
/**
 * Set up real-time log broadcasting callback
 * Used by WebSocket manager to receive log updates
 * @param broadcaster Function to call when new log entries are added
 */
export function setLogBroadcaster(broadcaster) {
    logBroadcaster = broadcaster;
}
/**
 * Clear the log broadcaster (cleanup)
 */
export function clearLogBroadcaster() {
    logBroadcaster = null;
}
// LOGGING FORCING STRATEGY - No console.log or winston allowed!
// =============================================================================
/**
 * Force structured logging over console methods
 */
export const log = getLogger;
export const logger = getLogger;
export const createLogger = getLogger;
/**
 * Override console - force everyone to use structured logging
 */
export const console = {
    log: (...args) => getLogger('console').info(args.join(' ')),
    info: (...args) => getLogger('console').info(args.join(' ')),
    warn: (...args) => getLogger('console').warn(args.join(' ')),
    error: (...args) => getLogger('console').error(args.join(' ')),
    debug: (...args) => getLogger('console').debug(args.join(' ')),
};
// Default export - only the forcing names
export default {
    log: getLogger,
    logger: getLogger,
    createLogger: getLogger,
    console,
    getLoggingConfig,
    updateLoggingConfig,
    validateLoggingEnvironment,
    loggingLevel: LoggingLevel,
};
