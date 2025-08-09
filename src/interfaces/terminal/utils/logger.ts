import { getLogger } from "../../../config/logging-config";
const logger = getLogger("interfaces-terminal-utils-logger");
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
    debug: (_message: string, ..._args: any[]) => {
      if (process.env['DEBUG'] || process.env['VERBOSE']) {
      }
    },

    info: (_message: string, ..._args: any[]) => {},

    warn: (message: string, ...args: any[]) => {
      logger.warn(`${prefix} WARN: ${message}`, ...args);
    },

    error: (message: string, ...args: any[]) => {
      logger.error(`${prefix} ERROR: ${message}`, ...args);
    },
  };
};

// Default logger instance
export const logger = createSimpleLogger();

export default createSimpleLogger;
