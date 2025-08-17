/**
 * @fileoverview Migration Bridge - Old logging-config.ts → Shared Library
 *
 * This file maps the old logging-config.ts API to the new shared library.
 * All existing imports continue to work without any changes needed.
 *
 * OLD: import { getLogger } from '../config/logging-config';
 * NEW: Uses shared library under the hood
 */
// Re-export everything from the shared library
export { getLogger, updateLoggingConfig, getLoggingConfig, validateLoggingEnvironment, LoggingLevel } from '@claude-zen/foundation';
// Keep any old constants that might be referenced
export const LOG_LEVELS = {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
};
// Default export for convenience (if the old file had one)
export { default } from '@claude-zen/foundation';
//# sourceMappingURL=logging-config.js.map