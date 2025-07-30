
/** CLI Types;
/** Type definitions for command-line interface components;

// Re-export CLI errors
export type { // eslint-disable-line
  CliError as CLIError,
CliErrorCode,
CommandExecutionError,
ConfigurationError,
formatErrorMessage,
handleError,
ValidationError  } from '../cli/core/cli-error.js'
// =============================================================================
// CLI ERROR TYPES
// =============================================================================

/** CLI error codes enum;

export // enum CliErrorCode {
  GENERIC_ERROR = 'GENERIC_ERROR',
VALIDATION_ERROR = 'VALIDATION_ERROR',
CONFIG_ERROR = 'CONFIG_ERROR',
COMMAND_ERROR = 'COMMAND_ERROR',
NETWORK_ERROR = 'NETWORK_ERROR',
FILE_ERROR = 'FILE_ERROR',
PERMISSION_ERROR = 'PERMISSION_ERROR',
TIMEOUT_ERROR = 'TIMEOUT_ERROR',
AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
NOT_FOUND_ERROR = 'NOT_FOUND_ERROR' }

/** Logger interface for error handling;

// export // interface ErrorLogger {
//   error(message, ...args = ============================================================================;
// // COMMAND DEFINITIONS
// // =============================================================================

//  * Command argument types;

// export type CommandArgumentType = 'string' | 'number' | 'boolean' | 'array' | 'object'

//  * Command flag definition(enhanced);

// export interface CommandFlag {name = > boolean | string
// // }

/** Command argument definition;

// export // interface CommandArgument {name = > boolean | string
// alias?;
// // }

/** Command option definition;

// export // interface CommandOption extends CommandArgument {
//   short?;long = (context) => Promise<CommandResult>

//  * Command execution result(enhanced);

// export interface CommandResult {success = ============================================================================
// // EXIT CODES
// // =============================================================================

//  * Exit code constants;

// export // enum ExitCode {
//   SUCCESS = 0

// GENERAL_ERROR = 1,
// MISUSE = 2,
// CANNOT_EXECUTE = 126,
// COMMAND_NOT_FOUND = 127,
// INVALID_EXIT_ARGUMENT = 128,
// FATAL_ERROR_SIGNAL_OFFSET = 128,
// SCRIPT_TERMINATED_BY_CTRL_C = 130;
// // }
// =============================================================================
// VALIDATION TYPES
// =============================================================================

/** Validation result;

// export // interface ValidationResult {isValid = ============================================================================
// // ERROR TYPES(Extended)
// // =============================================================================

//  * Command not found error;

// export class CommandNotFoundError extends Error {
//   constructor(command = 'CommandNotFoundError';
// // }
// }

/** Invalid argument error;

// export class InvalidArgumentError extends Error {
  constructor(argument,reason = 'InvalidArgumentError';
// }
// }
// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

/** CLI configuration;

// export interface CliConfig {name = 'default' | 'file' | 'env' | 'cli' | 'override'

/** Configuration entry;

// export interface ConfigEntry {key = ============================================================================
// PARSING TYPES
// =============================================================================

/** Parsed arguments;

// export interface ParsedArguments {command = ============================================================================
// UTILITY TYPES
// =============================================================================

/** Command name with optional subcommand;

// export type CommandName = string | [string
, string]

/** Command category;

// export type CommandCategory = 'core';
| 'development'
| 'deployment'
| 'configuration'
| 'utility'
| 'plugin'

}}}}})))
