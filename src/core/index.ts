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
} from '../types/workflow-types.ts';
export type {
  SystemConfig as CoreSystemConfig,
  SystemStatus,
} from './core-system.ts';
// Main system coordinator
export { System as CoreSystem } from './core-system.ts';
export type {
  Document,
  DocumentMetadata,
  DocumentProcessorConfig,
  DocumentStats,
  DocumentType,
  DocumentWorkspace,
} from './document-processor.ts';
export { DocumentProcessor } from './document-processor.ts';
export type {
  DocumentationManagerConfig,
  DocumentationStats,
} from './documentation-manager.ts';
export { DocumentationManager } from './documentation-manager.ts';
export type {
  ExporterDefinition,
  ExportOptions,
  ExportResult,
} from './export-manager.ts';
// Management systems
export { ExportSystem as ExportManager } from './export-manager.ts';
export type {
  InterfaceManagerConfig,
  InterfaceMode,
  InterfaceStats,
} from './interface-manager.ts';
export { InterfaceManager } from './interface-manager.ts';
export type {
  BackendStats,
  BackendType,
  JSONValue,
  MemoryConfig,
  StorageResult,
} from './memory-system.ts';
export { MemorySystem } from './memory-system.ts';
// Core processing engines
export { WorkflowEngine } from '../workflows/workflow-engine.ts';

// ==================== LEGACY COMPATIBILITY ====================

export { ApplicationCoordinator } from './application-coordinator.ts'; // Legacy - use CoreSystem
// Keep these for backward compatibility during transition
export { DocumentDrivenSystem } from './document-driven-system.ts'; // Legacy - use DocumentProcessor
// export { MemoryCoordinator } from './memory-coordinator.ts'; // Module not found - use MemorySystem

// ==================== SHARED UTILITIES ====================

// Types (re-export for convenience) - removed wildcard export to avoid conflicts
// Documentation utilities (legacy)
export type {
  CrossReference as DocumentLink,
  DocumentationIndex as DocumentIndex,
} from './documentation-linker.ts';
// Legacy unified systems (still exported but deprecated)
export { DocumentationIndex as DocumentationLinker } from './documentation-linker.ts';
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
} from './errors.ts';
// Core utilities
export { EventBus } from './event-bus.ts';
// ExportManager already exported above as UnifiedExportSystem
// Export utilities (legacy)
export type {
  ExportConfig,
  ExportResult as LegacyExportResult,
} from './exporters.ts';
export { ExportSystem, ExportUtils } from './exporters.ts';
export * from './helpers.ts';
export { InterfaceModeDetector } from './interface-mode-detector.ts';
export type { ILogger, LoggerConfig, LogLevel } from './logger.ts';
// Logging system
export { createLogger, Logger } from './logger.ts';
export type { LogMeta } from './logger-old';
export { Orchestrator } from './orchestrator.ts';
export * from './orchestrator-provider.ts';
// External systems
export { ProductFlowSystem } from './product-flow-system.ts';
export * from './type-guards.ts';
export * from './types.ts';
