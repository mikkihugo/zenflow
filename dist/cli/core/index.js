/**
 * Core CLI utilities - centralized exports
 * Implements Google's clear module organization principle
 */

// Error handling
export {
  CliError,
  ValidationError,
  ConfigurationError,
  CommandExecutionError,
  formatErrorMessage,
  handleError
} from './cli-error.js';

// Argument parsing
export {
  parseCommandLineArguments,
  validatePositionalArguments,
  parseCommandStructure,
  normalizeFlags,
  FlagValidator
} from './argument-parser.js';

// Logging
export { Logger, LogLevel, log } from './logger.js';
export { default as logger } from './logger.js';

// Configuration management
export { ConfigurationManager } from './configuration-manager.js';
export { default as configManager } from './configuration-manager.js';

// Command execution
export { CommandExecutor, createCommandExecutor } from './command-executor.js';

// Help system
export { HelpSystem } from './help-system.js';

// File system utilities
export {
  ensureDirectoryExists,
  pathExists,
  readFileSecurely,
  writeFileSecurely,
  copyFileSecurely,
  listDirectoryContents,
  getFileStats,
  removePathSafely
} from './file-system-utils.js';