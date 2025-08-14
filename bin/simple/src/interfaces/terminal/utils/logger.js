import { getLogger } from '../../../config/logging-config.js';
const baseLogger = getLogger('interfaces-terminal-utils-logger');
export const createSimpleLogger = (component) => {
    const prefix = component ? `[${component}]` : '';
    return {
        debug: (_message, ..._args) => {
            if (process.env['DEBUG'] || process.env['VERBOSE']) {
            }
        },
        info: (_message, ..._args) => { },
        warn: (message, ...args) => {
            baseLogger.warn(`${prefix} WARN: ${message}`, ...args);
        },
        error: (message, ...args) => {
            baseLogger.error(`${prefix} ERROR: ${message}`, ...args);
        },
    };
};
export const logger = createSimpleLogger();
export default createSimpleLogger;
//# sourceMappingURL=logger.js.map