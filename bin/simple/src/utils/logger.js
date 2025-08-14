import { getLogger } from '../config/logging-config.ts';
const logger = getLogger('src-utils-logger');
import { config } from '../config/index.js';
function sanitizeLogMeta(meta) {
    if (typeof meta === 'string') {
        return meta.replace(/[\n\r]/g, '');
    }
    if (typeof meta === 'object' && meta !== null) {
        const sanitized = Array.isArray(meta) ? [] : {};
        for (const key in meta) {
            if (Object.hasOwn(meta, key)) {
                const value = meta[key];
                if (typeof value === 'string') {
                    sanitized[key] = value.replace(/[\n\r]/g, '');
                }
                else if (typeof value === 'object' && value !== null) {
                    sanitized[key] = sanitizeLogMeta(value);
                }
                else {
                    sanitized[key] = value;
                }
            }
        }
        return sanitized;
    }
    return meta;
}
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
})(LogLevel || (LogLevel = {}));
const getLogLevel = () => {
    try {
        const centralConfig = config?.getAll();
        const configLevel = centralConfig?.core?.logger?.level.toUpperCase();
        const level = centralConfig?.environment?.isDevelopment && configLevel === 'INFO'
            ? 'DEBUG'
            : configLevel;
        return (Object.values(LogLevel).find((l) => l.toUpperCase() === level) || LogLevel.INFO);
    }
    catch (error) {
        return LogLevel.INFO;
    }
};
const shouldLog = (messageLevel, configuredLevel = getLogLevel()) => {
    const levels = {
        [LogLevel.DEBUG]: 0,
        [LogLevel.INFO]: 1,
        [LogLevel.WARN]: 2,
        [LogLevel.ERROR]: 3,
    };
    return levels[messageLevel] >= levels[configuredLevel];
};
class Logger {
    prefix;
    logLevel;
    constructor(prefix = '') {
        this.prefix = prefix;
        this.logLevel = getLogLevel();
    }
    formatMessage(level, message, meta) {
        const timestamp = new Date().toISOString();
        const cleanMeta = sanitizeLogMeta(meta);
        const metaStr = cleanMeta && Object.keys(cleanMeta).length > 0
            ? ` ${JSON.stringify(cleanMeta)}`
            : '';
        return `[${timestamp}] ${level.toUpperCase()} [${this.prefix || 'claude-zen'}]: ${message}${metaStr}`;
    }
    debug(message, meta) {
        if (shouldLog(LogLevel.DEBUG, this.logLevel)) {
            logger.debug(this.formatMessage('DEBUG', message, meta));
        }
    }
    info(message, meta) {
        if (shouldLog(LogLevel.INFO, this.logLevel)) {
            logger.info(this.formatMessage('INFO', message, meta));
        }
    }
    warn(message, meta) {
        if (shouldLog(LogLevel.WARN, this.logLevel)) {
            logger.warn(this.formatMessage('WARN', message, meta));
        }
    }
    error(message, meta) {
        if (shouldLog(LogLevel.ERROR, this.logLevel)) {
            logger.error(this.formatMessage('ERROR', message, meta));
        }
    }
}
export function createUtilsLogger(prefix) {
    return new Logger(prefix);
}
export const defaultLogger = createUtilsLogger('claude-zen');
//# sourceMappingURL=logger.js.map