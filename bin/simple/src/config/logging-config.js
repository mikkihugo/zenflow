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
    constructor() {
        this.config = this.loadConfiguration();
    }
    static getInstance() {
        if (!LoggingConfigurationManager.instance) {
            LoggingConfigurationManager.instance = new LoggingConfigurationManager();
        }
        return LoggingConfigurationManager.instance;
    }
    loadConfiguration() {
        const nodeEnv = process.env['NODE_ENV'] || 'development';
        const defaultLevel = nodeEnv === 'development' ? LoggingLevel.DEBUG : LoggingLevel.INFO;
        return {
            level: process.env['LOG_LEVEL'] || defaultLevel,
            enableConsole: process.env['LOG_DISABLE_CONSOLE'] !== 'true',
            enableFile: process.env['LOG_ENABLE_FILE'] === 'true',
            timestamp: process.env['LOG_DISABLE_TIMESTAMP'] !== 'true',
            format: process.env['LOG_FORMAT'] || 'text',
            components: {
                'swarm-coordinator': process.env['LOG_LEVEL_SWARM'] || defaultLevel,
                'neural-network': process.env['LOG_LEVEL_NEURAL'] || defaultLevel,
                'mcp-server': process.env['LOG_LEVEL_MCP'] || defaultLevel,
                database: process.env['LOG_LEVEL_DB'] || defaultLevel,
            },
        };
    }
    getConfig() {
        return { ...this.config };
    }
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        this.loggers.clear();
    }
    getLogger(component) {
        if (this.loggers.has(component)) {
            return this.loggers.get(component);
        }
        const logger = this.createLoggerForComponent(component);
        this.loggers.set(component, logger);
        return logger;
    }
    createLoggerForComponent(component) {
        const componentLevel = this.config.components[component] || this.config.level;
        const originalLevel = process.env['LOG_LEVEL'];
        process.env['LOG_LEVEL'] = componentLevel;
        try {
            const coreLogger = getLogTapeLogger(component);
            const enhancedLogger = {
                debug: (message, meta) => coreLogger.debug(message, meta),
                info: (message, meta) => coreLogger.info(message, meta),
                warn: (message, meta) => coreLogger.warn(message, meta),
                error: (message, meta) => coreLogger.error(message, meta),
            };
            enhancedLogger.success = (message, meta) => {
                coreLogger.info(`✅ ${message}`, meta);
            };
            enhancedLogger.progress = (message, meta) => {
                coreLogger.info(`🔄 ${message}`, meta);
            };
            return enhancedLogger;
        }
        finally {
            if (originalLevel !== undefined) {
                process.env['LOG_LEVEL'] = originalLevel;
            }
            else {
                process.env['LOG_LEVEL'] = undefined;
            }
        }
    }
    createConsoleReplacementLogger(component) {
        const logger = this.getLogger(component);
        return {
            debug: (message, meta) => logger.debug(message, meta),
            info: (message, meta) => logger.info(message, meta),
            warn: (message, meta) => logger.warn(message, meta),
            error: (message, meta) => logger.error(message, meta),
            success: logger.success ||
                ((message, meta) => logger.info(message, meta)),
            progress: logger.progress ||
                ((message, meta) => logger.info(message, meta)),
        };
    }
    enableDebugMode() {
        this.updateConfig({
            level: LoggingLevel.DEBUG,
            components: Object.fromEntries(Object.keys(this.config.components).map((key) => [
                key,
                LoggingLevel.DEBUG,
            ])),
        });
    }
    setProductionMode() {
        this.updateConfig({
            level: LoggingLevel.INFO,
            components: Object.fromEntries(Object.keys(this.config.components).map((key) => [
                key,
                LoggingLevel.INFO,
            ])),
        });
    }
    setSilentMode() {
        this.updateConfig({
            level: LoggingLevel.ERROR,
            components: Object.fromEntries(Object.keys(this.config.components).map((key) => [
                key,
                LoggingLevel.ERROR,
            ])),
        });
    }
}
export const loggingConfigManager = LoggingConfigurationManager.getInstance();
export function getLogger(component) {
    return loggingConfigManager?.getLogger(component);
}
export function getConsoleReplacementLogger(component) {
    return loggingConfigManager?.createConsoleReplacementLogger(component);
}
export const logger = {
    system: getLogger('system'),
    cli: getConsoleReplacementLogger('cli'),
    swarm: getLogger('swarm-coordinator'),
    neural: getLogger('neural-network'),
    mcp: getLogger('mcp-server'),
    database: getLogger('database'),
};
const logEntries = [];
export function addLogEntry(entry) {
    logEntries.push({
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        ...entry,
    });
    if (logEntries.length > 1000) {
        logEntries.splice(0, logEntries.length - 1000);
    }
}
export function getLogEntries() {
    return [...logEntries];
}
addLogEntry({
    level: 'info',
    component: 'system',
    message: 'Claude Code Zen TUI initialized',
});
addLogEntry({
    level: 'info',
    component: 'terminal',
    message: 'Terminal interface ready',
});
export default loggingConfigManager;
//# sourceMappingURL=logging-config.js.map