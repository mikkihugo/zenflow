/**
 * @fileoverview Migration Bridge - Old logging-config.ts → Shared Library
 *
 * This file maps the old logging-config.ts API to the new shared library.
 * All existing imports continue to work without any changes needed.
 *
 * OLD: import { getLogger } from '../config/logging-config';
 * NEW: Uses shared library under the hood
 */
export { getLogger, updateLoggingConfig, getLoggingConfig, validateLoggingEnvironment, LoggingLevel, type Logger, type LoggingConfig } from '@claude-zen/foundation';
export { type Logger as Logger } from '@claude-zen/foundation';
export declare const LOG_LEVELS: {
    DEBUG: "debug";
    INFO: "info";
    WARN: "warn";
    ERROR: "error";
};
export { default } from '@claude-zen/foundation';
//# sourceMappingURL=logging-config.d.ts.map