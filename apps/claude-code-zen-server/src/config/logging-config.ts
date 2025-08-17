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
export {
  getLogger,
  updateLoggingConfig,
  getLoggingConfig,
  validateLoggingEnvironment,
  LoggingLevel,
  type Logger,
  type LoggingConfig
} from '@claude-zen/foundation';

// Maintain backward compatibility for any old interfaces
export { type Logger as Logger } from '@claude-zen/foundation';

// Keep any old constants that might be referenced
export const LOG_LEVELS = {
  DEBUG: 'debug' as const,
  INFO: 'info' as const,
  WARN: 'warn' as const,
  ERROR: 'error' as const,
};

// Default export for convenience (if the old file had one)
export { default } from '@claude-zen/foundation';