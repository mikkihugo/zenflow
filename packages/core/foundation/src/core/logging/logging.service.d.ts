/**
 * @fileoverview Centralized Logging Configuration for claude-code-zen
 *
 * Central logging foundation for the entire ecosystem. All libs and main system
 * use this shared logging configuration with ZEN_ environment variables.
 */
import type { UnknownRecord } from '../../types/primitives';
/**
 * Logging severity levels for the foundation logging system.
 * Follows standard logging conventions from most verbose to least verbose.
 *
 * @example
 * ```typescript`
 * const logger = getLogger('myapp');
 * logger.debug('Debug info'); // Only shown in development
 * logger.info('User action');  // General information
 * logger.warn('Deprecated API'); // Warnings
 * logger.error('Failed request'); // Errors
 * ```
 */
export declare enum LoggingLevel {
  /** Detailed trace information for debugging */
  TRACE = 'trace',
  /** Debug information useful during development */
  DEBUG = 'debug',
  /** General informational messages */
  INFO = 'info',
  /** Warning messages for potentially problematic situations */
  WARN = 'warning',
  /** Error messages for failure conditions */
  ERROR = 'error',
  /** Fatal errors that require immediate attention */
  FATAL = 'fatal',
}
/**
 * Configuration for the foundation logging system.
 * Controls logging behavior, output formats, and component-specific settings.
 *
 * @example
 * ```typescript`
 * const config: LoggingConfig = {
 *   level: LoggingLevel.INFO,
 *   enableConsole: true,
 *   enableFile: false,
 *   timestamp: true,
 *   format: 'text', *   components: {
 *     'database': LoggingLevel.DEBUG,
 *     'auth': LoggingLevel.WARN
 *}
 *};
 * ```
 */
export interface LoggingConfig {
  /** Default logging level for all components */
  level: LoggingLevel;
  /** Whether to log to console */
  enableConsole: boolean;
  /** Whether to log to file */
  enableFile: boolean;
  /** Whether to include timestamps in log messages */
  timestamp: boolean;
  /** Log output format */
  format: 'json' | 'text';
  /** Component-specific logging levels */
  components: Record<string, LoggingLevel>;
}
/**
 * Logger interface providing structured logging methods.
 * Compatible with LogTape and provides optional success/progress methods.
 *
 * @example
 * ```typescript`
 * const logger = getLogger('myservice');
 * logger.info('Service started', { port: 3000});
 * logger.error('Database connection failed', { error: err[message]});
 * logger.success?.('Operation completed successfully');
 * ```
 */
export interface Logger {
  /** Log trace level messages (most verbose) */
  trace(message: string, meta?: unknown): void;
  /** Log debug level messages */
  debug(message: string, meta?: unknown): void;
  /** Log informational messages */
  info(message: string, meta?: unknown): void;
  /** Log warning messages */
  warn(message: string, meta?: unknown): void;
  /** Log error messages */
  error(message: string, meta?: unknown): void;
  /** Log fatal error messages */
  fatal(message: string, meta?: unknown): void;
  /** Optional success logging for positive outcomes */
  success?(message: string, meta?: unknown): void;
  /** Optional progress logging for long-running operations */
  progress?(message: string, meta?: unknown): void;
}
/**
 * Get a logger instance for the specified component
 *
 * @param name Component name for the logger
 * @returns Logger instance configured with component-specific settings
 */
export declare function getLogger(name: string): Logger;
/**
 * Update global logging configuration
 *
 * @param config Partial configuration to update
 */
export declare function updateLoggingConfig(
  config: Partial<LoggingConfig>
): void;
/**
 * Get current logging configuration
 *
 * @returns Current logging configuration
 */
export declare function getLoggingConfig(): LoggingConfig;
/**
 * Validate ZEN environment variables and logging setup
 *
 * @returns Validation result with issues and current config
 */
export declare function validateLoggingEnvironment(): {
  isValid: boolean;
  issues: string[];
  config: LoggingConfig;
};
interface LogEntry {
  timestamp: string;
  level: LoggingLevel;
  category: string;
  message: string;
  meta?: UnknownRecord;
}
/**
 * Get recent log entries for WebSocket clients
 * @param limit Maximum number of entries to return
 * @returns Array of recent log entries
 */
export declare function getLogEntries(limit?: number): LogEntry[];
/**
 * Set up real-time log broadcasting callback
 * Used by WebSocket manager to receive log updates
 * @param broadcaster Function to call when new log entries are added
 */
export declare function setLogBroadcaster(
  broadcaster: (event: string, data: unknown) => void
): void;
/**
 * Clear the log broadcaster (cleanup)
 */
export declare function clearLogBroadcaster(): void;
/**
 * Force structured logging over console methods
 */
export declare const log: typeof getLogger;
export declare const logger: typeof getLogger;
export declare const createLogger: typeof getLogger;
/**
 * Override console - force everyone to use structured logging
 */
export declare const console: {
  log: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
};
declare const _default: {
  log: typeof getLogger;
  logger: typeof getLogger;
  createLogger: typeof getLogger;
  console: {
    log: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    debug: (...args: unknown[]) => void;
  };
  getLoggingConfig: typeof getLoggingConfig;
  updateLoggingConfig: typeof updateLoggingConfig;
  validateLoggingEnvironment: typeof validateLoggingEnvironment;
  loggingLevel: typeof LoggingLevel;
};
export default _default;
//# sourceMappingURL=logging.service.d.ts.map
