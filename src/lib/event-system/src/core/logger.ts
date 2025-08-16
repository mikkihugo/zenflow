/**
 * @file Simple Logger Interface for Event System
 * 
 * Standalone logger interface that doesn't depend on external config
 */

export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

/**
 * Default console logger implementation
 */
export class ConsoleLogger implements Logger {
  constructor(private prefix: string = 'event-system') {}

  debug(message: string, ...args: unknown[]): void {
    console.debug(`[${this.prefix}] ${message}`, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    console.info(`[${this.prefix}] ${message}`, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`[${this.prefix}] ${message}`, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(`[${this.prefix}] ${message}`, ...args);
  }
}

/**
 * Get a logger instance for a given context
 */
export function getLogger(context: string): Logger {
  return new ConsoleLogger(context);
}