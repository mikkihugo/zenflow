import { getLogger } from '../config/logging-config';
const logger = getLogger('interfaces-mcp-mcp-logger');
export function createLogger(name) {
    const prefix = `[${name}]`;
    return {
        debug(message, meta) {
            if (process.env['DEBUG'] || process.env['MCP_DEBUG']) {
                logger.error(`${prefix} DEBUG: ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
            }
        },
        info(message, meta) {
            logger.error(`${prefix} INFO: ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
        },
        warn(message, meta) {
            logger.error(`${prefix} WARN: ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
        },
        error(message, meta) {
            logger.error(`${prefix} ERROR: ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
        },
    };
}
//# sourceMappingURL=mcp-logger.js.map