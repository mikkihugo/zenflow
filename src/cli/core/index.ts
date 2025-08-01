/**
 * CLI Core Module
 * 
 * This module re-exports all core CLI components for convenient importing.
 * Provides the foundation for the command-line interface.
 */

// Core application components
export { CliApp } from './app';
export { CommandRegistry } from './command-registry';
export { BaseCommand } from './base-command';
export { ErrorHandler } from './error-handler';
export { ConfigLoader } from './config-loader';

// Re-export commonly used types from CLI types
export type {
  CommandConfig,
  CommandContext,
  CommandResult,
  CommandHandler,
  CommandMetadata,
  CommandValidationResult,
  CommandRegistry as ICommandRegistry,
  CliConfig,
  Result,
  AsyncResult
} from '../types/index';

// Re-export core interfaces and types
export type { CliAppOptions } from './app';
export type { CommandPlugin } from './command-registry';
export type { 
  ErrorInfo, 
  ErrorHandlerConfig 
} from './error-handler';
export type { 
  ConfigLoadOptions, 
  ConfigEntry 
} from './config-loader';

export { ErrorSeverity, ErrorCategory } from './error-handler';
export { ConfigSource } from './config-loader';