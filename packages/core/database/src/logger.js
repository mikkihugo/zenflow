/**
 * Simple Logger Implementation
 *
 * Provides logging functionality when @claude-zen/foundation is not available.
 * Falls back to console logging with structured format.
 */
class SimpleLogger {
    component;
    constructor(component) {
        this.component = component;
    }
    debug(message, context) {
        this.log('DEBUG', message, context);
    }
    info(message, context) {
        this.log('INFO', message, context);
    }
    warn(message, context) {
        this.log('WARN', message, context);
    }
    error(message, context) {
        this.log('ERROR', message, context);
    }
    log(level, message, context) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            component: this.component,
            message,
            ...(context || {}),
        };
        // Use appropriate console method based on level
        switch (level) {
            case 'DEBUG':
                // eslint-disable-next-line no-console
                console.debug(JSON.stringify(logEntry));
                break;
            case 'INFO':
                // eslint-disable-next-line no-console
                console.info(JSON.stringify(logEntry));
                break;
            case 'WARN':
                // eslint-disable-next-line no-console
                console.warn(JSON.stringify(logEntry));
                break;
            case 'ERROR':
                // eslint-disable-next-line no-console
                console.error(JSON.stringify(logEntry));
                break;
            default:
                // eslint-disable-next-line no-console
                console.info(JSON.stringify(logEntry));
        }
    }
}
/**
 * Get a logger instance for the specified component
 */
export function getLogger(component) {
    try {
        // Try to use @claude-zen/foundation logger if available
        const { getLogger: foundationLogger } = require('@claude-zen/foundation');
        return foundationLogger(component);
    }
    catch {
        // Fall back to simple logger if foundation is not available
        return new SimpleLogger(component);
    }
}
