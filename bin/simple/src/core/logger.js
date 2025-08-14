import { createBootstrapLogger, } from './bootstrap-logger.ts';
export { LogLevel } from './bootstrap-logger.ts';
class EnhancedLogger {
    bootstrapLogger;
    configLoaded = false;
    prefix;
    constructor(prefix) {
        this.prefix = prefix;
        this.bootstrapLogger = createBootstrapLogger(prefix);
    }
    upgradeWithConfig(config) {
        try {
            const centralConfig = config?.getAll?.();
            if (centralConfig) {
                this.configLoaded = true;
            }
        }
        catch (error) {
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
const loggerRegistry = new Map();
export class Logger extends EnhancedLogger {
    constructor(prefix = 'system') {
        super(prefix);
        loggerRegistry.set(prefix, this);
    }
}
export function upgradeAllLoggersWithConfig(config) {
    for (const logger of loggerRegistry.values()) {
        logger.upgradeWithConfig(config);
    }
}
export function createLogger(prefix = 'system') {
    return new Logger(prefix);
}
//# sourceMappingURL=logger.js.map