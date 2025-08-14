export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (LogLevel = {}));
export class BootstrapLogger {
    logger;
    prefix;
    constructor(prefix = 'system', level = LogLevel.INFO) {
        this.prefix = prefix;
        try {
            const { getLogger } = require('@logtape/logtape');
            this.logger = getLogger(prefix);
        }
        catch (error) {
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
export function createBootstrapLogger(prefix) {
    return new BootstrapLogger(prefix);
}
export const systemLogger = createBootstrapLogger('system');
//# sourceMappingURL=bootstrap-logger.js.map