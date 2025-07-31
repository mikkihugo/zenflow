/**
 * @fileoverview Logger utility for Neural and Queen components
 * Simple wrapper around the core logger for component-specific logging
 * @module Logger
 */

import { createLogger, type LogLevel, type LogMeta } from './core-logger.js';

export class Logger {
  private coreLogger: ReturnType<typeof createLogger>;

  constructor(component?: string) {
    this.coreLogger = createLogger(component);
  }

  info(message: string, meta?: LogMeta): void {
    this.coreLogger.info(message, meta);
  }

  warn(message: string, meta?: LogMeta): void {
    this.coreLogger.warn(message, meta);
  }

  error(message: string, error?: Error | unknown): void {
    this.coreLogger.error(message, {}, error ?? null);
  }

  debug(message: string, meta?: LogMeta): void {
    this.coreLogger.debug(message, meta);
  }

  success(message: string, meta?: LogMeta): void {
    this.coreLogger.success(message, meta);
  }

  progress(message: string, meta?: LogMeta): void {
    this.coreLogger.progress(message, meta);
  }
}

// Export a default logger instance
export const logger = new Logger();

// Export types for convenience
export type { LogLevel, LogMeta };