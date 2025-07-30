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
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
}

/**
 * Logger interface for error handling
 */
export interface ErrorLogger {
  error(message, ...args = CliErrorCode.GENERIC_ERROR, exitCode = 1) {
    super(message);
    this.name = 'CliError'
this.code = code
this.exitCode = exitCode
this.timestamp = new Date();

// Capture stack trace (V8 specific)
if (Error.captureStackTrace) {
  Error.captureStackTrace(this, CliError);
}
}

  /**
   * Create an error with additional context
   */
  withContext(context = new CliError(this.message, this.code, this.exitCode)
(error as any).context = context
return error;
}

  /**
   * Convert error to JSON representation
   */
  toJSON(): Record<string, any>
{
  return {name = null) {
    super(_message, _CliErrorCode._VALIDATION_ERROR, 1);
  this.name = 'ValidationError';
  this.field = field;
}
}

/**
 * Configuration error for config-related issues
 */
export class ConfigurationError extends CliError {
  public readonlyconfigPath = null;
  ) {
    super(
  message;
  ,
  CliErrorCode;
  .
  CONFIG_ERROR;
  , 1)
  this
  .
  name = 'ConfigurationError';
  this;
  .
  configPath = configPath;
}
}

/**
 * Command execution error for failed commands
 */
export class CommandExecutionError extends CliError {
  public readonlycommand = null;
  ,
  originalError = null;
  ) {
    super(
  message;
  ,
  CliErrorCode;
  .
  COMMAND_ERROR;
  , 1)
  this
  .
  name = 'CommandExecutionError';
  this;
  .
  command = command;
  this;
  .
  originalError = originalError;
}
}

/**
 * Format error message for user display
 */
export function formatErrorMessage(error): string {
  if (error instanceof ValidationError) {
    return `❌ ValidationError = console): number {
  const formattedMessage = formatErrorMessage(error);
  logger.error(formattedMessage);
  
  // Log stack trace in verbose mode or for unexpected errors
  if (process.env.CLAUDE_FLOW_VERBOSE || !(error instanceof CliError)) {
    logger.error('Stacktrace = error instanceof CliError ? error.exitCode : 1;
  return exitCode;
}

/**
 * Wrap a function to catch and handle errors consistently
 */
export function withErrorHandling<TArgs extends any[], TReturn>(fn = > Promise<TReturn>,
  logger?: ErrorLogger
): (...args = > Promise<TReturn> {
  return async (...args => {
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
export function createValidationError(message = > Promise<T>,
  errorMessage?: string,
  errorCode?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof CliError) {
      throw error;
    }
    
    const message = errorMessage || (error instanceof Error ? error.message = errorCode || CliErrorCode.GENERIC_ERROR;
    throw new CliError(message, code);
  }
}
