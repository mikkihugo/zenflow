/**
 * @file Simple Logger Interface for Event System
 *
 * Standalone logger interface that doesn't depend on external config'
 */

/**
 * Logger interface for event system logging operations.
 *
 * Provides consistent logging interface across all event system components
 * with support for structured logging and multiple log levels.
 *
 * @interface Logger
 * @example
 * ```typescript`
 * const logger: Logger = new ConsoleLogger('my-component');'
 *
 * logger.info('Component initialized', { version: '1.0.0' });'
 * logger.warn('Performance threshold exceeded', { cpu: 85 });'
 * logger.error('Operation failed', error);'
 * ````
 */
export interface Logger {
  /**
   * Log debug-level messages for development and troubleshooting.
   *
   * @param message - Debug message to log
   * @param args - Additional arguments to include in log output
   */
  debug(message: string, ...args: unknown[]): void;

  /**
   * Log informational messages for general system operation.
   *
   * @param message - Information message to log
   * @param args - Additional arguments to include in log output
   */
  info(message: string, ...args: unknown[]): void;

  /**
   * Log warning messages for potential issues that don't prevent operation.'
   *
   * @param message - Warning message to log
   * @param args - Additional arguments to include in log output
   */
  warn(message: string, ...args: unknown[]): void;

  /**
   * Log error messages for failures and exceptions.
   *
   * @param message - Error message to log
   * @param args - Additional arguments to include in log output (typically error objects)
   */
  error(message: string, ...args: unknown[]): void;
}

/**
 * Default console logger implementation.
 *
 * Provides a simple console-based logger that implements the Logger interface
 * with formatted output including component prefixes for better log organization.
 *
 * @class ConsoleLogger
 * @implements Logger
 * @example
 * ```typescript`
 * // Create logger with custom prefix
 * const logger = new ConsoleLogger('my-component');'
 *
 * // Use default prefix
 * const defaultLogger = new ConsoleLogger();
 *
 * logger.info('Component started successfully');'
 * // Output: [my-component] Component started successfully
 * ````
 */
export class ConsoleLogger implements Logger {
  /**
   * Create a new console logger with optional prefix.
   *
   * @param prefix - Prefix to include in all log messages (default: 'event-system')'
   */
  constructor(private prefix: string = 'event-system') {}'

  /**
   * Log debug messages to console.debug with prefix.
   *
   * @param message - Debug message to log
   * @param args - Additional arguments to include in debug output
   */
  debug(message: string, ...args: unknown[]): void {
    console.debug(`[${this.prefix}] ${message}`, ...args);`
  }

  /**
   * Log info messages to console.info with prefix.
   *
   * @param message - Information message to log
   * @param args - Additional arguments to include in info output
   */
  info(message: string, ...args: unknown[]): void {
    console.info(`[${this.prefix}] ${message}`, ...args);`
  }

  /**
   * Log warning messages to console.warn with prefix.
   *
   * @param message - Warning message to log
   * @param args - Additional arguments to include in warning output
   */
  warn(message: string, ...args: unknown[]): void {
    console.warn(`[${this.prefix}] ${message}`, ...args);`
  }

  /**
   * Log error messages to console.error with prefix.
   *
   * @param message - Error message to log
   * @param args - Additional arguments to include in error output
   */
  error(message: string, ...args: unknown[]): void {
    console.error(`[${this.prefix}] ${message}`, ...args);`
  }
}

/**
 * Get a logger instance for a given context.
 *
 * Factory function that creates a new ConsoleLogger instance with the specified
 * context as the prefix. This provides a convenient way to create loggers
 * for different components or modules.
 *
 * @param context - Context name to use as the logger prefix
 * @returns New Logger instance configured with the specified context
 * @example
 * ```typescript`
 * // Create loggers for different components
 * const eventLogger = getLogger('event-manager');'
 * const adapterLogger = getLogger('coordination-adapter');'
 *
 * eventLogger.info('Event manager started');'
 * // Output: [event-manager] Event manager started
 *
 * adapterLogger.debug('Processing coordination event');'
 * // Output: [coordination-adapter] Processing coordination event
 * ````
 */
export function getLogger(context: string): Logger {
  return new ConsoleLogger(context);
}
