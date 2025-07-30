/**
 * Core CLI utilities - centralized exports
 * Implements Google's clear module organization principle;
 * TypeScript-first implementation with comprehensive type exports
 */
// Re-export types from CLI types module for convenience
export type {
  ArgumentParserConfig,
ArgumentValidationResult,
CliConfig,
CliErrorCode as ErrorCode,
CommandArgument,
CommandCategory,
CommandContext,
CommandDefinition,
CommandFlag,
CommandHandler,
CommandOption,
CommandRegistry,
CommandResult,
ExitCode,
ParsedArguments,
ValidationResult,
} from '../../types/cli.js'
// Re-export core types
export type {
  JSONArray,
JSONObject,
JSONValue,
Logger as LoggerInterface,
LogLevel as LogLevelType,
} from '../../types/core.js'
// Argument parsing types and functions
export type {
  CommandStructure,
convertToStandardFormat,
type FlagValidationOptions
,
FlagValidator,
generateFlagHelp,
mergeWithDefaults,
normalizeFlags,
type ParsedCommandLineResult
,
parseCommandLineArguments,
parseCommandStructure,
processArrayFlags,
validatePositionalArguments,
} from './argument-parser.js'

export { CircuitBreaker } from './circuit-breaker.js';
// Error handling types and functions
export type {
  CliError,
type CliErrorCode
,
CommandExecutionError,
ConfigurationError,
formatErrorMessage,
handleError,
ValidationError,
} from './cli-error.js'

// Command execution
export { CommandExecutor, createCommandExecutor } from './command-executor.js';
export { CommandLoader } from './command-loader.js';
export { CommandRouter } from './command-router.js';
// Configuration management
export { ConfigurationManager, default as configManager } from './configuration-manager.js';
// File system utilities with comprehensive types
export type {
  copyFileSecurely,
createTempDirectory,
createTempFile,
type DirectoryEntry
,
type DirectoryListingOptions
,
ensureDirectoryExists,
type FileEncoding
,
type FileStats
,
getFileSize,
getFileStats,
isDirectory,
isFile,
listDirectoryContents,
movePathSecurely,
pathExists,
type RemovePathOptions
,
readFileSecurely,
readJsonFile,
removePathSafely,
writeFileSecurely,
writeJsonFile,
} from './file-system-utils.js'

export { HealthMonitor } from './health-monitor.js';
// Help system
export type {
  CommandExecutor as CommandExecutorInterface,
type CommandInfo
,
type HelpInfo
,
type HelpOption
,
HelpSystem,
type HelpSystemOptions
,
} from './help-system.js'

// Additional utilities (if they exist as TypeScript files)
export { InputValidator } from './input-validator.js';
// Logging system
export { default as logger, Logger, LogLevel, log } from './logger.js';
