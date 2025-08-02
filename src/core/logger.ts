/**
 * Logger - Core logging system for claude-flow
 * Uses the existing CLI logger implementation
 */

// Re-export from utils logger
export {
  createLogger,
  debug,
  error,
  info,
  type Logger,
  type LoggerConfig,
  LogLevel,
  logger,
  warn,
} from '../utils/logger.js';

/**
 * Supported log argument types
 */
export type LogArgument =
  | string
  | number
  | boolean
  | null
  | undefined
  | Error
  | Record<string, unknown>
  | readonly unknown[];

/**
 * Compatible interface for existing code with strict typing
 */
export interface ILogger {
  debug(message: string, ...args: readonly LogArgument[]): void;
  info(message: string, ...args: readonly LogArgument[]): void;
  warn(message: string, ...args: readonly LogArgument[]): void;
  error(message: string, ...args: readonly LogArgument[]): void;
  log(level: LogLevel, message: string, ...args: readonly LogArgument[]): void;
}

export default createLogger;
