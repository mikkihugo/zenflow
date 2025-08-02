/**
 * Core Module - Barrel Export
 *
 * Central export point for core system functionality and utilities.
 */

// Types (re-export for convenience)
export type * from '../types/shared-types';
export { DocumentDrivenSystem } from './document-driven-system';

// Core components
export { EventBus } from './event-bus';
export { InterfaceModeDetector } from './interface-mode-detector';
export { createLogger } from './logger';
export { Orchestrator } from './orchestrator';

// Unified systems
export { UnifiedCoreSystem } from './unified-core-system';
export { UnifiedDocumentationLinker } from './unified-documentation-linker';
export { UnifiedExportSystem } from './unified-export-system';
export { UnifiedMemorySystem } from './unified-memory-system';
export { UnifiedWorkflowEngine } from './unified-workflow-engine';

// Utilities
export type {
  DocumentIndex,
  DocumentLink,
} from './documentation-linker';
export { DocumentationLinker } from './documentation-linker';
export {
  BaseClaudeZenError,
  type ErrorContext,
  FACTError,
  NetworkError,
  RAGError,
  SwarmError,
  SystemError,
  WASMError,
} from './errors';
export type {
  ExportConfig,
  ExportResult,
} from './exporters';
export { ExportSystem, ExportUtils } from './exporters';
export * from './helpers';
export * from './orchestrator-provider';
export * from './type-guards';
export * from './types';