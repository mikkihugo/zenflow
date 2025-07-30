/**
 * CLI Types
 * Type definitions for command-line interface components
 */

import type { JSONObject } from './core.js';

// =============================================================================
// CLI ERROR TYPES
// =============================================================================

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

// =============================================================================
// COMMAND DEFINITIONS
// =============================================================================

/**
 * Command argument types
 */
export type CommandArgumentType = 'string' | 'number' | 'boolean' | 'array' | 'object';

/**
 * Command argument definition
 */
export interface CommandArgument {
  name: string;
  type: CommandArgumentType;
  description: string;
  required?: boolean;
  default?: any;
  choices?: string[];
  validator?: (value: any) => boolean | string;
  alias?: string;
}

/**
 * Command option definition
 */
export interface CommandOption extends CommandArgument {
  short?: string;
  long: string;
  flag?: boolean;
}

/**
 * Command context
 */
export interface CommandContext {
  command: string;
  arguments: Record<string, any>;
  options: Record<string, any>;
  rawArgs: string[];
  cwd: string;
  env: Record<string, string>;
  logger: ErrorLogger;
  config: JSONObject;
}

/**
 * Command handler function
 */
export type CommandHandler = (context: CommandContext) => Promise<number | void>;

/**
 * Command execution result
 */
export interface CommandResult {
  exitCode: number;
  output?: string;
  errors?: string[];
  duration: number;
  success: boolean;
}

/**
 * Command definition
 */
export interface CommandDefinition {
  name: string;
  description: string;
  usage?: string;
  examples?: string[];
  arguments?: CommandArgument[];
  options?: CommandOption[];
  subcommands?: CommandDefinition[];
  handler: CommandHandler;
  aliases?: string[];
  category?: string;
  hidden?: boolean;
  deprecated?: boolean;
  version?: string;
}

// =============================================================================
// EXIT CODES
// =============================================================================

/**
 * Exit code constants
 */
export enum ExitCode {
  SUCCESS = 0,
  GENERAL_ERROR = 1,
  MISUSE = 2,
  CANNOT_EXECUTE = 126,
  COMMAND_NOT_FOUND = 127,
  INVALID_EXIT_ARGUMENT = 128,
  FATAL_ERROR_SIGNAL_OFFSET = 128,
  SCRIPT_TERMINATED_BY_CTRL_C = 130
}

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

/**
 * CLI configuration
 */
export interface CliConfig {
  name: string;
  version: string;
  description: string;
  author?: string;
  license?: string;
  
  // Behavior settings
  exitOnError: boolean;
  colorOutput: boolean;
  verboseOutput: boolean;
  suppressWarnings: boolean;
  
  // Help system
  helpCommand: string;
  versionCommand: string;
  generateCompletion: boolean;
  
  // Logging
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  logFile?: string;
  
  // Global options
  globalOptions: CommandOption[];
}

/**
 * Configuration source
 */
export type ConfigSource = 'default' | 'file' | 'env' | 'cli' | 'override';

/**
 * Configuration entry
 */
export interface ConfigEntry {
  key: string;
  value: any;
  source: ConfigSource;
  priority: number;
  description?: string;
}

// =============================================================================
// PARSING TYPES
// =============================================================================

/**
 * Parsed arguments
 */
export interface ParsedArguments {
  command: string;
  subcommand?: string;
  arguments: Record<string, any>;
  options: Record<string, any>;
  flags: string[];
  unknown: string[];
  errors: string[];
}

/**
 * Argument parser configuration
 */
export interface ArgumentParserConfig {
  allowUnknownOptions: boolean;
  stopAtFirstUnknown: boolean;
  ignoreCase: boolean;
  dashesDenoteOptions: boolean;
  allowPositionalAfterOptions: boolean;
}

/**
 * Argument validation result
 */
export interface ArgumentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  normalized: Record<string, any>;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Command name with optional subcommand
 */
export type CommandName = string | [string, string];

/**
 * Command category
 */
export type CommandCategory = 'core' | 'development' | 'deployment' | 'configuration' | 'utility' | 'plugin';