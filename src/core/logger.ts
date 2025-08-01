/**
 * Logger - Core logging system for claude-flow
 * Uses the existing CLI logger implementation
 */

// Re-export from CLI utils logger which is more comprehensive
export {
  LogLevel,
  createLogger,
  logger,
  debug,
  info,
  warn,
  error,
  type Logger,
  type LoggerConfig
} from '../cli/utils/logger';

// Create a compatible interface for existing code
export interface ILogger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  log(level: any, message: string, ...args: any[]): void;
}

export default createLogger;