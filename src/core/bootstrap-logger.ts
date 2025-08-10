/**
 * @file Bootstrap Logger - Logtape Integration.
 *
 * Simple logger that works without config dependencies by using logtape directly.
 * Used for early initialization before full config system is ready.
 *
 * This BREAKS the circular dependency: logger ↔ config.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface ILogger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
}

/**
 * Bootstrap logger that works without config system - uses logtape directly.
 *
 * @example
 */
export class BootstrapLogger implements ILogger {
  private logger: any; // logtape logger
  private prefix: string;

  constructor(prefix: string = 'system', level: LogLevel = LogLevel.INFO) {
    this.prefix = prefix;
    try {
      // Try to use logtape if available, fallback to console
      const { getLogger } = require('@logtape/logtape');
      this.logger = getLogger(prefix);
    } catch (error) {
      // Fallback to console if logtape not ready
      this.logger = {
        debug: (msg: string, meta?: any) => console.debug(`[${prefix}] DEBUG: ${msg}`, meta || ''),
        info: (msg: string, meta?: any) => console.info(`[${prefix}] INFO: ${msg}`, meta || ''),
        warn: (msg: string, meta?: any) => console.warn(`[${prefix}] WARN: ${msg}`, meta || ''),
        error: (msg: string, meta?: any) => console.error(`[${prefix}] ERROR: ${msg}`, meta || ''),
      };
    }
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }
}

/**
 * Factory function for creating bootstrap loggers.
 *
 * @param prefix
 * @example
 */
export function createBootstrapLogger(prefix: string): ILogger {
  return new BootstrapLogger(prefix);
}

/**
 * Global bootstrap logger for system initialization.
 */
export const systemLogger = createBootstrapLogger('system');
