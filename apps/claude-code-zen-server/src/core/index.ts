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
} from '@claude-zen/intelligence';
export type {
  SystemConfig as CoreSystemConfig,
  SystemStatus,
} from "./core-system";
// Main system coordinator
export { System as CoreSystem } from "./core-system";
export type {
  Document,
  DocumentMetadata,
  DocumentProcessorConfig,
  DocumentStats,
  DocumentType,
  DocumentWorkspace,
} from '@claude-zen/intelligence';
export { getDocumentProcessor } from '@claude-zen/enterprise';
export type {
  DocumentationManagerConfig,
  DocumentationStats,
} from '@claude-zen/foundation';
export { DocumentationManager } from '@claude-zen/foundation';
export type {
  ExporterDefinition,
  ExportOptions,
  ExportResult,
} from '@claude-zen/foundation';
// Management systems
export { ExportSystem as ExportManager } from '@claude-zen/foundation';
export type {
  InterfaceManagerConfig,
  InterfaceMode,
  InterfaceStats,
} from '@claude-zen/foundation';
export { InterfaceManager } from '@claude-zen/foundation';
// Memory types now available via @claude-zen/foundation package
// Memory functionality now available via @claude-zen/foundation Storage and getDatabaseAccess
// Core processing engines
export { WorkflowEngine } from '@claude-zen/enterprise';

// ==================== LEGACY COMPATIBILITY ====================

export { ApplicationCoordinator } from "./application-coordinator"; // Legacy - use CoreSystem
// Keep these for backward compatibility during transition
export { DocumentDrivenSystem } from '@claude-zen/document-processing'; // Moved to package - legacy compatibility
// export { MemoryCoordinator } from "./memory-coordinator'; // Module not found - use BrainCoordinator

// ==================== SHARED UTILITIES ====================

// Types (re-export for convenience) - removed wildcard export to avoid conflicts
// Documentation utilities (legacy)
export type {
  CrossReference as DocumentLink,
  DocumentationIndex as DocumentIndex,
} from '@claude-zen/intelligence';
// Legacy unified systems (still exported but deprecated)
export { DocumentationIndex as DocumentationLinker } from '@claude-zen/intelligence';
// Error handling
export {
  BaseClaudeZenError,
  type ErrorContext,
  FACTError,
  NetworkError,
  RAGError,
  SwarmError,
} from '@claude-zen/foundation/errors';
// Core utilities
export { EventBus } from '@claude-zen/intelligence';
// ExportManager already exported above as UnifiedExportSystem
// Export utilities (legacy)
export type {
  ExportConfig,
  ExportResult as LegacyExportResult,
} from '@claude-zen/foundation';
export { ExportSystem, ExportUtils } from '@claude-zen/foundation';
export * from '@claude-zen/foundation/helpers');
export { InterfaceModeDetector } from '@claude-zen/interfaces';
export type {
  Logger,
  LoggerConfig,
  LogLevel,
} from '@claude-zen/foundation/logger';
// Logging system
export { createLogger, Logger } from '@claude-zen/foundation/logger';
export type { LogMeta } from '@claude-zen/foundation';
export { Orchestrator } from "./orchestrator";
export * from '@claude-zen/foundation/orchestrator-provider');
// External systems
export { ProductFlowSystem } from '@claude-zen/document-processing';
export * from '@claude-zen/foundation/type-guards');
export * from '@claude-zen/foundation/types');
