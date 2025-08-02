/**
 * Simple Logger for Terminal Interface
 *
 * Standalone logger to avoid circular dependencies.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface SimpleLogger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

export const createSimpleLogger = (component?: string): SimpleLogger => {
  const prefix = component ? `[${component}]` : '';

  return {
    debug: (message: string, ...args: any[]) => {
      if (process.env.DEBUG || process.env.VERBOSE) {
        console.debug(`${prefix} DEBUG: ${message}`, ...args);
      }
    },

    info: (message: string, ...args: any[]) => {
      console.info(`${prefix} INFO: ${message}`, ...args);
    },

    warn: (message: string, ...args: any[]) => {
      console.warn(`${prefix} WARN: ${message}`, ...args);
    },

    error: (message: string, ...args: any[]) => {
      console.error(`${prefix} ERROR: ${message}`, ...args);
    },
  };
};

// Default logger instance
export const logger = createSimpleLogger();

export default createSimpleLogger;
