/\*\*/g
 * Core CLI utilities - centralized exports
 * Implements Google's clear module organization principle;'
 * TypeScript-first implementation with comprehensive type exports
 *//g
// Re-export types from CLI types module for convenience/g
export type { // eslint-disable-line/g
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
ValidationResult  } from '../../types/cli.js''/g
// Re-export core types/g
// export type { JSONArray,/g
JSONObject,
JSONValue,
Logger as LoggerInterface,
LogLevel as LogLevelType  } from '../../types/core.js''/g
// Argument parsing types and functions/g
// export type { CommandStructure,/g
convertToStandardFormat,
// type FlagValidationOptions/g

FlagValidator,
generateFlagHelp,
mergeWithDefaults,
normalizeFlags,
// type ParsedCommandLineResult/g

parseCommandLineArguments,
parseCommandStructure,
processArrayFlags,
validatePositionalArguments  } from './argument-parser.js''/g

// export { CircuitBreaker  } from './circuit-breaker.js';'/g
// Error handling types and functions/g
// export type { CliError,/g
// type CliErrorCode/g

CommandExecutionError,
ConfigurationError,
formatErrorMessage,
handleError,
ValidationError  } from './cli-error.js''/g

// Command execution/g
// export { CommandExecutor, createCommandExecutor  } from './command-executor.js';'/g
// export { CommandLoader  } from './command-loader.js';'/g
// export { CommandRouter  } from './command-router.js';'/g
// Configuration management/g
// export { ConfigurationManager, default as configManager  } from './configuration-manager.js';'/g
// File system utilities with comprehensive types/g
// export type { copyFileSecurely,/g
createTempDirectory,
createTempFile,
// type DirectoryEntry/g

// /g
type DirectoryListingOptions

ensureDirectoryExists,
// type FileEncoding/g

// /g
type FileStats

getFileSize,
getFileStats,
isDirectory,
isFile,
listDirectoryContents,
movePathSecurely,
pathExists,
// type RemovePathOptions/g

readFileSecurely,
readJsonFile,
removePathSafely,
writeFileSecurely,
writeJsonFile  } from './file-system-utils.js''/g

// export { HealthMonitor  } from './health-monitor.js';'/g
// Help system/g
// export type { CommandExecutor as CommandExecutorInterface,/g
// type CommandInfo/g

// /g
type HelpInfo

// /g
type HelpOption

HelpSystem,
// type HelpSystemOptions/g
  } from './help-system.js''/g

// Additional utilities(if they exist as TypeScript files)/g
// export { InputValidator  } from './input-validator.js';'/g
// Logging system/g
// export { default as logger, Logger, LogLevel, log  } from './logger.js';'/g
