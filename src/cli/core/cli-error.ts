/**
 * Centralized error handling for Claude Code CLI
 * Implements Google's consistent error handling principle
 */

/**
 * CLI error codes enum
 */
export enum CliErrorCode {
  GENERIC_ERROR = 'GENERIC_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFIG_ERROR = 'CONFIG_ERROR',
  COMMAND_ERROR = 'COMMAND_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  FILE_ERROR = 'FILE_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR'
}

/**
 * Logger interface for error handling
 */
export interface ErrorLogger {
  error(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

/**
 * Base CLI error class
 */
export class CliError extends Error {
  public readonly code: string;
  public readonly exitCode: number;
  public readonly timestamp: Date;

  constructor(message: string, code: string = CliErrorCode.GENERIC_ERROR, exitCode: number = 1) {
    super(message);
    this.name = 'CliError';
    this.code = code;
    this.exitCode = exitCode;
    this.timestamp = new Date();
    
    // Capture stack trace (V8 specific)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CliError);
    }
  }

  /**
   * Create an error with additional context
   */
  withContext(context: Record<string, any>): CliError {
    const error = new CliError(this.message, this.code, this.exitCode);
    (error as any).context = context;
    return error;
  }

  /**
   * Convert error to JSON representation
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      exitCode: this.exitCode,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
      context: (this as any).context
    };
  }
}

/**
 * Validation error for input validation failures
 */
export class ValidationError extends CliError {
  public readonly field: string | null;

  constructor(message: string, field: string | null = null) {
    super(message, CliErrorCode.VALIDATION_ERROR, 1);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Configuration error for config-related issues
 */
export class ConfigurationError extends CliError {
  public readonly configPath: string | null;

  constructor(message: string, configPath: string | null = null) {
    super(message, CliErrorCode.CONFIG_ERROR, 1);
    this.name = 'ConfigurationError';
    this.configPath = configPath;
  }
}

/**
 * Command execution error for failed commands
 */
export class CommandExecutionError extends CliError {
  public readonly command: string | null;
  public readonly originalError: Error | null;

  constructor(message: string, command: string | null = null, originalError: Error | null = null) {
    super(message, CliErrorCode.COMMAND_ERROR, 1);
    this.name = 'CommandExecutionError';
    this.command = command;
    this.originalError = originalError;
  }
}

/**
 * Format error message for user display
 */
export function formatErrorMessage(error: Error): string {
  if (error instanceof ValidationError) {
    return `❌ Validation Error: ${error.message}${error.field ? ` (Field: ${error.field})` : ''}`;
  }
  
  if (error instanceof ConfigurationError) {
    return `❌ Configuration Error: ${error.message}${error.configPath ? ` (Config: ${error.configPath})` : ''}`;
  }
  
  if (error instanceof CommandExecutionError) {
    return `❌ Command Failed: ${error.message}${error.command ? ` (Command: ${error.command})` : ''}`;
  }
  
  if (error instanceof CliError) {
    return `❌ ${error.message}`;
  }
  
  return `❌ Unexpected Error: ${error.message}`;
}

/**
 * Handle errors consistently across the CLI
 */
export function handleError(error: Error, logger: ErrorLogger = console): number {
  const formattedMessage = formatErrorMessage(error);
  logger.error(formattedMessage);
  
  // Log stack trace in verbose mode or for unexpected errors
  if (process.env.CLAUDE_FLOW_VERBOSE || !(error instanceof CliError)) {
    logger.error('Stack trace:', error.stack);
  }
  
  // Log additional error context if available
  if (error instanceof CliError && (error as any).context) {
    logger.error('Context:', JSON.stringify((error as any).context, null, 2));
  }
  
  const exitCode = error instanceof CliError ? error.exitCode : 1;
  return exitCode;
}

/**
 * Wrap a function to catch and handle errors consistently
 */
export function withErrorHandling<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  logger?: ErrorLogger
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    try {
      return await fn(...args);
    } catch (error) {
      const exitCode = handleError(error as Error, logger);
      process.exit(exitCode);
    }
  };
}

/**
 * Create a validation error with field information
 */
export function createValidationError(message: string, field?: string): ValidationError {
  return new ValidationError(message, field);
}

/**
 * Create a configuration error with path information
 */
export function createConfigurationError(message: string, configPath?: string): ConfigurationError {
  return new ConfigurationError(message, configPath);
}

/**
 * Create a command execution error with context
 */
export function createCommandExecutionError(
  message: string, 
  command?: string, 
  originalError?: Error
): CommandExecutionError {
  return new CommandExecutionError(message, command, originalError);
}

/**
 * Assert condition and throw validation error if false
 */
export function assert(condition: boolean, message: string, field?: string): asserts condition {
  if (!condition) {
    throw new ValidationError(message, field);
  }
}

/**
 * Try-catch wrapper that converts errors to CliError
 */
export async function tryAsync<T>(
  operation: () => Promise<T>,
  errorMessage?: string,
  errorCode?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof CliError) {
      throw error;
    }
    
    const message = errorMessage || (error instanceof Error ? error.message : String(error));
    const code = errorCode || CliErrorCode.GENERIC_ERROR;
    throw new CliError(message, code);
  }
}