/**
 * @file Logger utility - Foundation Integration
 * Re-exports foundation logging with compatibility layer for existing code.
 * @module Logger
 */

import { getLogger } from '@claude-zen/foundation';

// Re-export foundation logger types and functions
export { getLogger };
export type { Logger } from '@claude-zen/foundation';

/**
 * Legacy compatibility enum - foundation uses string levels
 * @deprecated Use foundation logging levels directly
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LoggerConfig {
  prefix?: string;
  level?: LogLevel;
}

/**
 * Legacy Logger class for compatibility.
 * @deprecated Use getLogger from @claude-zen/foundation directly
 */
export class Logger {
  private foundationLogger: ReturnType<typeof getLogger>;

  constructor(prefix: string = 'system') {
    this.foundationLogger = getLogger(prefix);
  }

  /**
   * @deprecated No longer needed - foundation handles config automatically
   */
  upgradeWithConfig(_config: unknown): void {
    // No-op for compatibility
  }

  debug(message: string, meta?: unknown): void {
    this.foundationLogger.debug(message, meta);
  }

  info(message: string, meta?: unknown): void {
    this.foundationLogger.info(message, meta);
  }

  warn(message: string, meta?: unknown): void {
    this.foundationLogger.warn(message, meta);
  }

  error(message: string, meta?: unknown): void {
    this.foundationLogger.error(message, meta);
  }
}

/**
 * @deprecated No longer needed - foundation handles config automatically
 */
export function upgradeAllLoggersWithConfig(_config: unknown): void {
  // No-op for compatibility
}

/**
 * Factory function to create a logger instance.
 * @deprecated Use getLogger from @claude-zen/foundation directly
 * @param prefix Component prefix for log messages.
 * @returns Logger instance.
 */
export function createLogger(prefix: string = 'system'): Logger {
  return new Logger(prefix);
}
