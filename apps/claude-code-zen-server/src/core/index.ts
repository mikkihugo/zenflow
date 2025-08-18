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
} from '@claude-zen/workflows';
export type {
  SystemConfig as CoreSystemConfig,
  SystemStatus,
} from './core-system';
// Main system coordinator
export { System as CoreSystem } from './core-system';
export type {
  Document,
  DocumentMetadata,
  DocumentProcessorConfig,
  DocumentStats,
  DocumentType,
  DocumentWorkspace,
} from './document-processor';
export { DocumentProcessor } from './document-processor';
export type {
  DocumentationManagerConfig,
  DocumentationStats,
} from './documentation-manager';
export { DocumentationManager } from './documentation-manager';
export type {
  ExporterDefinition,
  ExportOptions,
  ExportResult,
} from './export-manager';
// Management systems
export { ExportSystem as ExportManager } from './export-manager';
export type {
  InterfaceManagerConfig,
  InterfaceMode,
  InterfaceStats,
} from './interface-manager';
export { InterfaceManager } from './interface-manager';
// Memory types now available via @claude-zen/foundation package  
// Memory functionality now available via @claude-zen/foundation Storage and getDatabaseAccess
// Core processing engines
export { WorkflowEngine } from '../workflows/workflow-engine';

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
} from './errors';
// Core utilities
export { EventBus } from './event-bus';
// ExportManager already exported above as UnifiedExportSystem
// Export utilities (legacy)
export type {
  ExportConfig,
  ExportResult as LegacyExportResult,
} from './exporters';
export { ExportSystem, ExportUtils } from './exporters';
export * from './helpers';
export { InterfaceModeDetector } from './interface-mode-detector';
export type { Logger, LoggerConfig, LogLevel } from './logger';
// Logging system
export { createLogger, Logger } from './logger';
export type { LogMeta } from './logger-old';
export { Orchestrator } from './orchestrator';
export * from './orchestrator-provider';
// External systems
export { ProductFlowSystem } from './product-flow-system';
export * from './type-guards';
export * from './types';
