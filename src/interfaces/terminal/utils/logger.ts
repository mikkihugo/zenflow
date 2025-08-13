/**
 * @file Interface implementation: logger.
 */

import { getLogger } from '../../../config/logging-config.js';

const baseLogger = getLogger('interfaces-terminal-utils-logger');
/**
 * Simple Logger for Terminal Interface.
 *
 * Standalone logger to avoid circular dependencies.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface SimpleLogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

export const createSimpleLogger = (component?: string): SimpleLogger => {
  const prefix = component ? `[${component}]` : '';

  return {
    debug: (_message: string, ..._args: unknown[]) => {
      if (process.env['DEBUG'] || process.env['VERBOSE']) {
      }
    },

    info: (_message: string, ..._args: unknown[]) => {},

    warn: (message: string, ...args: unknown[]) => {
      baseLogger.warn(`${prefix} WARN: ${message}`, ...args);
    },

    error: (message: string, ...args: unknown[]) => {
      baseLogger.error(`${prefix} ERROR: ${message}`, ...args);
    },
  };
};

// Default logger instance
export const logger = createSimpleLogger();

export default createSimpleLogger;
