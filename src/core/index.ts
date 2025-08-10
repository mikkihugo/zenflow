/**
 * Core Module - Clean Architecture Exports.
 *
 * Central export point for core system functionality with clean, focused architecture.
 * Replaces bloated "Unified" systems with single-responsibility components.
 */

// ==================== CLEAN ARCHITECTURE SYSTEMS ====================
/**
 * @file Core module exports.
 */

export type {
  WorkflowDefinition,
  WorkflowEngineConfig,
  WorkflowState,
} from '../types/workflow-types';
export type { CoreSystemConfig, SystemStatus } from './core-system';
// Main system coordinator
export { CoreSystem } from './core-system';
export type {
  Document,
  DocumentMetadata,
  DocumentProcessorConfig,
  DocumentStats,
  DocumentType,
  DocumentWorkspace,
} from './document-processor';
export { DocumentProcessor } from './document-processor';
export type { DocumentationManagerConfig, DocumentationStats } from './documentation-manager';
export { DocumentationManager } from './documentation-manager';
export type { ExporterDefinition, ExportOptions, ExportResult } from './export-manager';
// Management systems
export { UnifiedExportSystem as ExportManager } from './export-manager';
export type { InterfaceManagerConfig, InterfaceMode, InterfaceStats } from './interface-manager';
export { InterfaceManager } from './interface-manager';
export type {
  BackendStats,
  BackendType,
  JSONValue,
  MemoryConfig,
  StorageResult,
} from './memory-system';
export { MemorySystem } from './memory-system';
// Core processing engines
export { WorkflowEngine } from './workflow-engine';

// ==================== LEGACY COMPATIBILITY ====================

export { ApplicationCoordinator } from './application-coordinator'; // Legacy - use CoreSystem
// Keep these for backward compatibility during transition
export { DocumentDrivenSystem } from './document-driven-system'; // Legacy - use DocumentProcessor
// export { MemoryCoordinator } from './memory-coordinator'; // Module not found - use MemorySystem

// ==================== SHARED UTILITIES ====================

// Types (re-export for convenience) - removed wildcard export to avoid conflicts
// Documentation utilities (legacy)
export type {
  CrossReference as DocumentLink,
  DocumentationIndex as DocumentIndex,
} from './documentation-linker';
// Legacy unified systems (still exported but deprecated)
export { DocumentationIndex as DocumentationLinker } from './documentation-linker';
// Error handling
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
// Core utilities
export { EventBus } from './event-bus';
// ExportManager already exported above as UnifiedExportSystem
// Export utilities (legacy)
export type { ExportConfig, ExportResult as LegacyExportResult } from './exporters';
export { ExportSystem, ExportUtils } from './exporters';
export * from './helpers';
export { InterfaceModeDetector } from './interface-mode-detector';
export type { ILogger, LoggerConfig, LogLevel, LogMeta } from './logger';
// Logging system
export { createLogger, Logger, logger } from './logger';
export { Orchestrator } from './orchestrator';
export * from './orchestrator-provider';
// External systems
export { ProductFlowSystem } from './product-flow-system';
export * from './type-guards';
export * from './types';
