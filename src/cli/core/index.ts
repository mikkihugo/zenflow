/**
 * CLI Core Module
 *
 * This module re-exports all core CLI components for convenient importing.
 * Provides the foundation for the command-line interface.
 */

// Re-export commonly used types from CLI types
export type {
  AsyncResult,
  CliConfig,
  CommandConfig,
  CommandContext,
  CommandHandler,
  CommandMetadata,
  CommandRegistry as ICommandRegistry,
  CommandResult,
  CommandValidationResult,
  Result,
} from '../types/index';
// Re-export core interfaces and types
export type { CliAppOptions } from './app';
// Core application components
export { CliApp } from './app';
export { BaseCommand } from './base-command';
export type { CommandPlugin } from './command-registry';
export { CommandRegistry } from './command-registry';
export type {
  ConfigEntry,
  ConfigLoadOptions,
} from './config-loader';
export { ConfigLoader, ConfigSource } from './config-loader';
export type {
  ErrorHandlerConfig,
  ErrorInfo,
} from './error-handler';
export { ErrorCategory, ErrorHandler, ErrorSeverity } from './error-handler';
