/**
 * Utilities - Index
 * Common utilities and helpers
 * Including migrated plugin functionality
 */

export type {
  DocumentIndex,
  DocumentLink,
} from './documentation-linker';
export { DocumentationLinker } from './documentation-linker';
// Core utilities (specific exports to avoid conflicts)
export {
  BaseClaudeZenError,
  FACTError,
  NetworkError,
  RAGError,
  SwarmError,
  SystemError,
  WASMError,
  type ErrorContext
} from './errors';
// Re-export utility types
export type {
  ExportConfig,
  ExportResult,
} from './exporters';
// Export and documentation utilities (migrated from plugins)
export { ExportSystem, ExportUtils } from './exporters';
export * from './helpers';
export * from './logger';
export * from './orchestrator-provider';
export * from './type-guards';
export * from './types';
