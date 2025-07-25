/**
 * Centralized error handling for Claude Code CLI
 * Implements Google's consistent error handling principle
 */

export class CliError extends Error {
  constructor(message, code = 'GENERIC_ERROR', exitCode = 1) {
    super(message);
    this.name = 'CliError';
    this.code = code;
    this.exitCode = exitCode;
    
    // Capture stack trace (V8 specific)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CliError);
    }
  }
}

export class ValidationError extends CliError {
  constructor(message, field = null) {
    super(message, 'VALIDATION_ERROR', 1);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class ConfigurationError extends CliError {
  constructor(message, configPath = null) {
    super(message, 'CONFIG_ERROR', 1);
    this.name = 'ConfigurationError';
    this.configPath = configPath;
  }
}

export class CommandExecutionError extends CliError {
  constructor(message, command = null, originalError = null) {
    super(message, 'COMMAND_ERROR', 1);
    this.name = 'CommandExecutionError';
    this.command = command;
    this.originalError = originalError;
  }
}

/**
 * Format error message for user display
 */
export function formatErrorMessage(error) {
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
export function handleError(error, logger = console) {
  const formattedMessage = formatErrorMessage(error);
  logger.error(formattedMessage);
  
  // Log stack trace in verbose mode or for unexpected errors
  if (process.env.CLAUDE_FLOW_VERBOSE || !(error instanceof CliError)) {
    logger.error('Stack trace:', error.stack);
  }
  
  const exitCode = error instanceof CliError ? error.exitCode : 1;
  return exitCode;
}