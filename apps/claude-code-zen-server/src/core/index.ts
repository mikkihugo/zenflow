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

export type {
	ExporterDefinition,
	ExportOptions,
	ExportResult,
	InterfaceManagerConfig,
	InterfaceMode,
	InterfaceStats,
} from "@claude-zen/foundation";
// Document types not available in intelligence facade
// getDocumentProcessor not available in enterprise facade
// DocumentationManagerConfig, DocumentationStats moved from foundation
// Management systems
export {
	DocumentationManager,
	ExportSystem as ExportManager,
	InterfaceManager,
} from "@claude-zen/foundation";
// WorkflowDefinition, WorkflowEngineConfig, WorkflowState not available in intelligence facade
export type {
	SystemConfig as CoreSystemConfig,
	SystemStatus,
} from "./core-system";
// Main system coordinator
export { System as CoreSystem } from "./core-system";
// Memory types now available via @claude-zen/foundation package
// Memory functionality now available via @claude-zen/foundation Storage and getDatabaseAccess
// Core processing engines
// WorkflowEngine not available in enterprise facade

// ==================== LEGACY COMPATIBILITY ====================

export { ApplicationCoordinator } from "./application-coordinator"; // Legacy - use CoreSystem

// Keep these for backward compatibility during transition
// DocumentDrivenSystem package not available // Moved to package - legacy compatibility
// export { MemoryCoordinator } from './memory-coordinator'; // Module not found - use BrainCoordinator

// ==================== SHARED UTILITIES ====================

// Orchestrator functionality provided by multi-level-orchestration and teamwork packages via facades
// External systems
export { SafeArtifactIntelligence } from "@claude-zen/document-intelligence";
// ExportManager already exported above as UnifiedExportSystem
// Export utilities (legacy)
export type {
	ExportConfig,
	ExportResult as LegacyExportResult,
	LogMeta,
} from "@claude-zen/foundation";
export { ExportSystem, ExportUtils } from "@claude-zen/foundation";
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
} from "@claude-zen/foundation/errors";
export * from "@claude-zen/foundation/helpers";
export type {
	Logger,
	LoggerConfig,
	LogLevel,
} from "@claude-zen/foundation/logger";
// Logging system
export { createLogger, Logger } from "@claude-zen/foundation/logger";
export * from "@claude-zen/foundation/type-guards";
export * from "@claude-zen/foundation/types";
// Core utilities
export { EventBus } from "@claude-zen/intelligence";
export { InterfaceModeDetector } from "@claude-zen/interfaces";
export { Orchestrator } from "./orchestrator";
