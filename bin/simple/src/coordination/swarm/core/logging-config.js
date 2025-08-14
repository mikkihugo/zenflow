import { Logger } from './logger.ts';
const DEFAULT_LOG_LEVELS = {
    'mcp-server': 'INFO',
    'mcp-tools': 'INFO',
    'swarm-core': 'INFO',
    agent: 'DEBUG',
    neural: 'INFO',
    'wasm-loader': 'WARN',
    persistence: 'INFO',
    hooks: 'DEBUG',
    performance: 'INFO',
    memory: 'WARN',
};
const ENV_LOG_MAPPING = {
    LOG_LEVEL: null,
    MCP_LOG_LEVEL: 'mcp-server',
    TOOLS_LOG_LEVEL: 'mcp-tools',
    SWARM_LOG_LEVEL: 'swarm-core',
    AGENT_LOG_LEVEL: 'agent',
    NEURAL_LOG_LEVEL: 'neural',
    WASM_LOG_LEVEL: 'wasm-loader',
    DB_LOG_LEVEL: 'persistence',
    HOOKS_LOG_LEVEL: 'hooks',
    PERF_LOG_LEVEL: 'performance',
    MEMORY_LOG_LEVEL: 'memory',
};
export class LoggingConfig {
    loggers;
    globalLevel;
    componentLevels;
    constructor() {
        this.loggers = new Map();
        this.globalLevel = null;
        this.componentLevels = { ...DEFAULT_LOG_LEVELS };
        this.loadFromEnvironment();
    }
    loadFromEnvironment() {
        for (const [envVar, component] of Object.entries(ENV_LOG_MAPPING)) {
            const value = process.env[envVar];
            if (value) {
                if (component === null) {
                    this.globalLevel = value.toUpperCase();
                }
                else {
                    this.componentLevels[component] = value.toUpperCase();
                }
            }
        }
    }
    getLogger(component, options = {}) {
        if (this.loggers.has(component)) {
            return this.loggers.get(component);
        }
        const level = this.globalLevel || this.componentLevels[component] || 'INFO';
        const loggerOptions = {
            name: component,
            level,
            logDir: process.env['LOG_DIR'] || options?.logDir || './logs',
            ...options,
        };
        const enableStderr = process.env['MCP_MODE'] === 'stdio' || options?.enableStderr;
        if (enableStderr) {
            loggerOptions.enableStderr = true;
        }
        const enableFile = process.env['LOG_TO_FILE'] === 'true' || options?.enableFile;
        if (enableFile) {
            loggerOptions.enableFile = true;
        }
        const formatJson = process.env['LOG_FORMAT'] === 'json' || options?.formatJson;
        if (formatJson) {
            loggerOptions.formatJson = true;
        }
        const logger = new Logger(loggerOptions);
        this.loggers.set(component, logger);
        return logger;
    }
    setLogLevel(component, level) {
        this.componentLevels[component] = level.toUpperCase();
        if (this.loggers.has(component)) {
            const logger = this.loggers.get(component);
            if ('level' in logger && typeof logger.level === 'string') {
                logger.level = level.toUpperCase();
            }
        }
    }
    setGlobalLogLevel(level) {
        this.globalLevel = level.toUpperCase();
        for (const logger of this.loggers.values()) {
            logger.level = level.toUpperCase();
        }
    }
    getLogLevels() {
        return {
            global: this.globalLevel,
            components: { ...this.componentLevels },
        };
    }
    createChildLogger(parentLogger, module, correlationId = null) {
        return parentLogger?.child({
            module,
            correlationId: correlationId || parentLogger?.correlationId,
        });
    }
    logConfiguration() {
        const config = {
            globalLevel: this.globalLevel || 'Not set (using component defaults)',
            componentLevels: this.componentLevels,
            enabledFeatures: {
                fileLogging: process.env['LOG_TO_FILE'] === 'true',
                jsonFormat: process.env['LOG_FORMAT'] === 'json',
                stderrOutput: process.env['MCP_MODE'] === 'stdio',
                logDirectory: process.env['LOG_DIR'] || './logs',
            },
            environment: {
                MCP_MODE: process.env['MCP_MODE'],
                NODE_ENV: process.env['NODE_ENV'],
            },
        };
        this.getLogger('logging-config').error('📊 Logging Configuration:', config);
        return config;
    }
}
export const loggingConfig = new LoggingConfig();
export const getLogger = (component, options) => loggingConfig?.getLogger(component, options);
export const setLogLevel = (component, level) => loggingConfig?.setLogLevel(component, level);
export const setGlobalLogLevel = (level) => loggingConfig?.setGlobalLogLevel(level);
export const mcpLogger = loggingConfig?.getLogger('mcp-server');
export const toolsLogger = loggingConfig?.getLogger('mcp-tools');
export const swarmLogger = loggingConfig?.getLogger('swarm-core');
export const agentLogger = loggingConfig?.getLogger('agent');
export const neuralLogger = loggingConfig?.getLogger('neural');
export const wasmLogger = loggingConfig?.getLogger('wasm-loader');
export const dbLogger = loggingConfig?.getLogger('persistence');
export const hooksLogger = loggingConfig?.getLogger('hooks');
export const perfLogger = loggingConfig?.getLogger('performance');
export const memoryLogger = loggingConfig?.getLogger('memory');
export default loggingConfig;
//# sourceMappingURL=logging-config.js.map