/**
 * Core Module - Clean Architecture Exports
 *
 * Central export point for core system functionality with clean, focused architecture.
 * Replaces bloated "Unified" systems with single-responsibility components.
 */

// ==================== CLEAN ARCHITECTURE SYSTEMS ====================

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
export type { ExportManagerConfig, ExportResult, ExportStats } from './export-manager';
// Management systems
export { ExportManager } from './export-manager';
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
export type {
  DocumentType as WorkflowDocumentType,
  WorkflowDefinition,
  WorkflowEngineConfig,
  WorkflowState,
} from './workflow-engine';
// Core processing engines
export { WorkflowEngine } from './workflow-engine';

// ==================== LEGACY COMPATIBILITY ====================

export { ApplicationCoordinator } from './application-coordinator'; // Legacy - use CoreSystem
// Keep these for backward compatibility during transition
export { DocumentDrivenSystem } from './document-driven-system'; // Legacy - use DocumentProcessor
export { MemoryCoordinator } from './memory-coordinator'; // Legacy - use MemorySystem
export { WorkflowEngine } from './workflow-engine'; // Legacy name kept

// ==================== SHARED UTILITIES ====================

export { ProductWorkflowEngine } from '../coordination/orchestration/product-workflow-engine';
// Types (re-export for convenience)
export type * from '../types/shared-types';
// Documentation utilities (legacy)
export type {
  DocumentIndex,
  DocumentLink,
} from './documentation-linker';
// Legacy unified systems (still exported but deprecated)
export { DocumentationLinker, DocumentationLinker } from './documentation-linker';
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
export { ExportManager } from './export-manager'; // Use ExportManager
// Export utilities (legacy)
export type {
  ExportConfig,
  ExportResult,
} from './exporters';
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
