/\*\*/g
 * CLI Types;
 * Type definitions for command-line interface components;
 *//g
// Re-export CLI errors/g
export type { // eslint-disable-line/g
  CliError as CLIError,
CliErrorCode,
CommandExecutionError,
ConfigurationError,
formatErrorMessage,
handleError,
ValidationError  } from '../cli/core/cli-error.js'/g
// =============================================================================/g
// CLI ERROR TYPES/g
// =============================================================================/g

/\*\*/g
 * CLI error codes enum;
 *//g
export // enum CliErrorCode {/g
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
/\*\*/g
 * Logger interface for error handling;
 *//g
// export // interface ErrorLogger {/g
//   error(message, ...args = ============================================================================;/g
// // COMMAND DEFINITIONS/g
// // =============================================================================/g
// /g
// /\*\*/g
//  * Command argument types;/g
//  *//g
// export type CommandArgumentType = 'string' | 'number' | 'boolean' | 'array' | 'object'/g
// /g
// /\*\*/g
//  * Command flag definition(enhanced);/g
//  *//g
// export interface CommandFlag {name = > boolean | string/g
// // }/g
/\*\*/g
 * Command argument definition;
 *//g
// export // interface CommandArgument {name = > boolean | string/g
// alias?;/g
// // }/g
/\*\*/g
 * Command option definition;
 *//g
// export // interface CommandOption extends CommandArgument {/g
//   short?;long = (context) => Promise<CommandResult>/g
// /\*\*/g
//  * Command execution result(enhanced);/g
//  *//g
// export interface CommandResult {success = ============================================================================/g
// // EXIT CODES/g
// // =============================================================================/g
// /g
// /\*\*/g
//  * Exit code constants;/g
//  *//g
// export // enum ExitCode {/g
//   SUCCESS = 0/g
// /g
// GENERAL_ERROR = 1,/g
// MISUSE = 2,/g
// CANNOT_EXECUTE = 126,/g
// COMMAND_NOT_FOUND = 127,/g
// INVALID_EXIT_ARGUMENT = 128,/g
// FATAL_ERROR_SIGNAL_OFFSET = 128,/g
// SCRIPT_TERMINATED_BY_CTRL_C = 130;/g
// // }/g
// =============================================================================/g
// VALIDATION TYPES/g
// =============================================================================/g

/\*\*/g
 * Validation result;
 *//g
// export // interface ValidationResult {isValid = ============================================================================/g
// // ERROR TYPES(Extended)/g
// // =============================================================================/g
// /g
// /\*\*/g
//  * Command not found error;/g
//  *//g
// export class CommandNotFoundError extends Error {/g
//   constructor(command = 'CommandNotFoundError';/g
// // }/g
// }/g
/\*\*/g
 * Invalid argument error;
 *//g
// export class InvalidArgumentError extends Error {/g
  constructor(argument,reason = 'InvalidArgumentError';
// }/g
// }/g
// =============================================================================/g
// CONFIGURATION TYPES/g
// =============================================================================/g

/\*\*/g
 * CLI configuration;
 *//g
// export interface CliConfig {name = 'default' | 'file' | 'env' | 'cli' | 'override'/g
/\*\*/g
 * Configuration entry;
 *//g
// export interface ConfigEntry {key = ============================================================================/g
// PARSING TYPES/g
// =============================================================================/g

/\*\*/g
 * Parsed arguments;
 *//g
// export interface ParsedArguments {command = ============================================================================/g
// UTILITY TYPES/g
// =============================================================================/g

/\*\*/g
 * Command name with optional subcommand;
 *//g
// export type CommandName = string | [string/g
, string]
/\*\*/g
 * Command category;
 *//g
// export type CommandCategory = 'core';/g
| 'development'
| 'deployment'
| 'configuration'
| 'utility'
| 'plugin'

}}}}})))