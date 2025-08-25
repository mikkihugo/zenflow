/**
 * Core Module - Clean Architecture Exports.
 *
 * Central export point for core system functionality with clean, focused architecture.
 * Replaces bloated "Unified" systems with single-responsibility components.
 */

// ==================== CLEAN ARCHITECTURE SYSTEMS ====================
/**
 * @file Core mo"ule exports.
 */

// WorkflowDefinition, WorkflowEngineConfig, WorkflowState not available in intelligence facade
export type {
  SystemConfig as CoreSystemConfig,
  SystemStatus,
} from './core-system';
// Main system coordinator
export { System as CoreSystem } from './core-system';
// Document types not available in intelligence facade
// getDocumentProcessor not available in enterprise facade
// DocumentationManagerConfig, DocumentationStats moved from foundation
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
// WorkflowEngine not available in enterprise facade

// ==================== LEGACY COMPATIBILITY ====================

export { ApplicationCoordinator } from './application-coordinator'; // Legacy - use CoreSystem
// Keep these for backward compatibility during transition
// DocumentDrivenSystem package not available // Moved to package - legacy compatibility
// export { MemoryCoordinator } from './memory-coordinator'; // Module not found - use BrainCoordinator

// ==================== SHARED UTILITIES ====================

// Types (re-export for convenience) - removed wildcard export to avoid conflicts
// Documentation utilities (legacy)
// CrossReference, DocumentationIndex not available in intelligence facade
// Legacy unified systems (still exported but deprecated)
// DocumentationIndex not available in intelligence facade
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
export * from '@claude-zen/foundation/helpers';
export { InterfaceModeDetector } from '@claude-zen/interfaces';
export type {
  Logger,
  LoggerConfig,
  LogLevel,
} from '@claude-zen/foundation/logger';
// Logging system
export { createLogger, Logger } from '@claude-zen/foundation/logger';
export type { LogMeta } from '@claude-zen/foundation';
export { Orchestrator } from './orchestrator';
// Orchestrator functionality provided by multi-level-orchestration and teamwork packages via facades
// External systems
export { SafeArtifactIntelligence } from '@claude-zen/document-intelligence';
export * from '@claude-zen/foundation/type-guards';
export * from '@claude-zen/foundation/types';
