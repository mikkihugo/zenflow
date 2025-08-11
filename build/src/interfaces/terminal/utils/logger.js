/**
 * @file Interface implementation: logger.
 */
import { getLogger } from '../config/logging-config';
const logger = getLogger('interfaces-terminal-utils-logger');
export const createSimpleLogger = (component) => {
    const prefix = component ? `[${component}]` : '';
    return {
        debug: (_message, ..._args) => {
            if (process.env['DEBUG'] || process.env['VERBOSE']) {
            }
        },
        info: (_message, ..._args) => { },
        warn: (message, ...args) => {
            logger.warn(`${prefix} WARN: ${message}`, ...args);
        },
        error: (message, ...args) => {
            logger.error(`${prefix} ERROR: ${message}`, ...args);
        },
    };
};
// Default logger instance
export const logger = createSimpleLogger();
export default createSimpleLogger;
